"use client"

import { useEffect, useState, useCallback } from "react"
import dynamic from "next/dynamic"
import {
  type BusState,
  type BusStop,
  initialBuses,
  stops,
  calcEtaSeconds,
  formatTime,
  formatMinutes,
  TRAVEL_TIME_PER_SEGMENT,
  DWELL_TIME,
  SIM_TICK,
  SIM_SECONDS_PER_TICK,
  FACILITY_MAP,
  getInterpolatedBusCoordinates,
  ROUTES,
} from "@/lib/bus-data"
import {
  MapPin,
  Battery,
  Users,
  Gauge,
  Navigation,
  Bus,
  Clock,
  AlertTriangle,
  Timer,
  Play,
  Pause,
  FastForward,
  RotateCcw,
  Sparkles,
  Zap,
  Leaf,
  ShieldCheck,
  Phone,
  Thermometer,
  Radio,
  CheckCircle2,
  SlidersHorizontal,
  ChevronRight,
  Accessibility
} from "lucide-react"

// Dynamic import for Leaflet map to avoid SSR window issues
const LeafletMap = dynamic(() => import("./leaflet-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[540px] lg:h-[620px] w-full flex-col items-center justify-center rounded-2xl border border-border bg-slate-50 p-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e63462]/10 text-[#e63462] animate-bounce">
        <Bus className="h-6 w-6" />
      </div>
      <p className="mt-3 font-semibold text-slate-800">กำลังโหลดแผนที่มหาวิทยาลัยราชภัฏนครปฐม...</p>
      <p className="text-xs text-slate-500 mt-1">OpenStreetMap · Real-Time GPS Tracking</p>
    </div>
  ),
})

export function LiveTracking() {
  const [buses, setBuses] = useState<BusState[]>(initialBuses)
  const [selectedBusId, setSelectedBusId] = useState<number | null>(null)
  const [selectedStopId, setSelectedStopId] = useState<number | null>(null)
  const [isSimulating, setIsSimulating] = useState(true)
  const [simSpeedMultiplier, setSimSpeedMultiplier] = useState(1)
  const [selectedRouteId, setSelectedRouteId] = useState("route-1")
  const [notification, setNotification] = useState<string | null>(null)

  // Simulation Update Loop
  useEffect(() => {
    if (!isSimulating) return

    const interval = setInterval(() => {
      setBuses((prevBuses) =>
        prevBuses.map((bus) => {
          const effectiveSecondsPerTick = SIM_SECONDS_PER_TICK * simSpeedMultiplier

          if (bus.isDwelling) {
            const newRemaining = bus.dwellRemaining - effectiveSecondsPerTick

            if (newRemaining <= 0) {
              // ออกจากจุดจอด -> เดินทางไปยังจุดถัดไป
              const nextStopIndex = (bus.currentStopIndex + 1) % stops.length
              const coords = getInterpolatedBusCoordinates(bus.currentStopIndex, 0.05)

              return {
                ...bus,
                isDwelling: false,
                dwellRemaining: 0,
                status: "กำลังเดินทาง",
                progress: 0.05,
                speed: 18 + Math.floor(Math.random() * 8), // 18-25 km/h
                currentLat: coords.lat,
                currentLng: coords.lng,
                heading: coords.heading,
                battery: Math.max(15, bus.battery - 0.02),
              }
            } else {
              // กำลังจอดรับผู้โดยสาร
              const passengerChange = Math.random() > 0.6 ? (Math.random() > 0.5 ? 1 : -1) : 0
              const newPassengers = Math.max(2, Math.min(bus.maxCapacity, bus.passengers + passengerChange))

              return {
                ...bus,
                dwellRemaining: newRemaining,
                status: newRemaining <= 15 ? "กำลังจะออก" : "จอดรับผู้โดยสาร",
                speed: 0,
                passengers: newPassengers,
              }
            }
          } else {
            // รถกำลังเคลื่อนที่
            const progressIncrement = effectiveSecondsPerTick / TRAVEL_TIME_PER_SEGMENT
            const newProgress = bus.progress + progressIncrement

            if (newProgress >= 1.0) {
              // ถึงจุดจอดถัดไปแล้ว
              const arrivedStopIndex = (bus.currentStopIndex + 1) % stops.length
              const arrivedStop = stops[arrivedStopIndex]

              return {
                ...bus,
                currentStopIndex: arrivedStopIndex,
                progress: 0,
                isDwelling: true,
                dwellRemaining: DWELL_TIME,
                status: "จอดรับผู้โดยสาร",
                speed: 0,
                currentLat: arrivedStop.lat,
                currentLng: arrivedStop.lng,
                battery: Math.max(15, bus.battery - 0.05),
              }
            } else {
              // ยังเดินทางอยู่ระหว่างจุดจอด
              const coords = getInterpolatedBusCoordinates(bus.currentStopIndex, newProgress)
              return {
                ...bus,
                progress: newProgress,
                status: "กำลังเดินทาง",
                speed: 16 + Math.floor(Math.random() * 9),
                currentLat: coords.lat,
                currentLng: coords.lng,
                heading: coords.heading,
              }
            }
          }
        })
      )
    }, SIM_TICK)

    return () => clearInterval(interval)
  }, [isSimulating, simSpeedMultiplier])

  // Reset Simulation
  const handleResetSimulation = () => {
    setBuses(initialBuses)
    setSelectedBusId(null)
    setSelectedStopId(null)
  }

  return (
    <div className="space-y-6">
      {/* 
        ===================================================================
        TOP BAR: NPRU System Info & Simulation Control Banner
        ===================================================================
      */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-4 lg:p-5 rounded-2xl shadow-md border border-slate-700">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e63462] shadow-md shrink-0">
            <Radio className="h-6 w-6 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg lg:text-xl font-bold">
                แผนที่ติดตามรถเมล์ไฟฟ้า มรภ.นครปฐม
              </h2>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                GPS ออนไลน์ 100%
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              มหาวิทยาลัยราชภัฏนครปฐม (NPRU) · 85 ถ.มาลัยแมน อ.เมือง จ.นครปฐม
            </p>
          </div>
        </div>

        {/* Simulation Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Pause / Play */}
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs shadow-sm transition-all active:scale-95 ${
              isSimulating
                ? "bg-amber-500 hover:bg-amber-600 text-slate-950"
                : "bg-emerald-500 hover:bg-emerald-600 text-white"
            }`}
          >
            {isSimulating ? <Pause className="h-3.5 w-3.5 fill-current" /> : <Play className="h-3.5 w-3.5 fill-current" />}
            {isSimulating ? "พักระบบจำลอง" : "เริ่มเดินรถ"}
          </button>

          {/* Speed Multiplier */}
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl p-0.5 text-xs font-semibold">
            {[1, 2, 5].map((speed) => (
              <button
                key={speed}
                onClick={() => setSimSpeedMultiplier(speed)}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  simSpeedMultiplier === speed
                    ? "bg-[#e63462] text-white"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>

          {/* Reset */}
          <button
            onClick={handleResetSimulation}
            title="รีเซ็ตสถานะรถ"
            className="flex items-center justify-center p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* 
        ===================================================================
        SECTION 1: REAL INTERACTIVE LEAFLET MAP (NPRU CAMPUS)
        ===================================================================
      */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-[#e63462]" />
            <h3 className="font-bold text-base text-foreground">
              ผังเส้นทางและตำแหน่งรถเมล์ไฟฟ้าเรียลไทม์
            </h3>
          </div>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            คลิกที่จุดจอดหรือรูปรถเมล์บนแผนที่เพื่อดูข้อมูลเพิ่มเติม
          </span>
        </div>

        <LeafletMap
          buses={buses}
          selectedBusId={selectedBusId}
          onSelectBus={setSelectedBusId}
          selectedStopId={selectedStopId}
          onSelectStop={setSelectedStopId}
          isSimulating={isSimulating}
          onToggleSimulation={() => setIsSimulating(!isSimulating)}
          simulationSpeed={simSpeedMultiplier}
          onChangeSimSpeed={setSimSpeedMultiplier}
        />
      </div>

      {/* 
        ===================================================================
        SECTION 2: BUS TELEMETRY CARDS (3 EV SHUTTLES)
        ===================================================================
      */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bus className="h-5 w-5 text-[#e63462]" />
            <h3 className="font-bold text-base text-foreground">
              สถานะรถเมล์ไฟฟ้าที่ให้บริการ ({buses.length} คัน)
            </h3>
          </div>
          <span className="text-xs text-muted-foreground">
            อัปเดตทุกวินาที
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {buses.map((bus) => {
            const isSelected = selectedBusId === bus.id
            const color = bus.id === 1 ? "#E53935" : bus.id === 2 ? "#F59E0B" : "#8B5CF6"
            const nextStopIndex = (bus.currentStopIndex + 1) % stops.length
            const currentStop = stops[bus.currentStopIndex]
            const nextStop = stops[nextStopIndex]

            return (
              <div
                key={bus.id}
                onClick={() => setSelectedBusId(isSelected ? null : bus.id)}
                className={`relative cursor-pointer rounded-2xl border bg-card p-5 shadow-sm transition-all hover:shadow-md ${
                  isSelected ? "ring-2 ring-[#e63462] border-transparent shadow-lg" : "border-border"
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-xl font-bold text-white shadow-sm"
                      style={{ backgroundColor: color }}
                    >
                      <Bus className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-base text-foreground leading-none">
                          คันที่ {bus.id}
                        </h4>
                        <span className="text-[11px] font-semibold text-muted-foreground">
                          {bus.plateNumber}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        พนักงานขับ: {bus.driverName}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      bus.isDwelling
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                        : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                    }`}
                  >
                    {bus.status}
                  </span>
                </div>

                {/* Location Status Progress */}
                <div className="rounded-xl bg-muted/60 p-3 mb-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-medium">จุดจอดปัจจุบัน:</span>
                    <span className="font-bold text-foreground">{currentStop.name} ({currentStop.code})</span>
                  </div>
                  
                  {!bus.isDwelling && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-medium">มุ่งหน้าสู่:</span>
                      <span className="font-bold text-[#e63462]">{nextStop.name} ({nextStop.code})</span>
                    </div>
                  )}

                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: bus.isDwelling ? "100%" : `${Math.round(bus.progress * 100)}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                </div>

                {/* Telemetry Grid */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border text-center">
                  <div className="p-2 rounded-lg bg-background">
                    <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground mb-0.5">
                      <Gauge className="h-3.5 w-3.5" />
                      <span>ความเร็ว</span>
                    </div>
                    <span className="font-bold text-sm text-foreground tabular-nums">
                      {bus.speed} <span className="text-[10px] font-normal">กม./ชม.</span>
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-background">
                    <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground mb-0.5">
                      <Battery className="h-3.5 w-3.5 text-emerald-500" />
                      <span>แบตเตอรี่</span>
                    </div>
                    <span className="font-bold text-sm text-foreground tabular-nums">
                      {Math.round(bus.battery)}%
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-background">
                    <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground mb-0.5">
                      <Users className="h-3.5 w-3.5 text-blue-500" />
                      <span>ผู้โดยสาร</span>
                    </div>
                    <span className="font-bold text-sm text-foreground tabular-nums">
                      {bus.passengers}/{bus.maxCapacity}
                    </span>
                  </div>
                </div>

                {/* Quick Action */}
                <button
                  className="w-full mt-3 py-1.5 rounded-lg text-xs font-semibold text-center text-[#e63462] hover:bg-[#e63462]/10 transition-colors flex items-center justify-center gap-1"
                >
                  <span>{isSelected ? "กำลังติดตามบนแผนที่ ✓" : "กดเพื่อติดตามบนแผนที่"}</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* 
        ===================================================================
        SECTION 3: NPRU STOPS & LIVE ETA TIMELINE
        ===================================================================
      */}
      <div className="rounded-2xl border border-border bg-card p-5 lg:p-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-[#e63462]" />
              <h3 className="text-xl font-bold text-foreground">
                ประมาณการเวลารถเมล์ถึงจุดจอด (Live ETA)
              </h3>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              10 จุดจอดทั่วมหาวิทยาลัยราชภัฏนครปฐม · คำนวณจากความเร็วและตำแหน่ง GPS จริง
            </p>
          </div>
          <span className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-xl self-start sm:self-auto font-medium">
            คลิกที่จุดจอดเพื่อดูบนแผนที่
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {stops.map((stop, index) => {
            const isSelected = selectedStopId === stop.id

            // Calculate ETA for each bus to this stop
            const busEtas = buses.map((bus) => {
              const eta = calcEtaSeconds(bus, index)
              return {
                busId: bus.id,
                eta,
                formatted: eta === null ? "--" : eta === 0 ? "ถึงแล้ว" : `${formatMinutes(eta)} นาที`,
                isAtStop: eta === 0,
              }
            })

            // Closest bus
            const validEtas = busEtas.filter((b) => b.eta !== null)
            validEtas.sort((a, b) => (a.eta ?? 9999) - (b.eta ?? 9999))
            const closest = validEtas[0]

            return (
              <div
                key={stop.id}
                onClick={() => setSelectedStopId(isSelected ? null : stop.id)}
                className={`relative cursor-pointer rounded-xl border p-3.5 transition-all hover:border-[#e63462] ${
                  isSelected
                    ? "bg-[#e63462]/5 border-[#e63462] ring-2 ring-[#e63462]/30 shadow-md"
                    : "bg-background border-border hover:shadow-sm"
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-1 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#e63462] text-[11px] font-bold text-white shadow-sm">
                      {stop.code}
                    </span>
                    <h5 className="font-bold text-xs text-foreground line-clamp-1">
                      {stop.name}
                    </h5>
                  </div>
                  {stop.accessible && (
                    <span title="รองรับวีลแชร์">
                      <Accessibility className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-muted-foreground line-clamp-1 mb-2.5">
                  {stop.building}
                </p>

                {/* ETAs for all 3 buses */}
                <div className="space-y-1 pt-2 border-t border-border">
                  {busEtas.map((b) => {
                    const busColor = b.busId === 1 ? "text-red-600" : b.busId === 2 ? "text-amber-600" : "text-purple-600"
                    return (
                      <div key={b.busId} className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground">คันที่ {b.busId}:</span>
                        <span
                          className={`font-bold tabular-nums ${
                            b.isAtStop ? "text-emerald-600 font-black animate-pulse" : busColor
                          }`}
                        >
                          {b.formatted}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 
        ===================================================================
        SECTION 4: NPRU CAMPUS ECO-STATS & HOTLINE
        ===================================================================
      */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center gap-3.5 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0">
            <Leaf className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground">ลดการปล่อย CO2 วันนี้</span>
            <p className="text-lg font-bold text-foreground">
              48.5 <span className="text-xs font-normal">kg CO2</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 shrink-0">
            <Zap className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground">พลังงานไฟฟ้าสะอาดสะสม</span>
            <p className="text-lg font-bold text-foreground">
              100% <span className="text-xs font-normal">Zero Emission</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 text-red-600 shrink-0">
            <Phone className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground">ศูนย์ควบคุม มรภ.นครปฐม</span>
            <p className="text-sm font-bold text-foreground">
              034-109-300 <span className="text-xs font-normal text-muted-foreground">(ต่อ 3000)</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
