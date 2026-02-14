"use client"

import { useEffect, useState, useCallback } from "react"
import {
  type BusState,
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
}

/* Bus colors: 1=Red, 2=Yellow, 3=Purple */
const BUS_COLORS: Record<number, { main: string; light: string; text: string; ring: string }> = {
  1: { main: "#E53935", light: "#FFEBEE", text: "#B71C1C", ring: "rgba(229,57,53,0.3)" },
  2: { main: "#F9A825", light: "#FFF8E1", text: "#F57F17", ring: "rgba(249,168,37,0.3)" },
  3: { main: "#7B1FA2", light: "#F3E5F5", text: "#4A148C", ring: "rgba(123,31,162,0.3)" },
}

function getBusColor(busId: number) {
  return BUS_COLORS[busId] || BUS_COLORS[1]
}

/* ------------------------------------------------------------------ */
/*  Map helpers                                                        */
/* ------------------------------------------------------------------ */
function getStopMapPositions() {
  return stops.map((s, i) => {
    const angle = (i / stops.length) * Math.PI * 2 - Math.PI / 2
    const rx = 170
    const ry = 95
    const cx = 300
    const cy = 155
    return {
      ...s,
      mx: cx + rx * Math.cos(angle),
      my: cy + ry * Math.sin(angle),
    }
  })
}

function getBusMapPosition(
  bus: BusState,
  mapStops: ReturnType<typeof getStopMapPositions>
) {
  if (bus.isDwelling) {
    const pos = mapStops[bus.currentStopIndex]
    return { x: pos.mx, y: pos.my }
  }
  const currentPos = mapStops[bus.currentStopIndex]
  const nextIndex = (bus.currentStopIndex + 1) % stops.length
  const nextPos = mapStops[nextIndex]
  return {
    x: currentPos.mx + (nextPos.mx - currentPos.mx) * bus.progress,
    y: currentPos.my + (nextPos.my - currentPos.my) * bus.progress,
  }
}

/* ------------------------------------------------------------------ */
/*  RouteMap                                                           */
/* ------------------------------------------------------------------ */
function RouteMap({ buses }: { buses: BusState[] }) {
  const mapStops = getStopMapPositions()
  const pathPoints = mapStops.map((s) => `${s.mx},${s.my}`).join(" L ")
  const pathD = `M ${pathPoints} Z`

  return (
    <div className="rounded-2xl border border-border bg-card p-5 lg:p-8">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E53935]/10">
          <MapPin className="h-5 w-5 text-[#E53935]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">
            {"แผนที่เส้นทางรถเมล์ไฟฟ้า"}
          </h2>
          <p className="text-base text-muted-foreground">
            {"เส้นทางวนรอบภายในมหาวิทยาลัย \u00b7 3 คัน"}
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-6 lg:flex-row">
        <div className="w-full overflow-x-auto lg:flex-1">
          <svg
            viewBox="0 0 600 310"
            className="mx-auto h-auto w-full max-w-[600px]"
          >
            {/* Route path */}
            <path
              d={pathD}
              fill="none"
              stroke="#26C6DA"
              strokeWidth="3"
              strokeDasharray="8 4"
              opacity="0.7"
            />
            {/* Direction arrows */}
            {mapStops.map((s, i) => {
              const next = mapStops[(i + 1) % mapStops.length]
              const midX = (s.mx + next.mx) / 2
              const midY = (s.my + next.my) / 2
              const angle =
                Math.atan2(next.my - s.my, next.mx - s.mx) * (180 / Math.PI)
              return (
                <g
                  key={`arrow-${i}`}
                  transform={`translate(${midX}, ${midY}) rotate(${angle})`}
                >
                  <polygon
                    points="0,-3 6,0 0,3"
                    fill="#26C6DA"
                    opacity="0.6"
                  />
                </g>
              )
            })}
            {/* Stop markers */}
            {mapStops.map((s, i) => {
              const busHere = buses.find(
                (b) => b.currentStopIndex === i && b.isDwelling
              )
              const stopFill = busHere
                ? getBusColor(busHere.id).main
                : "#9E9E9E"
              const stopStroke = busHere
                ? getBusColor(busHere.id).main
                : "#BDBDBD"
              return (
                <g key={s.id}>
                  {/* Glow ring when bus parked */}
                  {busHere && (
                    <circle
                      cx={s.mx}
                      cy={s.my}
                      r="20"
                      fill="none"
                      stroke={getBusColor(busHere.id).main}
                      strokeWidth="2"
                      opacity="0.4"
                    >
                      <animate
                        attributeName="r"
                        values="18;24;18"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.4;0.1;0.4"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}
                  <circle
                    cx={s.mx}
                    cy={s.my}
                    r="15"
                    fill={busHere ? stopFill : "white"}
                    stroke={stopStroke}
                    strokeWidth="2.5"
                  />
                  <text
                    x={s.mx}
                    y={s.my + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="7"
                    fontWeight="bold"
                    fill={busHere ? "white" : "#555"}
                  >
                    {s.code}
                  </text>
                  <text
                    x={s.mx}
                    y={s.my + 28}
                    textAnchor="middle"
                    fontSize="8"
                    fill="#555"
                    fontWeight="500"
                  >
                    {s.name}
                  </text>
                </g>
              )
            })}
            {/* Bus dots - only when traveling (not dwelling, those are shown as stop color) */}
            {buses.map((bus) => {
              const pos = getBusMapPosition(bus, mapStops)
              const c = getBusColor(bus.id)
              if (bus.isDwelling) return null
              return (
                <g key={bus.id}>
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="16"
                    fill={c.main}
                    opacity="0.15"
                  >
                    <animate
                      attributeName="r"
                      values="14;20;14"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.2;0.05;0.2"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="12"
                    fill={c.main}
                    stroke="white"
                    strokeWidth="2.5"
                  />
                  <text
                    x={pos.x}
                    y={pos.y + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="9"
                    fontWeight="bold"
                    fill="white"
                  >
                    {bus.id}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex flex-row flex-wrap gap-4 lg:flex-col lg:gap-3">
          {buses.map((bus) => {
            const c = getBusColor(bus.id)
            return (
              <div key={bus.id} className="flex items-center gap-2.5 text-base">
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: c.main }}
                >
                  {bus.id}
                </span>
                <span className="text-foreground">{`รถเมล์ ${bus.id}`}</span>
              </div>
            )
          })}
          <div className="flex items-center gap-2.5 text-base">
            <span className="h-5 w-5 rounded-full border-2 border-[#BDBDBD] bg-white" />
            <span className="text-foreground">{"จุดจอด"}</span>
          </div>
          <div className="flex items-center gap-2.5 text-base">
            <span className="h-5 w-5 border-t-2 border-dashed border-[#26C6DA]" />
            <span className="text-foreground">{"เส้นทาง"}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  BusCard                                                            */
/* ------------------------------------------------------------------ */
function BusCard({ bus }: { bus: BusState }) {
  const c = getBusColor(bus.id)
  const currentStop = stops[bus.currentStopIndex]
  const nextStopIndex = (bus.currentStopIndex + 1) % stops.length
  const nextStop = stops[nextStopIndex]

  const etaToNext = bus.isDwelling
    ? bus.dwellRemaining + TRAVEL_TIME_PER_SEGMENT
    : Math.round((1 - bus.progress) * TRAVEL_TIME_PER_SEGMENT)

  return (
    <div
      className="overflow-hidden rounded-2xl border-2 shadow-sm transition-all"
      style={{
        borderColor: c.main,
        backgroundColor: "hsl(var(--card))",
        boxShadow: !bus.isDwelling
          ? `0 0 16px 2px ${c.ring}, 0 0 0 1px ${c.main}`
          : undefined,
      }}
    >
      {/* Header */}
      <div className="px-5 py-4 text-white" style={{ backgroundColor: c.main }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Bus className="h-7 w-7" />
            <h3 className="text-xl font-bold">{bus.name}</h3>
          </div>
          <span className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-base backdrop-blur-sm ${bus.isDwelling ? "bg-white/20" : "bg-white/25"}`}>
            {!bus.isDwelling && (
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-300 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-400" />
              </span>
            )}
            {bus.isDwelling ? "จอดอยู่" : `${bus.speed} กม./ชม.`}
          </span>
        </div>
      </div>

      <div className="space-y-4 p-5">
        {/* Current location */}
        <div
          className="rounded-xl p-4"
          style={{ backgroundColor: bus.isDwelling ? c.light : "hsl(var(--secondary) / 0.5)" }}
        >
          <p className="text-base text-muted-foreground">
            {bus.isDwelling ? "จอดอยู่ที่" : "กำลังออกจาก"}
          </p>
          <p className="inline-flex items-center gap-2 text-lg font-semibold text-foreground">
            {currentStop.name}
            {bus.isDwelling && (
              <span className="relative flex h-3.5 w-3.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-red-500" />
              </span>
            )}
          </p>
          {bus.isDwelling && (
            <p className="text-base" style={{ color: c.text }}>
              {currentStop.nameEn}
            </p>
          )}
        </div>

        {/* Dwell countdown */}
        {bus.isDwelling && (
          <div
            className="flex items-center justify-between rounded-xl px-4 py-3"
            style={{ backgroundColor: c.light }}
          >
            <div className="flex items-center gap-2.5">
              <Timer className="h-6 w-6" style={{ color: c.main }} />
              <span className="text-base font-medium text-foreground">
                {"จอดรออีก"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className="rounded-lg px-4 py-2 font-mono text-lg font-bold text-white"
                style={{ backgroundColor: c.main }}
              >
                {formatTime(bus.dwellRemaining)}
              </span>
            </div>
          </div>
        )}

        {/* Next stop + ETA */}
        <div className="flex items-center gap-3 rounded-xl bg-secondary/50 px-4 py-3">
          <Navigation className="h-6 w-6 shrink-0" style={{ color: c.main }} />
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">{"จุดถัดไป"}</p>
            <p className="text-base font-medium text-foreground">
              {nextStop.name}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">{"ถึงใน"}</p>
            <p className="text-lg font-bold" style={{ color: c.main }}>
              {`${formatMinutes(etaToNext)} นาที`}
            </p>
          </div>
        </div>

        {/* Speed */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <Gauge className="h-5 w-5 text-muted-foreground" />
            <span className="text-base text-muted-foreground">{"ความเร็วเฉลี่ย"}</span>
          </div>
          <span className="ml-auto text-base font-medium text-foreground">{"26 กม./ชม."}</span>
        </div>

        {/* Passengers */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <Users className="h-5 w-5 text-muted-foreground" />
            <span className="text-base text-muted-foreground">{"ผู้โดยสาร"}</span>
          </div>
          <div className="flex-1">
            <div className="h-2.5 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${Math.min((bus.passengers / 40) * 100, 100)}%`,
                  backgroundColor: c.main,
                }}
              />
            </div>
          </div>
          <span className="text-base font-medium text-foreground">{bus.passengers}</span>
        </div>

        {/* Battery */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <Battery className="h-5 w-5 text-muted-foreground" />
            <span className="text-base text-muted-foreground">{"แบตเตอรี่"}</span>
          </div>
          <div className="flex-1">
            <div className="h-2.5 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${bus.battery}%`,
                  backgroundColor:
                    bus.battery > 50 ? "#4CAF50" : bus.battery > 20 ? "#FF9800" : "#F44336",
                }}
              />
            </div>
          </div>
          <span className="text-base font-medium text-foreground">{bus.battery}%</span>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between rounded-xl bg-secondary/50 px-5 py-3.5">
          <span className="text-base text-muted-foreground">{"สถานะ"}</span>
          <span
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-base font-medium text-white"
            style={{ backgroundColor: c.main }}
          >
            {bus.isDwelling ? (
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-300 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-400" />
              </span>
            ) : (
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-300 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
              </span>
            )}
            {bus.status}
          </span>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  StopTimeline                                                       */
/* ------------------------------------------------------------------ */
function StopTimeline({ buses }: { buses: BusState[] }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 lg:p-8">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FF9800]/10">
            <Clock className="h-5 w-5 text-[#FF9800]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{"เวลาเทียบและจุดจอด"}</h2>
            <p className="text-base text-muted-foreground">
              {"อัพเดต: ข้อมูลจราจรล่าสุดทุกจุดจอด \u00b7 3 คัน"}
            </p>
          </div>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-[#F44336] px-3.5 py-1.5 text-base font-semibold text-white">
          <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
          LIVE
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
        {stops.map((stop, idx) => {
          /* Which bus is currently parked here? */
          const dwellingBus = buses.find(
            (b) => b.currentStopIndex === idx && b.isDwelling
          )
          const dwellingColor = dwellingBus ? getBusColor(dwellingBus.id) : null

          /* ETAs of all approaching buses (not the one already parked) */
          const approachingBuses = buses
            .filter((b) => !(b.currentStopIndex === idx && b.isDwelling))
            .map((b) => {
              const eta = calcEtaSeconds(b, idx)
              return { bus: b, eta: eta ?? Infinity, color: getBusColor(b.id) }
            })
            .filter((e) => e.eta > 0 && e.eta < Infinity)
            .sort((a, b) => a.eta - b.eta)

          const nextArrival = approachingBuses[0] || null

          /* Card border / background when bus parked */
          const cardBorder = dwellingColor ? dwellingColor.main : "hsl(var(--border))"
          const cardBg = dwellingColor ? dwellingColor.light : "hsl(var(--card))"

          return (
            <div
              key={stop.id}
              className="overflow-hidden rounded-xl border-2 transition-all duration-500"
              style={{ borderColor: cardBorder, backgroundColor: cardBg }}
            >
              {/* Stop header - colored with bus color when parked */}
              <div
                className="px-4 py-3 text-white"
                style={{
                  backgroundColor: dwellingColor ? dwellingColor.main : "#78909C",
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/25 text-sm font-bold">
                    {stop.code}
                  </span>
                  <span className="truncate text-base font-semibold">{stop.name}</span>
                  {dwellingBus && (
                    <span className="relative ml-auto flex h-3 w-3 shrink-0">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2 p-3">
                {/* Bus is parked here */}
                {dwellingBus && dwellingColor && (
                  <div
                    className="rounded-lg px-3 py-2.5"
                    style={{ backgroundColor: `${dwellingColor.main}15` }}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold text-white"
                        style={{ backgroundColor: dwellingColor.main }}
                      >
                        {dwellingBus.id}
                      </span>
                      <span
                        className="text-base font-bold"
                        style={{ color: dwellingColor.main }}
                      >
                        {`รถ ${dwellingBus.id} จอดอยู่`}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{"ออกอีก"}</span>
                      <span
                        className="rounded-md px-3 py-1.5 font-mono text-sm font-bold text-white"
                        style={{ backgroundColor: dwellingColor.main }}
                      >
                        {formatTime(dwellingBus.dwellRemaining)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Next bus arriving */}
                {nextArrival && (
                  <div
                    className="rounded-lg px-3 py-2.5"
                    style={{ backgroundColor: `${nextArrival.color.main}10` }}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold text-white"
                        style={{ backgroundColor: nextArrival.color.main }}
                      >
                        {nextArrival.bus.id}
                      </span>
                      <span
                        className="text-sm font-medium"
                        style={{ color: nextArrival.color.text }}
                      >
                        {"ถึงใน"}
                      </span>
                      <span
                        className="ml-auto font-mono text-base font-bold"
                        style={{ color: nextArrival.color.main }}
                      >
                        {formatMinutes(nextArrival.eta)}
                      </span>
                      <span className="text-sm text-muted-foreground">{"นาที"}</span>
                    </div>
                  </div>
                )}

                {/* Other approaching buses */}
                {approachingBuses.slice(1).map((e) => (
                  <div
                    key={e.bus.id}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2.5"
                    style={{ backgroundColor: `${e.color.main}08` }}
                  >
                    <span
                      className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: e.color.main }}
                    >
                      {e.bus.id}
                    </span>
                    <span
                      className="text-sm"
                      style={{ color: e.color.text }}
                    >
                      {"ถึงใน"}
                    </span>
                    <span
                      className="ml-auto font-mono text-base font-bold"
                      style={{ color: e.color.main }}
                    >
                      {formatMinutes(e.eta)}
                    </span>
                    <span className="text-sm text-muted-foreground">{"นาที"}</span>
                  </div>
                ))}

                {/* No bus nearby */}
                {!dwellingBus && approachingBuses.length === 0 && (
                  <div className="flex items-center gap-1.5 rounded-lg bg-secondary/50 px-3 py-2">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {"รอข้อมูล..."}
                    </span>
                  </div>
                )}

                {/* Nearby facility badges */}
                {stop.facilities.length > 0 && (
                  <div className="mt-1.5 border-t border-border/50 pt-2.5">
                    <p className="mb-1.5 text-sm font-medium text-muted-foreground">{"สิ่งอำนวยความสะดวกใกล้เคียง"}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {stop.facilities.map((fName) => {
                        const fac = FACILITY_MAP[fName]
                        if (!fac) return null
                        const Icon = FACILITY_ICONS[fac.icon]
                        return (
                          <span
                            key={fName}
                            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-white"
                            style={{ backgroundColor: fac.color }}
                          >
                            {Icon && <Icon className="h-3.5 w-3.5" />}
                            {fac.label}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend row */}
      <div className="mt-5 flex flex-wrap items-center gap-5">
        {[1, 2, 3].map((id) => {
          const c = getBusColor(id)
          return (
            <div key={id} className="flex items-center gap-2.5 text-base">
              <span
                className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: c.main }}
              >
                {id}
              </span>
              <span className="text-muted-foreground">{`รถ ${id}`}</span>
            </div>
          )
        })}
        <span className="text-sm text-muted-foreground">
          {"| กรอบสีแดง/เหลือง/ม่วง = มีรถจอดอยู่"}
        </span>
      </div>

      <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-[#FFF3E0] px-5 py-3.5 text-base">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#FF9800]" />
        <span className="text-[#795548]">
          <span className="font-semibold text-[#FF9800]">{"คำเตือน: "}</span>
          {"รถเมล์จอดแต่ละจุด 5 นาที \u00b7 ใช้เวลาเดินทางระหว่างจุดจอดประมาณ 5 นาที \u00b7 แสดงข้อมูลตามเวลาจริง \u00b7 3 คันให้บริการ"}
        </span>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main LiveTracking component                                        */
/* ------------------------------------------------------------------ */
export function LiveTracking() {
  const [buses, setBuses] = useState<BusState[]>(initialBuses)

  const simulateBuses = useCallback(() => {
    setBuses((prev) =>
      prev.map((bus) => {
        const b = { ...bus }

        if (b.isDwelling) {
          b.dwellRemaining = Math.max(0, b.dwellRemaining - SIM_SECONDS_PER_TICK)
          b.speed = 0

          if (b.dwellRemaining <= 0) {
            b.isDwelling = false
            b.dwellRemaining = 0
            b.progress = 0
            b.status = "กำลังเดินทาง"
            b.speed = Math.round(15 + Math.random() * 15)
          } else if (b.dwellRemaining <= 30) {
            b.status = "กำลังจะออก"
          } else {
            b.status = "จอดรับผู้โดยสาร"
          }
        } else {
          const progressIncrement = SIM_SECONDS_PER_TICK / TRAVEL_TIME_PER_SEGMENT
          b.progress = Math.min(b.progress + progressIncrement, 1)
          b.speed = Math.round(15 + Math.random() * 15)
          b.status = "กำลังเดินทาง"

          if (Math.random() < 0.15) {
            b.passengers = Math.max(
              0,
              Math.min(40, b.passengers + Math.round(Math.random() * 4 - 2))
            )
          }

          if (b.progress >= 1) {
            b.currentStopIndex = (b.currentStopIndex + 1) % stops.length
            b.progress = 0
            b.speed = 0
            b.isDwelling = true
            b.dwellRemaining = DWELL_TIME
            b.status = "จอดรับผู้โดยสาร"

            const getOff = Math.round(Math.random() * Math.min(8, b.passengers))
            const getOn = Math.round(Math.random() * 10)
            b.passengers = Math.max(0, Math.min(40, b.passengers - getOff + getOn))
            b.battery = Math.max(5, b.battery - (Math.random() < 0.4 ? 1 : 0))
          }
        }

        return b
      })
    )
  }, [])

  useEffect(() => {
    const interval = setInterval(simulateBuses, SIM_TICK)
    return () => clearInterval(interval)
  }, [simulateBuses])

  return (
    <div className="space-y-6">
      <RouteMap buses={buses} />
      <div className="grid gap-4 md:grid-cols-3">
        {buses.map((bus) => (
          <BusCard key={bus.id} bus={bus} />
        ))}
      </div>
      <StopTimeline buses={buses} />
    </div>
  )
}
