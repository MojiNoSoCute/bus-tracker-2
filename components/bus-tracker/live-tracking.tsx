/**
 * ===================================================================
 * live-tracking.tsx - หน้าติดตามรถเมล์แบบ Real-time
 * ===================================================================
 *
 * หน้านี้แสดงข้อมูลตำแหน่งและสถานะรถเมล์แบบ real-time
 * ใช้ simulation เพื่อจำลองการเคลื่อนที่ของรถ
 *
 * โครงสร้างหน้า:
 * 1. RouteMap - แผนที่แสดงเส้นทางและตำแหน่งรถ
 * 2. BusCard x3 - การ์ดแสดงสถานะรถแต่ละคัน
 * 3. StopTimeline - Grid แสดง ETA ของแต่ละจุดจอด
 *
 * Simulation:
 * - อัพเดตทุก 2 วินาที (SIM_TICK)
 * - เร่งความเร็ว 15 เท่า (1 tick = 15 วินาทีจำลอง)
 * - รถจอดแต่ละจุด 5 นาที, เดินทางระหว่างจุด 5 นาที
 *
 * @author Bus Tracker Team
 */

"use client"

import { useEffect, useState, useCallback } from "react"

// ===================================================================
// IMPORTS: Data และ Utilities
// ===================================================================

import {
  type BusState, // Type สำหรับสถานะรถเมล์
  initialBuses, // สถานะเริ่มต้นของรถ 3 คัน
  stops, // ข้อมูลจุดจอด 10 จุด
  calcEtaSeconds, // คำนวณ ETA ไปยังจุดจอด
  formatTime, // แปลงวินาทีเป็น MM:SS
  formatMinutes, // แปลงวินาทีเป็นจำนวนนาที
  TRAVEL_TIME_PER_SEGMENT, // เวลาเดินทางระหว่างจุดจอด (300 วินาที)
  DWELL_TIME, // เวลาจอดที่จุดจอด (300 วินาที)
  SIM_TICK, // ระยะเวลาระหว่าง simulation tick (2000 ms)
  SIM_SECONDS_PER_TICK, // จำนวนวินาทีที่ผ่านต่อ tick (15)
  FACILITY_MAP, // ข้อมูลสิ่งอำนวยความสะดวก
} from "@/lib/bus-data"

// ===================================================================
// IMPORTS: Icons
// ===================================================================

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
  // Icons สำหรับสิ่งอำนวยความสะดวก
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

// ===================================================================
// CONSTANTS: Icon และ Color Mapping
// ===================================================================

/**
 * FACILITY_ICONS - Mapping icon name -> Lucide component
 *
 * ใช้สำหรับแสดง icon ใน badge สิ่งอำนวยความสะดวก
 */
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

/**
 * BUS_COLORS - สีประจำรถแต่ละคัน
 *
 * - main: สีหลัก (ใช้ใน badge, icon)
 * - light: สีอ่อน (ใช้ใน background)
 * - text: สีข้อความ (เข้มกว่า main)
 * - ring: สี glow effect (มี transparency)
 *
 * รถ 1: แดง, รถ 2: เหลือง, รถ 3: ม่วง
 */
const BUS_COLORS: Record<
  number,
  { main: string; light: string; text: string; ring: string }
> = {
  1: {
    main: "#E53935",
    light: "#FFEBEE",
    text: "#B71C1C",
    ring: "rgba(229,57,53,0.3)",
  },
  2: {
    main: "#F9A825",
    light: "#FFF8E1",
    text: "#F57F17",
    ring: "rgba(249,168,37,0.3)",
  },
  3: {
    main: "#7B1FA2",
    light: "#F3E5F5",
    text: "#4A148C",
    ring: "rgba(123,31,162,0.3)",
  },
}

/**
 * getBusColor - ดึงสีประจำรถจาก BUS_COLORS
 *
 * @param busId - ID รถเมล์ (1, 2, 3)
 * @returns Object สีทั้งหมดของรถนั้น
 *
 * Fallback: ถ้าไม่พบ busId จะใช้สีของรถ 1
 */
function getBusColor(busId: number) {
  return BUS_COLORS[busId] || BUS_COLORS[1]
}

// ===================================================================
// HELPER FUNCTIONS: Map Positioning
// ===================================================================

/**
 * getStopMapPositions - คำนวณตำแหน่งจุดจอดบนแผนที่วงกลม
 *
 * วางจุดจอด 10 จุดเป็นวงรี (ellipse) รอบจุดศูนย์กลาง
 * - cx, cy: จุดศูนย์กลาง (300, 170)
 * - rx, ry: รัศมีแนวนอน (220) และแนวตั้ง (120)
 *
 * @returns Array ของจุดจอดพร้อมพิกัด mx, my
 *
 * Algorithm:
 * - ใช้สมการ parametric ellipse: x = cx + rx*cos(θ), y = cy + ry*sin(θ)
 * - θ = (i/10) * 2π - π/2 เพื่อเริ่มจากด้านบน
 */
function getStopMapPositions() {
  return stops.map((s, i) => {
    // คำนวณมุม: เริ่มจากด้านบน (-π/2) แล้วหมุนตามเข็ม
    const angle = (i / stops.length) * Math.PI * 2 - Math.PI / 2

    // ค่าคงที่ของวงรี
    const rx = 220 // รัศมีแนวนอน
    const ry = 120 // รัศมีแนวตั้ง
    const cx = 300 // จุดศูนย์กลาง X
    const cy = 170 // จุดศูนย์กลาง Y

    return {
      ...s,
      mx: cx + rx * Math.cos(angle), // พิกัด X บนแผนที่
      my: cy + ry * Math.sin(angle), // พิกัด Y บนแผนที่
    }
  })
}

/**
 * getBusMapPosition - คำนวณตำแหน่งรถเมล์บนแผนที่
 *
 * @param bus - สถานะรถเมล์ปัจจุบัน
 * @param mapStops - ตำแหน่งจุดจอดบนแผนที่
 * @returns { x, y } ตำแหน่งรถบนแผนที่
 *
 * Logic:
 * - ถ้าจอดอยู่ (isDwelling): อยู่ตรงจุดจอดปัจจุบัน
 * - ถ้ากำลังวิ่ง: interpolate ระหว่างจุดปัจจุบันกับจุดถัดไป
 */
function getBusMapPosition(
  bus: BusState,
  mapStops: ReturnType<typeof getStopMapPositions>
) {
  // กรณีจอดอยู่: อยู่ตรงจุดจอด
  if (bus.isDwelling) {
    const pos = mapStops[bus.currentStopIndex]
    return { x: pos.mx, y: pos.my }
  }

  // กรณีกำลังวิ่ง: interpolate ตาม progress
  const currentPos = mapStops[bus.currentStopIndex]
  const nextIndex = (bus.currentStopIndex + 1) % stops.length
  const nextPos = mapStops[nextIndex]

  return {
    // Linear interpolation: current + (next - current) * progress
    x: currentPos.mx + (nextPos.mx - currentPos.mx) * bus.progress,
    y: currentPos.my + (nextPos.my - currentPos.my) * bus.progress,
  }
}

// ===================================================================
// COMPONENT: RouteMap
// ===================================================================

/**
 * RouteMap Component - แผนที่แสดงเส้นทางและตำแหน่งรถ
 *
 * @param buses - Array สถานะรถเมล์ทั้ง 3 คัน
 *
 * Features:
 * - SVG แผนที่แบบ responsive
 * - เส้นทางเป็นวงรี (ellipse) พร้อมลูกศรทิศทาง
 * - จุดจอด 10 จุด พร้อมชื่อ
 * - แสดงรถเมล์เป็นจุดสี พร้อม glow effect
 * - Legend แสดงสัญลักษณ์
 *
 * Animation:
 * - Glow ring เมื่อรถจอดอยู่ที่จุดจอด
 * - Pulse effect เมื่อรถกำลังเดินทาง
 */
function RouteMap({ buses }: { buses: BusState[] }) {
  // คำนวณตำแหน่งจุดจอดบนแผนที่
  const mapStops = getStopMapPositions()

  // สร้าง SVG path สำหรับเส้นทาง (วงปิด)
  const pathPoints = mapStops.map((s) => `${s.mx},${s.my}`).join(" L ")
  const pathD = `M ${pathPoints} Z`

  return (
    <div className="rounded-2xl border border-border bg-card p-5 lg:p-8">
      {/* Section Header */}
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

      {/* Map + Legend Container */}
      <div className="flex flex-col items-center gap-6 lg:flex-row">
        {/* SVG Map */}
        <div className="w-full overflow-x-auto lg:flex-1">
          <svg
            viewBox="0 0 600 360"
            className="mx-auto h-auto w-full min-h-[450px] max-w-[900px]"
          >
            {/* 
              ===================================================================
              Layer 1: Route Path (เส้นทาง)
              ===================================================================
              
              เส้นประสีฟ้า (#26C6DA) แสดงเส้นทางวนรอบ
            */}
            <path
              d={pathD}
              fill="none"
              stroke="#26C6DA"
              strokeWidth="4"
              strokeDasharray="10 5"
              opacity="0.8"
            />

            {/* 
              ===================================================================
              Layer 2: Direction Arrows (ลูกศรทิศทาง)
              ===================================================================
              
              วาง polygon ลูกศรไว้กลางระหว่างจุดจอดแต่ละคู่
              หมุนตามทิศทางของเส้นทาง
            */}
            {mapStops.map((s, i) => {
              const next = mapStops[(i + 1) % mapStops.length]
              const midX = (s.mx + next.mx) / 2
              const midY = (s.my + next.my) / 2
              // คำนวณมุมหมุนจาก atan2
              const angle =
                Math.atan2(next.my - s.my, next.mx - s.mx) * (180 / Math.PI)

              return (
                <g
                  key={`arrow-${i}`}
                  transform={`translate(${midX}, ${midY}) rotate(${angle})`}
                >
                  <polygon points="0,-5 10,0 0,5" fill="#26C6DA" opacity="0.7" />
                </g>
              )
            })}

            {/* 
              ===================================================================
              Layer 3: Stop Markers (จุดจอด)
              ===================================================================
              
              วงกลมแสดงจุดจอดพร้อมรหัส (P1-P10)
              ถ้ามีรถจอดอยู่จะเปลี่ยนสีตามรถ + แสดง glow animation
            */}
            {mapStops.map((s, i) => {
              // ตรวจสอบว่ามีรถจอดอยู่ที่จุดนี้หรือไม่
              const busHere = buses.find(
                (b) => b.currentStopIndex === i && b.isDwelling
              )

              // กำหนดสีตามสถานะ
              const stopFill = busHere ? getBusColor(busHere.id).main : "#9E9E9E"
              const stopStroke = busHere
                ? getBusColor(busHere.id).main
                : "#BDBDBD"

              return (
                <g key={s.id}>
                  {/* Glow Ring Animation - แสดงเฉพาะเมื่อมีรถจอด */}
                  {busHere && (
                    <circle
                      cx={s.mx}
                      cy={s.my}
                      r="28"
                      fill="none"
                      stroke={getBusColor(busHere.id).main}
                      strokeWidth="3"
                      opacity="0.4"
                    >
                      {/* Animate ขนาด */}
                      <animate
                        attributeName="r"
                        values="26;34;26"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                      {/* Animate ความโปร่งใส */}
                      <animate
                        attributeName="opacity"
                        values="0.4;0.1;0.4"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}

                  {/* Stop Circle */}
                  <circle
                    cx={s.mx}
                    cy={s.my}
                    r="22"
                    fill={busHere ? stopFill : "white"}
                    stroke={stopStroke}
                    strokeWidth="3"
                  />

                  {/* Stop Code (P1, P2, ...) */}
                  <text
                    x={s.mx}
                    y={s.my + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="11"
                    fontWeight="bold"
                    fill={busHere ? "white" : "#333"}
                  >
                    {s.code}
                  </text>

                  {/* Stop Name */}
                  <text
                    x={s.mx}
                    y={s.my + 38}
                    textAnchor="middle"
                    fontSize="12"
                    fill="#333"
                    fontWeight="600"
                  >
                    {s.name}
                  </text>
                </g>
              )
            })}

            {/* 
              ===================================================================
              Layer 4: Bus Dots (รถเมล์ที่กำลังเดินทาง)
              ===================================================================
              
              แสดงเฉพาะรถที่กำลังวิ่ง (ไม่ใช่จอด)
              รถที่จอดจะแสดงเป็นสีของจุดจอดแทน
            */}
            {buses.map((bus) => {
              const pos = getBusMapPosition(bus, mapStops)
              const c = getBusColor(bus.id)

              // ไม่แสดงถ้ารถจอดอยู่
              if (bus.isDwelling) return null

              return (
                <g key={bus.id}>
                  {/* Pulse Glow */}
                  <circle cx={pos.x} cy={pos.y} r="24" fill={c.main} opacity="0.15">
                    <animate
                      attributeName="r"
                      values="22;30;22"
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

                  {/* Bus Circle */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="18"
                    fill={c.main}
                    stroke="white"
                    strokeWidth="3"
                  />

                  {/* Bus Number */}
                  <text
                    x={pos.x}
                    y={pos.y + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="13"
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

        {/* 
          ===================================================================
          Legend (คำอธิบายสัญลักษณ์)
          ===================================================================
        */}
        <div className="flex flex-row flex-wrap gap-5 lg:flex-col lg:gap-4">
          {/* รถเมล์ 1-3 */}
          {buses.map((bus) => {
            const c = getBusColor(bus.id)
            return (
              <div key={bus.id} className="flex items-center gap-3 text-lg">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-full text-base font-bold text-white"
                  style={{ backgroundColor: c.main }}
                >
                  {bus.id}
                </span>
                <span className="font-medium text-foreground">{`รถเมล์ ${bus.id}`}</span>
              </div>
            )
          })}

          {/* จุดจอด */}
          <div className="flex items-center gap-3 text-lg">
            <span className="h-6 w-6 rounded-full border-3 border-[#BDBDBD] bg-white" />
            <span className="font-medium text-foreground">{"จุดจอด"}</span>
          </div>

          {/* เส้นทาง */}
          <div className="flex items-center gap-3 text-lg">
            <span className="h-6 w-6 border-t-3 border-dashed border-[#26C6DA]" />
            <span className="font-medium text-foreground">{"เส้นทาง"}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ===================================================================
// COMPONENT: BusCard
// ===================================================================

/**
 * BusCard Component - การ์ดแสดงสถานะรถเมล์แต่ละคัน
 *
 * @param bus - สถานะรถเมล์
 *
 * Features:
 * - Header สีตามรถ พร้อมสถานะ/ความเร็ว
 * - แสดงจุดจอดปัจจุบันและจุดถัดไป
 * - Countdown timer เมื่อรถจอดอยู่
 * - Progress bars สำหรับผู้โดยสารและแบตเตอรี่
 * - Glow effect เมื่อรถกำลังเดินทาง
 */
function BusCard({ bus }: { bus: BusState }) {
  const c = getBusColor(bus.id)

  // ข้อมูลจุดจอด
  const currentStop = stops[bus.currentStopIndex]
  const nextStopIndex = (bus.currentStopIndex + 1) % stops.length
  const nextStop = stops[nextStopIndex]

  // คำนวณ ETA ไปยังจุดถัดไป
  const etaToNext = bus.isDwelling
    ? bus.dwellRemaining + TRAVEL_TIME_PER_SEGMENT // รอออก + เดินทาง
    : Math.round((1 - bus.progress) * TRAVEL_TIME_PER_SEGMENT) // เดินทางที่เหลือ

  return (
    <div
      className="overflow-hidden rounded-2xl border-2 shadow-sm transition-all"
      style={{
        borderColor: c.main,
        backgroundColor: "hsl(var(--card))",
        // Glow effect เมื่อรถกำลังวิ่ง
        boxShadow: !bus.isDwelling
          ? `0 0 16px 2px ${c.ring}, 0 0 0 1px ${c.main}`
          : undefined,
      }}
    >
      {/* 
        ===================================================================
        Card Header
        ===================================================================
        
        แสดง:
        - Icon รถ + ชื่อ
        - Badge สถานะ (จอดอยู่ / ความเร็ว กม./ชม.)
      */}
      <div className="px-5 py-4 text-white" style={{ backgroundColor: c.main }}>
        <div className="flex items-center justify-between">
          {/* ชื่อรถ */}
          <div className="flex items-center gap-2.5">
            <Bus className="h-7 w-7" />
            <h3 className="text-xl font-bold">{bus.name}</h3>
          </div>

          {/* Badge สถานะ */}
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-base backdrop-blur-sm ${
              bus.isDwelling ? "bg-white/20" : "bg-white/25"
            }`}
          >
            {/* Pulse dot เมื่อกำลังวิ่ง */}
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

      {/* Card Body */}
      <div className="space-y-4 p-5">
        {/* 
          Section: Current Location
          แสดงจุดจอดปัจจุบันพร้อม pulse dot
        */}
        <div
          className="rounded-xl p-4"
          style={{
            backgroundColor: bus.isDwelling ? c.light : "hsl(var(--secondary) / 0.5)",
          }}
        >
          <p className="text-base text-muted-foreground">
            {bus.isDwelling ? "จอดอยู่ที่" : "กำลังออกจาก"}
          </p>
          <p className="inline-flex items-center gap-2 text-lg font-semibold text-foreground">
            {currentStop.name}
            {/* Pulse dot เมื่อจอดอยู่ */}
            {bus.isDwelling && (
              <span className="relative flex h-3.5 w-3.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-red-500" />
              </span>
            )}
          </p>
          {/* ชื่อภาษาอังกฤษ (แสดงเฉพาะเมื่อจอด) */}
          {bus.isDwelling && (
            <p className="text-base" style={{ color: c.text }}>
              {currentStop.nameEn}
            </p>
          )}
        </div>

        {/* 
          Section: Dwell Countdown
          แสดงเฉพาะเมื่อรถจอดอยู่ - นับถอยหลังก่อนออก
        */}
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

        {/* 
          Section: Next Stop + ETA
        */}
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

        {/* Section: Speed */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <Gauge className="h-5 w-5 text-muted-foreground" />
            <span className="text-base text-muted-foreground">
              {"ความเร็วเฉลี่ย"}
            </span>
          </div>
          <span className="ml-auto text-base font-medium text-foreground">
            {"26 กม./ชม."}
          </span>
        </div>

        {/* Section: Passengers Progress Bar */}
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
          <span className="text-base font-medium text-foreground">
            {bus.passengers}
          </span>
        </div>

        {/* Section: Battery Progress Bar */}
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
                  // สีตามระดับแบตเตอรี่: เขียว > 50%, ส้ม > 20%, แดง <= 20%
                  backgroundColor:
                    bus.battery > 50
                      ? "#4CAF50"
                      : bus.battery > 20
                        ? "#FF9800"
                        : "#F44336",
                }}
              />
            </div>
          </div>
          <span className="text-base font-medium text-foreground">
            {bus.battery}%
          </span>
        </div>

        {/* Section: Status Badge */}
        <div className="flex items-center justify-between rounded-xl bg-secondary/50 px-5 py-3.5">
          <span className="text-base text-muted-foreground">{"สถานะ"}</span>
          <span
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-base font-medium text-white"
            style={{ backgroundColor: c.main }}
          >
            {/* Status dot: แดง=จอด, เขียว=วิ่ง */}
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

// ===================================================================
// COMPONENT: StopTimeline
// ===================================================================

/**
 * StopTimeline Component - Grid แสดง ETA ของแต่ละจุดจอด
 *
 * @param buses - Array สถานะรถเมล์ทั้ง 3 คัน
 *
 * Features:
 * - Grid 5 columns (responsive)
 * - แสดงรถที่จอดอยู่ พร้อม countdown
 * - แสดง ETA ของรถที่กำลังมา
 * - แสดง badges สิ่งอำนวยความสะดวก
 */
function StopTimeline({ buses }: { buses: BusState[] }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 lg:p-8">
      {/* Section Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FF9800]/10">
            <Clock className="h-5 w-5 text-[#FF9800]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {"เวลาเทียบและจุดจอด"}
            </h2>
            <p className="text-base text-muted-foreground">
              {"อัพเดต: ข้อมูลจราจรล่าสุดทุกจุดจอด \u00b7 3 คัน"}
            </p>
          </div>
        </div>

        {/* LIVE Badge */}
        <span className="flex items-center gap-1.5 rounded-full bg-[#F44336] px-3.5 py-1.5 text-base font-semibold text-white">
          <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
          LIVE
        </span>
      </div>

      {/* Stop Cards Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
        {stops.map((stop, idx) => {
          // ===================================================================
          // คำนวณข้อมูลสำหรับแต่ละจุดจอด
          // ===================================================================

          // ตรวจสอบว่ามีรถจอดอยู่ที่จุดนี้หรือไม่
          const dwellingBus = buses.find(
            (b) => b.currentStopIndex === idx && b.isDwelling
          )
          const dwellingColor = dwellingBus
            ? getBusColor(dwellingBus.id)
            : null

          // คำนวณ ETA ของรถที่กำลังมา (ไม่รวมรถที่จอดอยู่แล้ว)
          const approachingBuses = buses
            .filter((b) => !(b.currentStopIndex === idx && b.isDwelling))
            .map((b) => {
              const eta = calcEtaSeconds(b, idx)
              return { bus: b, eta: eta ?? Infinity, color: getBusColor(b.id) }
            })
            .filter((e) => e.eta > 0 && e.eta < Infinity)
            .sort((a, b) => a.eta - b.eta) // เรียงตาม ETA น้อยสุด

          const nextArrival = approachingBuses[0] || null

          // กำหนดสี card ตามสถานะ
          const cardBorder = dwellingColor
            ? dwellingColor.main
            : "hsl(var(--border))"
          const cardBg = dwellingColor ? dwellingColor.light : "hsl(var(--card))"

          return (
            <div
              key={stop.id}
              className="overflow-hidden rounded-xl border-2 transition-all duration-500"
              style={{ borderColor: cardBorder, backgroundColor: cardBg }}
            >
              {/* 
                Card Header
                สีตามรถที่จอด หรือสีเทาถ้าไม่มีรถ
              */}
              <div
                className="px-4 py-3 text-white"
                style={{
                  backgroundColor: dwellingColor
                    ? dwellingColor.main
                    : "#78909C",
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/25 text-sm font-bold">
                    {stop.code}
                  </span>
                  <span className="truncate text-base font-semibold">
                    {stop.name}
                  </span>
                  {/* Pulse dot เมื่อมีรถจอด */}
                  {dwellingBus && (
                    <span className="relative ml-auto flex h-3 w-3 shrink-0">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
                    </span>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="space-y-2 p-3">
                {/* แสดงรถที่จอดอยู่ */}
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
                      <span className="text-sm text-muted-foreground">
                        {"ออกอีก"}
                      </span>
                      <span
                        className="rounded-md px-3 py-1.5 font-mono text-sm font-bold text-white"
                        style={{ backgroundColor: dwellingColor.main }}
                      >
                        {formatTime(dwellingBus.dwellRemaining)}
                      </span>
                    </div>
                  </div>
                )}

                {/* แสดงรถที่กำลังมา (คันแรก) */}
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
                      <span className="text-sm text-muted-foreground">
                        {"นาที"}
                      </span>
                    </div>
                  </div>
                )}

                {/* แสดงรถที่กำลังมา (คันอื่นๆ) */}
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
                    <span className="text-sm" style={{ color: e.color.text }}>
                      {"ถึงใน"}
                    </span>
                    <span
                      className="ml-auto font-mono text-base font-bold"
                      style={{ color: e.color.main }}
                    >
                      {formatMinutes(e.eta)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {"นาที"}
                    </span>
                  </div>
                ))}

                {/* แสดงข้อความรอถ้าไม่มีรถ */}
                {!dwellingBus && approachingBuses.length === 0 && (
                  <div className="flex items-center gap-1.5 rounded-lg bg-secondary/50 px-3 py-2">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {"รอข้อมูล..."}
                    </span>
                  </div>
                )}

                {/* Facility Badges */}
                {stop.facilities.length > 0 && (
                  <div className="mt-1.5 border-t border-border/50 pt-2.5">
                    <p className="mb-1.5 text-sm font-medium text-muted-foreground">
                      {"สิ่งอำนวยความสะดวกใกล้เคียง"}
                    </p>
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

      {/* Legend Row */}
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

      {/* Warning Note */}
      <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-[#FFF3E0] px-5 py-3.5 text-base">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#FF9800]" />
        <span className="text-[#795548]">
          <span className="font-semibold text-[#FF9800]">{"คำเตือน: "}</span>
          {
            "รถเมล์จอดแต่ละจุด 5 นาที \u00b7 ใช้เวลาเดินทางระหว่างจุดจอดประมาณ 5 นาที \u00b7 แสดงข้อมูลตามเวลาจริง \u00b7 3 คันให้บริการ"
          }
        </span>
      </div>
    </div>
  )
}

// ===================================================================
// MAIN COMPONENT: LiveTracking
// ===================================================================

/**
 * LiveTracking Component - หน้าหลักสำหรับติดตามรถเมล์
 *
 * State:
 * - buses: Array สถานะรถเมล์ทั้ง 3 คัน
 *
 * Simulation:
 * - ใช้ useEffect + setInterval เพื่ออัพเดตทุก 2 วินาที
 * - simulateBuses() คำนวณการเคลื่อนที่และสถานะใหม่
 *
 * Layout:
 * - RouteMap: แผนที่เส้นทาง
 * - BusCard x3: การ์ดสถานะรถ (grid 3 columns)
 * - StopTimeline: ETA แต่ละจุดจอด
 */
export function LiveTracking() {
  // State: สถานะรถเมล์ทั้ง 3 คัน
  const [buses, setBuses] = useState<BusState[]>(initialBuses)

  /**
   * simulateBuses - อัพเดตสถานะรถเมล์ทุก tick
   *
   * Logic สำหรับแต่ละรถ:
   *
   * 1. ถ้าจอดอยู่ (isDwelling = true):
   *    - ลด dwellRemaining
   *    - ถ้า dwellRemaining <= 0: เริ่มวิ่งไปจุดถัดไป
   *    - ถ้า dwellRemaining <= 30: เปลี่ยนสถานะเป็น "กำลังจะออก"
   *
   * 2. ถ้ากำลังวิ่ง (isDwelling = false):
   *    - เพิ่ม progress ตาม SIM_SECONDS_PER_TICK / TRAVEL_TIME_PER_SEGMENT
   *    - สุ่มเปลี่ยนจำนวนผู้โดยสาร (15% โอกาส)
   *    - ถ้า progress >= 1: ถึงจุดถัดไป -> เริ่มจอด
   *
   * useCallback เพื่อป้องกัน re-create function ทุก render
   */
  const simulateBuses = useCallback(() => {
    setBuses((prev) =>
      prev.map((bus) => {
        // Clone เพื่อไม่ให้ mutate state เดิม
        const b = { ...bus }

        if (b.isDwelling) {
          // ===================================================================
          // กรณีจอดอยู่: ลด countdown และตรวจสอบว่าพร้อมออกหรือยัง
          // ===================================================================

          b.dwellRemaining = Math.max(0, b.dwellRemaining - SIM_SECONDS_PER_TICK)
          b.speed = 0

          if (b.dwellRemaining <= 0) {
            // พร้อมออก: เริ่มวิ่งไปจุดถัดไป
            b.isDwelling = false
            b.dwellRemaining = 0
            b.progress = 0
            b.status = "กำลังเดินทาง"
            b.speed = Math.round(15 + Math.random() * 15)
          } else if (b.dwellRemaining <= 30) {
            // เหลือน้อยกว่า 30 วินาที
            b.status = "กำลังจะออก"
          } else {
            b.status = "จอดรับผู้โดยสาร"
          }
        } else {
          // ===================================================================
          // กรณีกำลังวิ่ง: เพิ่ม progress และตรวจสอบว่าถึงจุดถัดไปหรือยัง
          // ===================================================================

          // คำนวณ progress increment
          const progressIncrement = SIM_SECONDS_PER_TICK / TRAVEL_TIME_PER_SEGMENT
          b.progress = Math.min(b.progress + progressIncrement, 1)

          // สุ่มความเร็ว 15-30 กม./ชม.
          b.speed = Math.round(15 + Math.random() * 15)
          b.status = "กำลังเดินทาง"

          // สุ่มเปลี่ยนจำนวนผู้โดยสาร (15% โอกาส)
          if (Math.random() < 0.15) {
            b.passengers = Math.max(
              0,
              Math.min(40, b.passengers + Math.round(Math.random() * 4 - 2))
            )
          }

          // ถึงจุดถัดไป
          if (b.progress >= 1) {
            b.currentStopIndex = (b.currentStopIndex + 1) % stops.length
            b.progress = 0
            b.speed = 0
            b.isDwelling = true
            b.dwellRemaining = DWELL_TIME
            b.status = "จอดรับผู้โดยสาร"

            // จำลองคนขึ้น-ลง
            const getOff = Math.round(Math.random() * Math.min(8, b.passengers))
            const getOn = Math.round(Math.random() * 10)
            b.passengers = Math.max(0, Math.min(40, b.passengers - getOff + getOn))

            // ลดแบตเตอรี่ (40% โอกาส ลด 1%)
            b.battery = Math.max(5, b.battery - (Math.random() < 0.4 ? 1 : 0))
          }
        }

        return b
      })
    )
  }, [])

  /**
   * useEffect - ตั้ง interval สำหรับ simulation
   *
   * - เรียก simulateBuses ทุก SIM_TICK (2000 ms)
   * - Cleanup: clearInterval เมื่อ unmount
   */
  useEffect(() => {
    const interval = setInterval(simulateBuses, SIM_TICK)
    return () => clearInterval(interval)
  }, [simulateBuses])

  // ===================================================================
  // RENDER
  // ===================================================================

  return (
    <div className="space-y-6">
      {/* แผนที่เส้นทาง */}
      <RouteMap buses={buses} />

      {/* การ์ดสถานะรถ 3 คัน */}
      <div className="grid gap-4 md:grid-cols-3">
        {buses.map((bus) => (
          <BusCard key={bus.id} bus={bus} />
        ))}
      </div>

      {/* Timeline แสดง ETA แต่ละจุดจอด */}
      <StopTimeline buses={buses} />
    </div>
  )
}
