"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import L from "leaflet"
import { 
  type BusState, 
  type BusStop, 
  stops, 
  CAMPUS_ROAD_WAYPOINTS, 
  NPRU_CENTER,
  NPRU_BOUNDS,
  NPRU_CAMPUS_POLYGON,
  CAMPUS_LANDMARKS,
  calcEtaSeconds,
  formatTime,
  formatMinutes,
  calculateDistanceMeters,
  FACILITY_MAP
} from "@/lib/bus-data"
import { 
  Layers, 
  Navigation, 
  Maximize2, 
  Minimize2, 
  RotateCcw, 
  Bus as BusIcon, 
  MapPin, 
  Search, 
  Sparkles,
  Volume2,
  VolumeX,
  Battery,
  Users,
  Gauge,
  Compass,
  LocateFixed,
  Info
} from "lucide-react"

interface LeafletMapProps {
  buses: BusState[]
  selectedBusId: number | null
  onSelectBus: (busId: number) => void
  selectedStopId: number | null
  onSelectStop: (stopId: number) => void
  isSimulating: boolean
  onToggleSimulation: () => void
  simulationSpeed: number
  onChangeSimSpeed: (speed: number) => void
}

type MapLayerType = "osm" | "satellite" | "voyager"

export default function LeafletMap({
  buses,
  selectedBusId,
  onSelectBus,
  selectedStopId,
  onSelectStop,
  isSimulating,
  onToggleSimulation,
  simulationSpeed,
  onChangeSimSpeed,
}: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const tileLayerRef = useRef<L.TileLayer | null>(null)
  const busMarkersRef = useRef<Map<number, L.Marker>>(new Map())
  const stopMarkersRef = useRef<Map<number, L.Marker>>(new Map())
  const userMarkerRef = useRef<L.Marker | null>(null)
  const userAccuracyCircleRef = useRef<L.Circle | null>(null)
  const routePolylineRef = useRef<L.Polyline | null>(null)
  const routeGlowPolylineRef = useRef<L.Polyline | null>(null)

  const [mapLayer, setMapLayer] = useState<MapLayerType>("osm")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; accuracy: number } | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [nearestStop, setNearestStop] = useState<{ stop: BusStop; distance: number; walkTime: number } | null>(null)

  // Map Tile Providers
  const tileLayers: Record<MapLayerType, { url: string; attribution: string; maxZoom: number }> = {
    osm: {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    },
    satellite: {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
      maxZoom: 19,
    },
    voyager: {
      url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 20,
    },
  }

  // 1. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return

    const map = L.map(mapContainerRef.current, {
      center: [NPRU_CENTER.lat, NPRU_CENTER.lng],
      zoom: NPRU_CENTER.zoom,
      minZoom: 15.5,
      maxZoom: 19,
      zoomControl: false,
      maxBounds: NPRU_BOUNDS,
      maxBoundsViscosity: 1.0,
    })

    // Custom zoom control in bottom right
    L.control.zoom({ position: "bottomright" }).addTo(map)

    // Add Tile Layer
    const currentConfig = tileLayers[mapLayer]
    const tileLayer = L.tileLayer(currentConfig.url, {
      attribution: currentConfig.attribution,
      maxZoom: currentConfig.maxZoom,
    }).addTo(map)

    tileLayerRef.current = tileLayer
    mapInstanceRef.current = map

    // 2. Add Outer Shading Mask (Dim world outside NPRU Campus to focus only on University)
    const worldOuterBounds: [number, number][] = [
      [13.800, 100.000],
      [13.800, 100.060],
      [13.870, 100.060],
      [13.870, 100.000],
    ]
    
    L.polygon([worldOuterBounds, NPRU_CAMPUS_POLYGON], {
      color: "#0f172a",
      weight: 0,
      fillColor: "#0f172a",
      fillOpacity: 0.15,
      interactive: false,
    }).addTo(map)

    // 3. Draw Campus Perimeter Boundary Polygon (ขอบเขตรั้ว มรภ.นครปฐม)
    const campusPolygon = L.polygon(NPRU_CAMPUS_POLYGON, {
      color: "#059669",
      weight: 2.5,
      dashArray: "6, 6",
      fillColor: "#10B981",
      fillOpacity: 0.04,
    }).addTo(map)

    campusPolygon.bindTooltip("🏫 มหาวิทยาลัยราชภัฏนครปฐม (NPRU Campus Area)", {
      permanent: false,
      direction: "center",
      className: "campus-tooltip",
    })

    // 4. Add Campus Landmarks / Buildings
    CAMPUS_LANDMARKS.forEach((lm) => {
      const lmIcon = L.divIcon({
        className: "custom-landmark-marker",
        html: `
          <div class="flex items-center gap-1 bg-white/90 backdrop-blur-sm border border-slate-300 shadow-sm px-1.5 py-0.5 rounded-md text-[10px] font-semibold text-slate-700 pointer-events-none select-none opacity-80 hover:opacity-100 whitespace-nowrap">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            ${lm.name}
          </div>
        `,
        iconSize: [120, 20],
        iconAnchor: [60, 10],
      })
      L.marker([lm.lat, lm.lng], { icon: lmIcon, interactive: false }).addTo(map)
    })

    // 5. Draw Polyline Route on NPRU Campus (100% Inside Campus Roads - Red Line)
    const glowLine = L.polyline(CAMPUS_ROAD_WAYPOINTS, {
      color: "#e63462",
      weight: 10,
      opacity: 0.3,
      lineCap: "round",
      lineJoin: "round",
    }).addTo(map)
    routeGlowPolylineRef.current = glowLine

    const mainLine = L.polyline(CAMPUS_ROAD_WAYPOINTS, {
      color: "#e63462",
      weight: 5,
      opacity: 0.95,
      dashArray: "8, 8",
      lineCap: "round",
      lineJoin: "round",
    }).addTo(map)
    routePolylineRef.current = mainLine

    // 6. Add Stop Markers
    stops.forEach((stop) => {
      const stopIcon = L.divIcon({
        className: "custom-stop-marker-wrapper",
        html: `
          <div class="relative flex items-center justify-center cursor-pointer group transition-transform duration-200 hover:scale-125">
            <div class="w-8 h-8 rounded-full bg-white border-2 border-[#e63462] shadow-md flex items-center justify-center font-bold text-xs text-[#e63462] group-hover:bg-[#e63462] group-hover:text-white transition-colors">
              ${stop.code}
            </div>
            <div class="absolute -bottom-6 whitespace-nowrap bg-slate-900/85 backdrop-blur-sm text-white text-[11px] font-medium px-2 py-0.5 rounded shadow pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
              ${stop.name}
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      })

      const marker = L.marker([stop.lat, stop.lng], { icon: stopIcon })
        .addTo(map)
        .on("click", () => {
          onSelectStop(stop.id)
        })

      stopMarkersRef.current.set(stop.id, marker)
    })

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  // Switch Tile Layer
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return

    mapInstanceRef.current.removeLayer(tileLayerRef.current)
    const newConfig = tileLayers[mapLayer]
    const newTileLayer = L.tileLayer(newConfig.url, {
      attribution: newConfig.attribution,
      maxZoom: newConfig.maxZoom,
    }).addTo(mapInstanceRef.current)

    tileLayerRef.current = newTileLayer
  }, [mapLayer])

  // Update Bus Markers on real GPS coordinates
  useEffect(() => {
    if (!mapInstanceRef.current) return
    const map = mapInstanceRef.current

    buses.forEach((bus) => {
      const isSelected = selectedBusId === bus.id
      const color = bus.id === 1 ? "#E53935" : bus.id === 2 ? "#F59E0B" : "#8B5CF6"
      const statusBg = bus.isDwelling ? "bg-amber-500" : "bg-emerald-500"

      const busHtml = `
        <div class="relative flex items-center justify-center cursor-pointer transition-transform duration-300" style="transform: scale(${isSelected ? 1.25 : 1});">
          <!-- Pulse Radar Wave -->
          <div class="absolute w-12 h-12 rounded-full bus-radar-pulse" style="background-color: ${color};"></div>
          
          <!-- Bus Marker Body -->
          <div class="relative flex items-center justify-center w-10 h-10 rounded-full bg-slate-900 border-2 border-white shadow-xl text-white font-black text-xs z-10" style="box-shadow: 0 0 15px ${color};">
            <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M8 6v6"></path>
              <path d="M15 6v6"></path>
              <path d="M2 12h19.6"></path>
              <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.6 19 6 17.8 6H5.2C4 6 2.9 6.6 2.6 7.8L1.2 12.8c-.1.4-.2.8-.2 1.2 0 .4.1.8.2 1.2.3 1.1.8 2.8.8 2.8h3"></path>
              <circle cx="7" cy="18" r="2"></circle>
              <circle cx="17" cy="18" r="2"></circle>
            </svg>
            <span class="absolute -top-2 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-black text-white ${statusBg} border border-white">
              ${bus.id}
            </span>
          </div>

          <!-- Label Tag -->
          <div class="absolute -bottom-6 whitespace-nowrap bg-slate-900/90 text-white font-bold text-[10px] px-2 py-0.5 rounded-full border border-slate-700 shadow-md flex items-center gap-1 z-20">
            <span class="w-1.5 h-1.5 rounded-full ${bus.isDwelling ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}"></span>
            ${bus.speed} km/h · ${bus.battery}%
          </div>
        </div>
      `

      let marker = busMarkersRef.current.get(bus.id)
      if (!marker) {
        const busIcon = L.divIcon({
          className: "custom-bus-marker-wrapper",
          html: busHtml,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        })

        marker = L.marker([bus.currentLat, bus.currentLng], { icon: busIcon, zIndexOffset: 1000 })
          .addTo(map)
          .on("click", () => {
            onSelectBus(bus.id)
          })

        busMarkersRef.current.set(bus.id, marker)
      } else {
        marker.setLatLng([bus.currentLat, bus.currentLng])
        marker.setIcon(
          L.divIcon({
            className: "custom-bus-marker-wrapper",
            html: busHtml,
            iconSize: [40, 40],
            iconAnchor: [20, 20],
          })
        )
      }
    })
  }, [buses, selectedBusId, onSelectBus])

  // Update Stop Popups and Active State
  useEffect(() => {
    if (!mapInstanceRef.current) return

    stops.forEach((stop, index) => {
      const marker = stopMarkersRef.current.get(stop.id)
      if (!marker) return

      const isSelected = selectedStopId === stop.id
      const etaList = buses.map((bus) => {
        const eta = calcEtaSeconds(bus, index)
        return {
          bus,
          etaSeconds: eta,
          text: eta === null ? "--" : eta === 0 ? "ถึงแล้ว (กำลังจอด)" : `${formatMinutes(eta)} นาที (${formatTime(eta)})`,
        }
      })

      // Generate HTML for Stop Popup
      const popupHtml = `
        <div class="p-3.5 max-w-[280px] text-slate-800 font-sans">
          <div class="flex items-center justify-between gap-2 border-b border-slate-100 pb-2 mb-2.5">
            <div class="flex items-center gap-2">
              <span class="w-7 h-7 rounded-lg bg-[#e63462] text-white font-bold text-xs flex items-center justify-center shadow-sm">
                ${stop.code}
              </span>
              <div>
                <h4 class="font-bold text-sm text-slate-900 leading-tight">${stop.name}</h4>
                <p class="text-[11px] text-slate-500">${stop.nameEn}</p>
              </div>
            </div>
          </div>

          <p class="text-[11px] text-slate-600 mb-2.5 bg-slate-50 p-2 rounded-lg border border-slate-100">
            📍 <strong>สถานที่:</strong> ${stop.building}<br/>
            ℹ️ ${stop.description}
          </p>

          <div class="space-y-1.5 mb-2.5">
            <div class="text-[11px] font-bold text-slate-700 flex items-center justify-between">
              <span>⚡ เวลาที่รถจะมาถึง (ETA):</span>
            </div>
            ${etaList
              .map(
                (item) => `
                <div class="flex items-center justify-between text-xs py-1 px-2 rounded-md ${
                  item.bus.id === 1 ? 'bg-red-50 text-red-900' : item.bus.id === 2 ? 'bg-amber-50 text-amber-900' : 'bg-purple-50 text-purple-900'
                }">
                  <span class="font-semibold">คันที่ ${item.bus.id}</span>
                  <span class="font-bold tabular-nums">${item.text}</span>
                </div>
              `
              )
              .join("")}
          </div>

          <div class="pt-2 border-t border-slate-100">
            <p class="text-[10px] font-bold text-slate-500 mb-1">สิ่งอำนวยความสะดวกใกล้เคียง:</p>
            <div class="flex flex-wrap gap-1">
              ${stop.facilities
                .map(
                  (f) => `
                <span class="inline-block px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px]">
                  ${f}
                </span>
              `
                )
                .join("")}
            </div>
          </div>
        </div>
      `

      marker.bindPopup(popupHtml, {
        className: "custom-leaflet-popup",
        offset: [0, -10],
      })

      if (isSelected) {
        marker.openPopup()
      }
    })
  }, [buses, selectedStopId])

  // Center on Selected Stop
  useEffect(() => {
    if (!mapInstanceRef.current || selectedStopId === null) return
    const targetStop = stops.find((s) => s.id === selectedStopId)
    if (targetStop) {
      mapInstanceRef.current.flyTo([targetStop.lat, targetStop.lng], 18, {
        animate: true,
        duration: 1.2,
      })
    }
  }, [selectedStopId])

  // Center on Selected Bus
  useEffect(() => {
    if (!mapInstanceRef.current || selectedBusId === null) return
    const targetBus = buses.find((b) => b.id === selectedBusId)
    if (targetBus) {
      mapInstanceRef.current.flyTo([targetBus.currentLat, targetBus.currentLng], 18, {
        animate: true,
        duration: 1.0,
      })
    }
  }, [selectedBusId, buses])

  // Locate User GPS
  const handleLocateUser = useCallback(() => {
    if (!navigator.geolocation) {
      alert("อุปกรณ์ของคุณไม่รองรับการระบุตำแหน่ง GPS")
      return
    }

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords
        setUserLocation({ lat: latitude, lng: longitude, accuracy })
        setIsLocating(false)

        if (mapInstanceRef.current) {
          const map = mapInstanceRef.current

          // Remove previous user markers
          if (userMarkerRef.current) map.removeLayer(userMarkerRef.current)
          if (userAccuracyCircleRef.current) map.removeLayer(userAccuracyCircleRef.current)

          // Add Accuracy Circle
          const circle = L.circle([latitude, longitude], {
            radius: Math.min(accuracy, 100),
            color: "#3B82F6",
            fillColor: "#60A5FA",
            fillOpacity: 0.15,
            weight: 1.5,
          }).addTo(map)
          userAccuracyCircleRef.current = circle

          // Add User Marker
          const userIcon = L.divIcon({
            className: "user-gps-marker",
            html: `
              <div class="relative flex items-center justify-center">
                <div class="w-6 h-6 rounded-full bg-blue-500/30 animate-ping absolute"></div>
                <div class="w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-lg z-10"></div>
              </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          })

          const marker = L.marker([latitude, longitude], { icon: userIcon, zIndexOffset: 2000 })
            .addTo(map)
            .bindPopup(`
              <div class="p-2 text-xs text-slate-800">
                <p class="font-bold text-blue-600 mb-0.5">📍 ตำแหน่งของคุณ</p>
                <p class="text-slate-500">ความแม่นยำ ~${Math.round(accuracy)} เมตร</p>
              </div>
            `)
          userMarkerRef.current = marker

          // Calculate Nearest Stop
          if (stops && stops.length > 0) {
            let minDistance = Infinity
            let closest = stops[0]
            stops.forEach((s) => {
              const dist = calculateDistanceMeters(latitude, longitude, s.lat, s.lng)
              if (dist < minDistance) {
                minDistance = dist
                closest = s
              }
            })

            const walkMins = Math.max(1, Math.round(minDistance / 75)) // 75m per min walk
            setNearestStop({ stop: closest, distance: minDistance, walkTime: walkMins })
          }

          map.flyTo([latitude, longitude], 17.5, { animate: true, duration: 1.2 })
        }
      },
      (error) => {
        setIsLocating(false)
        console.warn("Geolocation fallback to NPRU center:", error.message)
        // Fallback simulated location inside NPRU Gate 1 for demo
        const fakeLat = 13.8355
        const fakeLng = 100.0282
        setUserLocation({ lat: fakeLat, lng: fakeLng, accuracy: 15 })

        if (mapInstanceRef.current) {
          const map = mapInstanceRef.current
          if (userMarkerRef.current) map.removeLayer(userMarkerRef.current)
          const userIcon = L.divIcon({
            className: "user-gps-marker",
            html: `
              <div class="relative flex items-center justify-center">
                <div class="w-6 h-6 rounded-full bg-blue-500/30 animate-ping absolute"></div>
                <div class="w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-lg z-10"></div>
              </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          })
          userMarkerRef.current = L.marker([fakeLat, fakeLng], { icon: userIcon }).addTo(map)

          if (stops && stops.length > 0) {
            let minDistance = Infinity
            let closest = stops[0]
            stops.forEach((s) => {
              const dist = calculateDistanceMeters(fakeLat, fakeLng, s.lat, s.lng)
              if (dist < minDistance) {
                minDistance = dist
                closest = s
              }
            })
            setNearestStop({ stop: closest, distance: minDistance, walkTime: Math.max(1, Math.round(minDistance / 75)) })
          }
          map.flyTo([fakeLat, fakeLng], 17.5, { animate: true })
        }
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 }
    )
  }, [])

  // Reset View to Campus Bounds
  const handleResetCampusView = useCallback(() => {
    if (!mapInstanceRef.current) return
    mapInstanceRef.current.flyTo([NPRU_CENTER.lat, NPRU_CENTER.lng], NPRU_CENTER.zoom, {
      animate: true,
      duration: 1.0,
    })
  }, [])

  // Filtered search stops
  const filteredStops = stops.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.building.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.facilities.some((f) => f.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 ${isFullscreen ? "fixed inset-0 z-[9999] rounded-none" : "h-[540px] lg:h-[620px]"}`}>
      {/* Top Map Header & Controls */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Search Input */}
        <div className="relative pointer-events-auto w-full sm:w-72 max-w-full">
          <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-lg border border-slate-200/80 text-sm">
            <Search className="h-4 w-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="ค้นหาจุดจอด / คณะ / อาคาร มรภ.นครปฐม..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setShowSearchDropdown(true)
              }}
              onFocus={() => setShowSearchDropdown(true)}
              className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
            />
            {searchQuery && (
              <button 
                onClick={() => {
                  setSearchQuery("")
                  setShowSearchDropdown(false)
                }}
                className="text-xs text-slate-400 hover:text-slate-600 font-bold px-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* Search Dropdown */}
          {showSearchDropdown && searchQuery && (
            <div className="absolute top-full mt-1.5 left-0 right-0 max-h-60 overflow-y-auto rounded-xl bg-white shadow-xl border border-slate-200 divide-y divide-slate-100 z-50">
              {filteredStops.length > 0 ? (
                filteredStops.map((stop) => (
                  <button
                    key={stop.id}
                    onClick={() => {
                      onSelectStop(stop.id)
                      setShowSearchDropdown(false)
                      setSearchQuery(stop.name)
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-xs text-slate-900 flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-[#e63462]/10 text-[#e63462] font-bold text-[10px]">
                          {stop.code}
                        </span>
                        {stop.name}
                      </div>
                      <p className="text-[11px] text-slate-500">{stop.building}</p>
                    </div>
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  </button>
                ))
              ) : (
                <div className="p-3 text-center text-xs text-slate-500">
                  ไม่พบจุดจอดหรืออาคารที่ตรงกับคำค้นหา
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons (Right) */}
        <div className="flex items-center gap-1.5 pointer-events-auto ml-auto">
          {/* NPRU Campus Indicator Pill */}
          <div className="hidden md:flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md text-white px-3 py-1.5 rounded-xl shadow-lg border border-slate-700 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold text-[11px]">แผนที่ภายใน มรภ.นครปฐม (NPRU Campus)</span>
          </div>

          {/* Layer Selector */}
          <div className="flex items-center bg-white/95 backdrop-blur-md p-1 rounded-xl shadow-lg border border-slate-200/80 text-xs">
            <button
              onClick={() => setMapLayer("osm")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                mapLayer === "osm" ? "bg-[#e63462] text-white shadow-sm font-semibold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              แผนที่
            </button>
            <button
              onClick={() => setMapLayer("satellite")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                mapLayer === "satellite" ? "bg-[#e63462] text-white shadow-sm font-semibold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              ดาวเทียม
            </button>
            <button
              onClick={() => setMapLayer("voyager")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                mapLayer === "voyager" ? "bg-[#e63462] text-white shadow-sm font-semibold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              คลีน
            </button>
          </div>

          {/* Locate Me */}
          <button
            onClick={handleLocateUser}
            disabled={isLocating}
            title="ค้นหาตำแหน่งของฉัน"
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/95 backdrop-blur-md text-slate-700 hover:text-[#e63462] shadow-lg border border-slate-200/80 transition-transform active:scale-95"
          >
            <LocateFixed className={`h-4 w-4 ${isLocating ? "animate-spin text-[#e63462]" : ""}`} />
          </button>

          {/* Reset Campus View */}
          <button
            onClick={handleResetCampusView}
            title="มุมมองรวม มรภ.นครปฐม"
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/95 backdrop-blur-md text-slate-700 hover:text-[#e63462] shadow-lg border border-slate-200/80 transition-transform active:scale-95"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "ย่อหน้าต่าง" : "เต็มจอ"}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/95 backdrop-blur-md text-slate-700 hover:text-[#e63462] shadow-lg border border-slate-200/80 transition-transform active:scale-95"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Real-time Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Nearest Stop Badge (if located) */}
      {nearestStop && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-slate-900/90 backdrop-blur-md text-white px-3.5 py-2.5 rounded-xl shadow-xl border border-slate-700 max-w-xs animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
              จุดจอดที่ใกล้คุณที่สุด
            </span>
            <button 
              onClick={() => setNearestStop(null)} 
              className="text-slate-400 hover:text-white text-xs font-bold"
            >
              ✕
            </button>
          </div>
          <p className="font-bold text-xs text-white flex items-center gap-1.5">
            <span className="w-5 h-5 rounded bg-[#e63462] text-[10px] flex items-center justify-center font-bold">
              {nearestStop.stop.code}
            </span>
            {nearestStop.stop.name}
          </p>
          <div className="flex items-center gap-3 text-[11px] text-slate-300 mt-1.5 pt-1.5 border-t border-slate-700/60">
            <span>📏 ห่าง ~{nearestStop.distance} เมตร</span>
            <span>🚶 เดิน ~{nearestStop.walkTime} นาที</span>
          </div>
        </div>
      )}

      {/* Live Map Legend & Bus Quick Switcher (Bottom Left) */}
      <div className="absolute bottom-4 left-4 z-[1000] hidden sm:flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg border border-slate-200/80 text-[11px]">
        <span className="flex items-center gap-1.5 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          วิ่งเฉพาะภายใน มรภ.นครปฐม 100%
        </span>
        <span className="text-slate-400">|</span>
        <span className="flex items-center gap-1 text-slate-600 font-medium">
          <span className="w-3 h-0.5 bg-[#e63462] inline-block rounded"></span>
          เส้นทาง EV Shuttle
        </span>
        <span className="flex items-center gap-1 text-slate-600 font-medium">
          <span className="w-3 h-2 border border-dashed border-emerald-500 bg-emerald-500/10 inline-block rounded-sm"></span>
          แนวเขตรั้วมหาวิทยาลัย
        </span>
      </div>

      {/* Live Map Bus Quick Switcher (Bottom Right) */}
      <div className="absolute bottom-4 right-14 z-[1000] hidden sm:flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-2 rounded-xl shadow-lg border border-slate-200/80 text-xs">
        <span className="font-bold text-slate-700 text-[11px] mr-1">ติดตามคันที่:</span>
        {buses.map((bus) => {
          const isSelected = selectedBusId === bus.id
          const colorClass = 
            bus.id === 1 ? "border-red-500 text-red-700 bg-red-50" :
            bus.id === 2 ? "border-amber-500 text-amber-700 bg-amber-50" :
            "border-purple-500 text-purple-700 bg-purple-50"

          return (
            <button
              key={bus.id}
              onClick={() => onSelectBus(bus.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-bold text-xs transition-transform active:scale-95 ${
                isSelected ? `${colorClass} ring-2 ring-offset-1 ring-slate-900 shadow-sm` : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${bus.isDwelling ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`}></span>
              คันที่ {bus.id}
            </button>
          )
        })}
      </div>
    </div>
  )
}
