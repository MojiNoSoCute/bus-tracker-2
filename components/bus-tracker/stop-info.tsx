/**
 * ===================================================================
 * stop-info.tsx - หน้าแสดงข้อมูลจุดจอดทั้งหมด
 * ===================================================================
 *
 * แสดง Card สำหรับแต่ละจุดจอดรถเมล์ (10 จุด)
 * พร้อมข้อมูลสิ่งอำนวยความสะดวกใกล้เคียง
 *
 * Features:
 * - Responsive grid (1 column mobile, 2 tablet, 3 desktop)
 * - Gradient header ตามสีที่กำหนด
 * - Badge สิ่งอำนวยความสะดวกพร้อม icon
 * - แสดงพิกัดตำแหน่งบนแผนที่
 *
 * Data Source:
 * - stops[] จาก bus-data.ts (ข้อมูลจุดจอด)
 * - FACILITY_MAP จาก bus-data.ts (ข้อมูลสิ่งอำนวยความสะดวก)
 *
 * @author Bus Tracker Team
 */

"use client"

// ===================================================================
// IMPORTS
// ===================================================================

// Data
import { stops, FACILITY_MAP } from "@/lib/bus-data"

// Icons สำหรับสิ่งอำนวยความสะดวก
import {
  Droplets, // ห้องน้ำ
  ShoppingCart, // ตลาดนัด
  CreditCard, // ตู้ ATM
  Coffee, // ร้านกาแฟ
  CircleParking, // ที่จอดรถ
  Wifi, // Wi-Fi
  UtensilsCrossed, // ร้านอาหาร
  Pill, // ร้านยา
  Store, // ร้านสะดวกซื้อ
  Dumbbell, // ฟิตเนส
  BookOpen, // ห้องสมุด
  Heart, // โรงพยาบาล
} from "lucide-react"
import type React from "react"

// ===================================================================
// CONSTANTS
// ===================================================================

/**
 * FACILITY_ICONS - Mapping ระหว่าง icon name กับ React Component
 *
 * Key: ชื่อ icon ที่กำหนดใน FACILITY_MAP.icon
 * Value: Lucide icon component ที่จะแสดง
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
 * cardColors - สี Gradient สำหรับ header ของแต่ละ card
 *
 * แบ่งเป็น 4 กลุ่มสี (กลุ่มละ 2-3 จุดจอด):
 * - ชมพู (P1-P3): สี brand หลัก
 * - ส้ม (P4-P6): สี accent
 * - เขียว (P7-P9): สี success
 * - ฟ้า (P10): สี info
 *
 * การจัดกลุ่มนี้ช่วยให้ผู้ใช้จำกลุ่มจุดจอดได้ง่ายขึ้น
 */
const cardColors = [
  "from-[#e63462] to-[#fe5196]", // P1 - ชมพู
  "from-[#e63462] to-[#fe5196]", // P2 - ชมพู
  "from-[#e63462] to-[#fe5196]", // P3 - ชมพู
  "from-[#FF9800] to-[#FFB74D]", // P4 - ส้ม
  "from-[#FF9800] to-[#FFB74D]", // P5 - ส้ม
  "from-[#FF9800] to-[#FFB74D]", // P6 - ส้ม
  "from-[#4CAF50] to-[#66BB6A]", // P7 - เขียว
  "from-[#4CAF50] to-[#66BB6A]", // P8 - เขียว
  "from-[#4CAF50] to-[#66BB6A]", // P9 - เขียว
  "from-[#26C6DA] to-[#4DD0E1]", // P10 - ฟ้า
]

// ===================================================================
// MAIN COMPONENT
// ===================================================================

/**
 * StopInfo Component - แสดง Grid ของ Card จุดจอดทั้งหมด
 *
 * Layout:
 * - Mobile (default): 1 column
 * - Tablet (sm:): 2 columns
 * - Desktop (lg:): 3 columns
 *
 * แต่ละ Card ประกอบด้วย:
 * 1. Header (gradient) - หมายเลข, ชื่อไทย, ชื่ออังกฤษ
 * 2. รหัสจุดจอด (P1-P10)
 * 3. Badges สิ่งอำนวยความสะดวก
 * 4. พิกัด X, Y บนแผนที่
 */
export function StopInfo() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stops.map((stop, idx) => (
        <div
          key={stop.id}
          className="overflow-hidden rounded-2xl border border-border bg-card"
        >
          {/* 
            ===================================================================
            CARD HEADER
            ===================================================================
            
            แสดง:
            - หมายเลขจุดจอดใน badge กลม
            - ชื่อจุดจอดภาษาไทย (ตัวหนา)
            - ชื่อภาษาอังกฤษ (ตัวจาง)
            
            Gradient จากซ้ายไปขวา ตามสีที่กำหนดใน cardColors
          */}
          <div
            className={`bg-gradient-to-r ${cardColors[idx]} flex items-center gap-3.5 px-5 py-4 text-white`}
          >
            {/* Badge หมายเลขจุดจอด */}
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/25 text-base font-bold">
              {stop.id}
            </span>

            {/* ชื่อจุดจอด */}
            <div>
              <h3 className="text-lg font-bold leading-tight">{stop.name}</h3>
              <p className="text-sm text-white/80">{stop.nameEn}</p>
            </div>
          </div>

          {/* 
            ===================================================================
            CARD BODY
            ===================================================================
          */}
          <div className="space-y-5 p-5">
            {/* 
              Section 1: รหัสจุดจอด
              แสดงรหัส P1, P2, ... ตัวใหญ่
            */}
            <div>
              <p className="text-sm text-muted-foreground">{"รหัสจุดจอด"}</p>
              <p className="text-3xl font-bold text-foreground">P{stop.id}</p>
            </div>

            {/* 
              Section 2: สิ่งอำนวยความสะดวกใกล้เคียง
              แสดง badges พร้อม icon และสีตามประเภท
            */}
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {"สิ่งอำนวยความสะดวกใกล้เคียง"}
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {stop.facilities.map((fName) => {
                  // ดึงข้อมูลสิ่งอำนวยความสะดวกจาก FACILITY_MAP
                  const fac = FACILITY_MAP[fName]
                  if (!fac) return null

                  // ดึง icon component จาก FACILITY_ICONS
                  const Icon = FACILITY_ICONS[fac.icon]

                  return (
                    <span
                      key={fName}
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-white"
                      style={{ backgroundColor: fac.color }}
                    >
                      {Icon && <Icon className="h-3.5 w-3.5" />}
                      {fac.label}
                    </span>
                  )
                })}
              </div>
            </div>

            {/* 
              Section 3: พิกัดตำแหน่งบนแผนที่
              แสดงค่า X และ Y ใน grid 2 columns
              
              หมายเหตุ: ค่านี้ใช้สำหรับ reference เท่านั้น
              ไม่ใช่พิกัด GPS จริง
            */}
            <div>
              <p className="text-sm text-muted-foreground">
                {"ตำแหน่งพิกัดแผนที่"}
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2.5">
                {/* พิกัด X */}
                <div className="rounded-lg bg-secondary/50 px-4 py-2.5 text-center">
                  <p className="text-xs text-muted-foreground">X</p>
                  <p className="text-base font-bold text-foreground">
                    {stop.x}
                  </p>
                </div>
                {/* พิกัด Y */}
                <div className="rounded-lg bg-secondary/50 px-4 py-2.5 text-center">
                  <p className="text-xs text-muted-foreground">Y</p>
                  <p className="text-base font-bold text-foreground">
                    {stop.y}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
