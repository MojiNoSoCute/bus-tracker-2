"use client"

import { generateSchedule, scheduleStops, scheduleStopCodes } from "@/lib/bus-data"
import { CalendarClock, Bus, Info, Zap } from "lucide-react"

const schedule = generateSchedule()

export function Schedule() {
  return (
    <div className="space-y-6">
      {/* Schedule Table */}
      <div className="rounded-2xl border border-border bg-card p-4 lg:p-6">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e63462]/10">
            <CalendarClock className="h-4 w-4 text-[#e63462]" />
          </div>
          <div>
            <h2 className="font-bold text-foreground">{"ตารางเวลารถเมล์ไฟฟ้า"}</h2>
            <p className="text-xs text-muted-foreground">
              {"เส้นทางวนรอบ · ประจำวันจันทร์ - ศุกร์"}
            </p>
          </div>
        </div>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[850px] border-collapse text-xs">
            <thead>
              <tr>
                <th className="border-r border-[#d42d56] bg-[#e63462] px-3 py-2.5 text-left text-white">
                  {"เวลาออก"}
                </th>
                {scheduleStops.map((stop, idx) => (
                  <th
                    key={idx}
                    className="border-r border-[#d42d56] bg-[#e63462] px-2 py-2.5 text-center text-white last:border-r-0"
                  >
                    <div className="text-[10px] font-semibold leading-tight">
                      {stop}
                    </div>
                    <div className="text-[9px] font-normal opacity-70">
                      {scheduleStopCodes[idx]}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {schedule.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  className={
                    rowIdx % 2 === 0 ? "bg-card" : "bg-[#FFF0F3]"
                  }
                >
                  <td className="border-r border-border px-3 py-2.5 font-bold text-[#e63462]">
                    {row.label}
                  </td>
                  {row.times.map((cell, cellIdx) => (
                    <td
                      key={cellIdx}
                      className="border-r border-border px-2 py-2.5 text-center text-foreground last:border-r-0"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-[#FFF3E0] px-4 py-3 text-xs">
          <span className="font-semibold text-[#FF9800]">{"หมายเหตุ:"}</span>
          <span className="text-[#795548]">
            {"รถเมล์ไฟฟ้าวิ่งเป็นเส้นทางวนรอบ หน้าเกษตรจุดสุดท้ายจะวนกลับมาที่จุดเริ่มต้นใหม่ · ตารางเวลาอาจมีการเปลี่ยนแปลงตามสภาพการจราจร"}
          </span>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Service Info */}
        <div className="rounded-2xl border border-border bg-card p-4 lg:p-6">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e63462]/10">
              <Info className="h-4 w-4 text-[#e63462]" />
            </div>
            <h3 className="font-bold text-foreground">{"ข้อมูลการให้บริการ"}</h3>
          </div>
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
                className="flex items-center justify-between border-b border-border px-1 py-3 last:border-0"
              >
                <span className="text-sm text-muted-foreground">
                  {item.label}
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bus Info */}
        <div className="rounded-2xl border border-border bg-card p-4 lg:p-6">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e63462]/10">
              <Bus className="h-4 w-4 text-[#e63462]" />
            </div>
            <h3 className="font-bold text-foreground">{"ข้อมูลรถเมล์ไฟฟ้า"}</h3>
          </div>
          <div className="space-y-0">
            {[
              { label: "จำนวนรถ", value: "3 คัน" },
              { label: "ความจุ", value: "40 ที่นั่ง/คัน" },
              { label: "ความเร็วสูงสุด", value: "30 กม./ชม." },
              { label: "ความเร็วเฉลี่ย", value: "20 กม./ชม." },
              { label: "ระบบขับเคลื่อน", value: "พลังงานไฟฟ้า 100%", icon: true },
              { label: "จุดจอดทั้งหมด", value: "10 จุด" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between border-b border-border px-1 py-3 last:border-0"
              >
                <span className="text-sm text-muted-foreground">
                  {item.label}
                </span>
                <span className="flex items-center gap-1 text-sm font-semibold text-foreground">
                  {"icon" in item && item.icon && (
                    <Zap className="h-3.5 w-3.5 text-[#4CAF50]" />
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
