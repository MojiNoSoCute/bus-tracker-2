"use client"

import { useState } from "react"
import { stops, FACILITY_MAP, type BusStop } from "@/lib/bus-data"
import {
  Droplets,
  ShoppingCart,
  CreditCard,
  Coffee,
  CircleParking,
  Wifi,
  UtensilsCrossed,
  Pill,
  Store,
  Dumbbell,
  BookOpen,
  Heart,
  Zap,
  Accessibility,
  Printer,
  MapPin,
  ExternalLink,
  Search,
  Building,
  Navigation
} from "lucide-react"

const FACILITY_ICONS: Record<string, React.ElementType> = {
  toilet: Droplets,
  market: ShoppingCart,
  atm: CreditCard,
  cafe: Coffee,
  parking: CircleParking,
  wifi: Wifi,
  food: UtensilsCrossed,
  pharmacy: Pill,
  store: Store,
  gym: Dumbbell,
  library: BookOpen,
  hospital: Heart,
  ev_charger: Zap,
  wheelchair: Accessibility,
  printer: Printer,
}

const cardGradients = [
  "from-[#e63462] to-[#fe5196]", // P1
  "from-[#d81b60] to-[#f06292]", // P2
  "from-[#8e24aa] to-[#ba68c8]", // P3
  "from-[#5e35b1] to-[#7e57c2]", // P4
  "from-[#1e88e5] to-[#42a5f5]", // P5
  "from-[#00897b] to-[#26a69a]", // P6
  "from-[#43a047] to-[#66bb6a]", // P7
  "from-[#f4511e] to-[#ff7043]", // P8
  "from-[#fb8c00] to-[#ffa726]", // P9
  "from-[#3949ab] to-[#5c6bc0]", // P10
]

export function StopInfo() {
  const [filterText, setFilterText] = useState("")
  const [selectedFacility, setSelectedFacility] = useState<string | null>(null)

  const allFacilities = Array.from(
    new Set(stops.flatMap((s) => s.facilities))
  )

  const filteredStops = stops.filter((stop) => {
    const matchesText =
      stop.name.toLowerCase().includes(filterText.toLowerCase()) ||
      stop.building.toLowerCase().includes(filterText.toLowerCase()) ||
      stop.nameEn.toLowerCase().includes(filterText.toLowerCase()) ||
      stop.code.toLowerCase().includes(filterText.toLowerCase())

    const matchesFacility =
      !selectedFacility || stop.facilities.includes(selectedFacility)

    return matchesText && matchesFacility
  })

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="rounded-2xl border border-border bg-card p-5 lg:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-[#e63462]" />
              <h2 className="text-xl font-bold text-foreground">
                ข้อมูลจุดจอดรถเมล์ไฟฟ้า มรภ.นครปฐม (10 จุด)
              </h2>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              ตำแหน่งจริงภายในวิทยาเขต พร้อมพิกัด GPS และสิ่งอำนวยความสะดวก
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="ค้นหาจุดจอด / คณะ / อาคาร..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#e63462]/30"
            />
          </div>
        </div>

        {/* Facility Filter Pills */}
        <div className="mt-4 pt-4 border-t border-border flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-muted-foreground mr-1">
            กรองตามสิ่งอำนวยความสะดวก:
          </span>
          <button
            onClick={() => setSelectedFacility(null)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              selectedFacility === null
                ? "bg-[#e63462] text-white shadow-sm"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            ทั้งหมด ({stops.length})
          </button>
          {allFacilities.map((fac) => (
            <button
              key={fac}
              onClick={() => setSelectedFacility(selectedFacility === fac ? null : fac)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                selectedFacility === fac
                  ? "bg-[#e63462] text-white shadow-sm"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {fac}
            </button>
          ))}
        </div>
      </div>

      {/* Stops Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredStops.map((stop, idx) => {
          const originalIndex = stops.findIndex((s) => s.id === stop.id)
          const gradient = cardGradients[originalIndex % cardGradients.length]

          return (
            <div
              key={stop.id}
              className="flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow"
            >
              <div>
                {/* Card Header */}
                <div
                  className={`bg-gradient-to-r ${gradient} flex items-center justify-between gap-3 px-5 py-4 text-white shadow-inner`}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm text-base font-black border border-white/30">
                      {stop.code}
                    </span>
                    <div>
                      <h3 className="text-base font-bold leading-tight">{stop.name}</h3>
                      <p className="text-xs text-white/80 font-medium">{stop.nameEn}</p>
                    </div>
                  </div>

                  {stop.accessible && (
                    <span
                      title="มีทางลาดรองรับรถเข็น/วีลแชร์"
                      className="p-1.5 rounded-lg bg-white/20 backdrop-blur-sm text-white"
                    >
                      <Accessibility className="h-4 w-4" />
                    </span>
                  )}
                </div>

                {/* Card Body */}
                <div className="space-y-4 p-5">
                  {/* Building & Details */}
                  <div className="rounded-xl bg-muted/60 p-3 border border-border/50">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-foreground mb-1">
                      <Building className="h-3.5 w-3.5 text-[#e63462]" />
                      <span>{stop.building}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {stop.description}
                    </p>
                  </div>

                  {/* Facilities */}
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                      สิ่งอำนวยความสะดวกใกล้เคียง
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {stop.facilities.map((fName) => {
                        const fac = FACILITY_MAP[fName]
                        if (!fac) return null
                        const Icon = FACILITY_ICONS[fac.icon]

                        return (
                          <span
                            key={fName}
                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium border"
                            style={{
                              backgroundColor: `${fac.color}15`,
                              borderColor: `${fac.color}35`,
                              color: fac.color,
                            }}
                          >
                            {Icon && <Icon className="h-3 w-3" />}
                            {fac.label}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* GPS Coordinates & External Link Footer */}
              <div className="p-4 bg-muted/40 border-t border-border flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Navigation className="h-3.5 w-3.5 text-[#e63462]" />
                  <span className="font-mono text-[11px] font-semibold">
                    {stop.lat.toFixed(5)}, {stop.lng.toFixed(5)}
                  </span>
                </div>

                <a
                  href={`https://www.google.com/maps?q=${stop.lat},${stop.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-[#e63462] hover:underline text-xs"
                >
                  <span>เปิด Google Maps</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
