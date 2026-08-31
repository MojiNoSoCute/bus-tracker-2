"use client"

import {
  generateSchedule,
  scheduleStops,
  scheduleStopCodes,
  ROUTES,
} from "@/lib/bus-data"
import { CalendarClock, Bus, Info, Zap, Clock, ShieldCheck, BatteryCharging, Accessibility } from "lucide-react"

const schedule = generateSchedule()

export function Schedule() {
  return (
    <div className="space-y-6">
      {/* 
        ===================================================================
        SECTION 1: ตารางเวลาเดินรถ มรภ.นครปฐม (Schedule Table)
        ===================================================================
      */}
      <div className="rounded-2xl border border-border bg-card p-5 lg:p-8 shadow-sm">
        {/* Section Header */}
        <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e63462]/10 text-[#e63462]">
              <CalendarClock className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                ตารางเวลาเดินรถเมล์ไฟฟ้า มรภ.นครปฐม
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                สาย 1: วงรอบหลักวิทยาเขต (Campus Main Loop) · จันทร์ - ศุกร์
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              เปิดให้บริการตามรอบปกติ
            </span>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="border-r border-[#d42d56] bg-[#e63462] px-4 py-3.5 text-left text-sm font-bold text-white whitespace-nowrap">
                  รอบออก (P1)
                </th>
                {scheduleStops.map((stop, idx) => (
                  <th
                    key={idx}
                    className="border-r border-[#d42d56] bg-[#e63462] px-2.5 py-3 text-center text-white last:border-r-0"
                  >
                    <div className="text-[11px] font-bold leading-tight line-clamp-1">
                      {stop}
                    </div>
                    <div className="text-[10px] font-bold opacity-80 mt-0.5">
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
                  className={rowIdx % 2 === 0 ? "bg-card hover:bg-slate-50/80" : "bg-muted/30 hover:bg-slate-50/80"}
                >
                  <td className="border-r border-border px-4 py-2.5 text-sm font-bold text-[#e63462] tabular-nums whitespace-nowrap">
                    {row.label} น.
                  </td>
                  {row.times.map((cell, cellIdx) => (
                    <td
                      key={cellIdx}
                      className="border-r border-border px-2 py-2.5 text-center text-xs text-foreground last:border-r-0 tabular-nums"
                    >
                      {cell ? `${cell}` : "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Note */}
        <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 text-xs text-amber-900 dark:text-amber-200">
          <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong>หมายเหตุการให้บริการ:</strong> รถเมล์ไฟฟ้า มรภ.นครปฐม ออกเดินรถทุก 20 นาที ในช่วงเวลาปกติ และทุก 10 นาที ในช่วงชั่วโมงเร่งด่วน (07:30 - 09:00 น. และ 16:00 - 17:30 น.) เวลาอาจคลาดเคลื่อนเล็กน้อยตามสภาพการจราจรและจำนวนผู้โดยสาร
          </div>
        </div>
      </div>

      {/* 
        ===================================================================
        SECTION 2: Service & Vehicle Information
        ===================================================================
      */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Service Info */}
        <div className="rounded-2xl border border-border bg-card p-5 lg:p-7 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e63462]/10 text-[#e63462]">
              <Info className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                ระเบียบและเวลาการให้บริการ
              </h3>
              <p className="text-xs text-muted-foreground">
                มหาวิทยาลัยราชภัฏนครปฐม
              </p>
            </div>
          </div>

          <div className="divide-y divide-border text-sm">
            {[
              { label: "วันเปิดให้บริการ", value: "วันจันทร์ - วันศุกร์ (เว้นวันหยุดนักขัตฤกษ์)" },
              { label: "ช่วงเวลาให้บริการ", value: "07:30 - 18:00 น." },
              { label: "ความถี่การออกรถ", value: "ทุก 10-20 นาที" },
              { label: "ระยะเวลาเดินรถรอบวิทยาเขต", value: "ประมาณ 25-30 นาที" },
              { label: "อัตราค่าโดยสาร", value: "ฟรี! สำหรับนักศึกษา อาจารย์ และบุคลากร" },
              { label: "จุดจอดทั้งหมด", value: "10 จุดจอดทั่ววิทยาเขต" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <span className="text-xs text-muted-foreground">{item.label}</span>
                <span className="text-xs font-semibold text-foreground text-right">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* EV Bus Vehicle Info */}
        <div className="rounded-2xl border border-border bg-card p-5 lg:p-7 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                สเปกและเทคโนโลยีรถเมล์ไฟฟ้า (EV Shuttle)
              </h3>
              <p className="text-xs text-muted-foreground">
                NPRU Green Campus Smart Mobility
              </p>
            </div>
          </div>

          <div className="divide-y divide-border text-sm">
            {[
              { label: "จำนวนรถที่ให้บริการ", value: "4 คัน (EV-01, EV-02, EV-03, EV-04)" },
              { label: "ความจุผู้โดยสาร", value: "24 ที่นั่ง + 1 ช่องทางลาดวีลแชร์" },
              { label: "ระบบพลังงาน", value: "ไฟฟ้า 100% แบตเตอรี่ลิเธียม LFP" },
              { label: "ความเร็วควบคุมในวิทยาเขต", value: "จำกัดไม่เกิน 25 กม./ชม. เพื่อความปลอดภัย" },
              { label: "ระบบอำนวยความสะดวก", value: "ปรับอากาศ, Wi-Fi, กล้อง CCTV, GPS Tracker" },
              { label: "สถานีชาร์จไฟกลาง (EV Hub)", value: "อาคาร 4 กองบริการการศึกษา" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <span className="text-xs text-muted-foreground">{item.label}</span>
                <span className="text-xs font-semibold text-foreground text-right">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
