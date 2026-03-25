/**
 * ===================================================================
 * schedule.tsx - หน้าตารางเวลาเดินรถ
 * ===================================================================
 *
 * แสดงตารางเวลาเดินรถเมล์ไฟฟ้าและข้อมูลการให้บริการ
 *
 * โครงสร้างหน้า:
 * 1. ตารางเวลา - แสดงเวลาถึงแต่ละจุดจอดของแต่ละรอบ
 * 2. ข้อมูลการให้บริการ - วัน/เวลา/ความถี่
 * 3. ข้อมูลรถเมล์ - จำนวน/ความจุ/ความเร็ว
 *
 * Data Source:
 * - generateSchedule() จาก bus-data.ts สร้างตารางเวลา
 * - scheduleStops, scheduleStopCodes สำหรับ column headers
 *
 * @author Bus Tracker Team
 */

"use client"

// ===================================================================
// IMPORTS
// ===================================================================

// Data และ utilities
import {
  generateSchedule,
  scheduleStops,
  scheduleStopCodes,
} from "@/lib/bus-data"

// Icons จาก Lucide
import { CalendarClock, Bus, Info, Zap } from "lucide-react"

// ===================================================================
// CONSTANTS
// ===================================================================

/**
 * schedule - ตารางเวลาเดินรถที่ generate ไว้ล่วงหน้า
 *
 * โครงสร้าง: Array ของ { label: string, times: string[] }
 * - label: เวลาออกจากจุดเริ่มต้น (เช่น "08:00")
 * - times: เวลาถึงแต่ละจุดจอด (10 จุด)
 *
 * หมายเหตุ: Generate นอก component เพื่อไม่ต้องคำนวณใหม่ทุก render
 */
const schedule = generateSchedule()

// ===================================================================
// MAIN COMPONENT
// ===================================================================

/**
 * Schedule Component - หน้าแสดงตารางเวลา
 *
 * เป็น Stateless Component (ไม่มี state)
 * ข้อมูลทั้งหมดเป็น static data จาก bus-data.ts
 *
 * Layout:
 * - ใช้ space-y-6 เพื่อเว้นระยะระหว่าง sections
 * - Card แบบ rounded-2xl ตามธีมของแอป
 */
export function Schedule() {
  return (
    <div className="space-y-6">
      {/* 
        ===================================================================
        SECTION 1: ตารางเวลา (Schedule Table)
        ===================================================================
        
        แสดงตารางเวลาเดินรถตั้งแต่ 08:00 - 16:00
        - แถวแรก (header): ชื่อจุดจอดทั้ง 10 จุด
        - แถวที่เหลือ: เวลาถึงแต่ละจุดของแต่ละรอบ (ทุก 30 นาที)
        
        Features:
        - overflow-x-auto: scroll แนวนอนบน mobile
        - min-w-[850px]: กำหนดความกว้างขั้นต่ำของตาราง
        - สลับสีแถว (zebra striping) เพื่อให้อ่านง่าย
      */}
      <div className="rounded-2xl border border-border bg-card p-5 lg:p-8">
        {/* Section Header */}
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e63462]/10">
            <CalendarClock className="h-5 w-5 text-[#e63462]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {"ตารางเวลารถเมล์ไฟฟ้า"}
            </h2>
            <p className="text-base text-muted-foreground">
              {"เส้นทางวนรอบ · ประจำวันจันทร์ - ศุกร์"}
            </p>
          </div>
        </div>

        {/* Table Container - เพิ่ม scroll แนวนอนสำหรับหน้าจอเล็ก */}
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[850px] border-collapse text-sm">
            {/* 
              Table Header
              - พื้นหลังสีชมพู (#e63462) ตามธีมหลัก
              - แสดงชื่อจุดจอด (บรรทัดบน) และรหัส P1-P10 (บรรทัดล่าง)
            */}
            <thead>
              <tr>
                {/* Column แรก: หัวข้อ "เวลาออก" */}
                <th className="border-r border-[#d42d56] bg-[#e63462] px-4 py-3 text-left text-base text-white">
                  {"เวลาออก"}
                </th>

                {/* Columns สำหรับแต่ละจุดจอด */}
                {scheduleStops.map((stop, idx) => (
                  <th
                    key={idx}
                    className="border-r border-[#d42d56] bg-[#e63462] px-3 py-3 text-center text-white last:border-r-0"
                  >
                    {/* ชื่อจุดจอดภาษาไทย */}
                    <div className="text-xs font-semibold leading-tight">
                      {stop}
                    </div>
                    {/* รหัสจุดจอด (P1, P2, ...) */}
                    <div className="text-[11px] font-normal opacity-70">
                      {scheduleStopCodes[idx]}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* 
              Table Body
              - สลับสีแถว: คู่=สีขาว, คี่=สีชมพูอ่อน
              - เวลาออก (column แรก) ใช้สีชมพูเข้มและตัวหนา
            */}
            <tbody>
              {schedule.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  className={rowIdx % 2 === 0 ? "bg-card" : "bg-[#FFF0F3]"}
                >
                  {/* Column เวลาออก */}
                  <td className="border-r border-border px-4 py-3 text-base font-bold text-[#e63462]">
                    {row.label}
                  </td>

                  {/* Columns เวลาถึงแต่ละจุดจอด */}
                  {row.times.map((cell, cellIdx) => (
                    <td
                      key={cellIdx}
                      className="border-r border-border px-3 py-3 text-center text-foreground last:border-r-0"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 
          หมายเหตุใต้ตาราง
          - พื้นหลังสีส้มอ่อน (#FFF3E0) เพื่อเน้นให้เห็น
          - อธิบายเกี่ยวกับเส้นทางวนรอบและความไม่แน่นอนของตาราง
        */}
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-[#FFF3E0] px-5 py-3.5 text-base">
          <span className="font-semibold text-[#FF9800]">{"หมายเหตุ:"}</span>
          <span className="text-[#795548]">
            {
              "รถเมล์ไฟฟ้าวิ่งเป็นเส้นทางวนรอบ หน้าเกษตรจุดสุดท้ายจะวนกลับมาที่จุดเริ่มต้นใหม่ · ตารางเวลาอาจมีการเปลี่ยนแปลงตามสภาพการจราจร"
            }
          </span>
        </div>
      </div>

      {/* 
        ===================================================================
        SECTION 2 & 3: Info Cards (ข้อมูลการให้บริการ + ข้อมูลรถเมล์)
        ===================================================================
        
        แสดง 2 cards เรียงกัน (1 column บน mobile, 2 columns บน tablet+)
        แต่ละ card แสดงข้อมูลแบบ key-value pairs
      */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* 
          Card 1: ข้อมูลการให้บริการ
          - วันให้บริการ
          - เวลาให้บริการ
          - ความถี่
          - ระยะเวลาเดินทาง
          - ประเภทเส้นทาง
        */}
        <div className="rounded-2xl border border-border bg-card p-5 lg:p-8">
          {/* Card Header */}
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e63462]/10">
              <Info className="h-5 w-5 text-[#e63462]" />
            </div>
            <h3 className="text-lg font-bold text-foreground">
              {"ข้อมูลการให้บริการ"}
            </h3>
          </div>

          {/* Card Content - รายการข้อมูล */}
          <div className="space-y-0">
            {[
              { label: "วันให้บริการ", value: "จันทร์ - ศุกร์" },
              { label: "เวลาให้บริการ", value: "08:00 - 16:45 น." },
              { label: "ความถี่", value: "ทุก 30 นาที" },
              { label: "ระยะเวลาเดินทางวนเวียง", value: "ประมาณ 45-50 นาที" },
              { label: "ประเภทเส้นทาง", value: "วนรอบ (Circular Route)" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between border-b border-border px-1 py-3.5 last:border-0"
              >
                <span className="text-base text-muted-foreground">
                  {item.label}
                </span>
                <span className="text-base font-semibold text-foreground">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 
          Card 2: ข้อมูลรถเมล์ไฟฟ้า
          - จำนวนรถ
          - ความจุ
          - ความเร็วสูงสุด/เฉลี่ย
          - ระบบขับเคลื่อน (มี icon พิเศษ)
          - จำนวนจุดจอด
        */}
        <div className="rounded-2xl border border-border bg-card p-5 lg:p-8">
          {/* Card Header */}
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e63462]/10">
              <Bus className="h-5 w-5 text-[#e63462]" />
            </div>
            <h3 className="text-lg font-bold text-foreground">
              {"ข้อมูลรถเมล์ไฟฟ้า"}
            </h3>
          </div>

          {/* Card Content - รายการข้อมูลรถ */}
          <div className="space-y-0">
            {[
              { label: "จำนวนรถ", value: "3 คัน" },
              { label: "ความจุ", value: "40 ที่นั่ง/คัน" },
              { label: "ความเร็วสูงสุด", value: "30 กม./ชม." },
              { label: "ความเร็วเฉลี่ย", value: "20 กม./ชม." },
              {
                label: "ระบบขับเคลื่อน",
                value: "พลังงานไฟฟ้า 100%",
                icon: true, // แสดง icon สายฟ้าสีเขียว
              },
              { label: "จุดจอดทั้งหมด", value: "10 จุด" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between border-b border-border px-1 py-3.5 last:border-0"
              >
                <span className="text-base text-muted-foreground">
                  {item.label}
                </span>
                <span className="flex items-center gap-1 text-base font-semibold text-foreground">
                  {/* แสดง icon Zap สำหรับรายการ "ระบบขับเคลื่อน" */}
                  {"icon" in item && item.icon && (
                    <Zap className="h-4 w-4 text-[#4CAF50]" />
                  )}
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
