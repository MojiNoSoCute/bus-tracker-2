/**
 * ===================================================================
 * report-problem.tsx - หน้าแบบฟอร์มรายงานปัญหา
 * ===================================================================
 *
 * แบบฟอร์มสำหรับให้ผู้ใช้แจ้งปัญหาเกี่ยวกับระบบรถเมล์
 *
 * โครงสร้างฟอร์ม:
 * 1. ประเภทปัญหา (บังคับ) - เลือกจาก 8 ประเภท
 * 2. จุดจอดที่เกี่ยวข้อง (ไม่บังคับ) - dropdown
 * 3. รถเมล์ที่เกี่ยวข้อง (ไม่บังคับ) - เลือกได้ 3 คัน
 * 4. รายละเอียดปัญหา (บังคับ) - textarea
 * 5. ข้อมูลติดต่อ (ไม่บังคับ) - ชื่อ, เบอร์โทร
 *
 * State Management:
 * - selectedType: ประเภทปัญหาที่เลือก
 * - selectedStop: จุดจอดที่เกี่ยวข้อง
 * - selectedBus: รถเมล์ที่เกี่ยวข้อง
 * - description: รายละเอียดปัญหา
 * - name, phone: ข้อมูลติดต่อ
 * - submitted: สถานะส่งฟอร์มสำเร็จ
 *
 * @author Bus Tracker Team
 */

"use client"

import { useState } from "react"

// ===================================================================
// IMPORTS
// ===================================================================

// Data
import { problemTypes, stops, initialBuses } from "@/lib/bus-data"

// Icons
import {
  AlertCircle, // Header icon
  Clock, // ปัญหา: รถมาช้า
  Users, // ปัญหา: คนเยอะ
  Wrench, // ปัญหา: รถเสีย
  Volume2, // ปัญหา: สิ่งอำนวยความสะดวกเสีย
  ShieldAlert, // ปัญหา: ความปลอดภัย
  Sparkles, // ปัญหา: ความสะอาด
  User, // ปัญหา: พฤติกรรมคนขับ
  MoreHorizontal, // ปัญหา: อื่นๆ
  Bus, // รถเมล์
  Send, // ปุ่มส่ง
  Info, // หมายเหตุ
  Phone, // เบอร์โทร
  UserCircle, // ชื่อ
} from "lucide-react"

// ===================================================================
// CONSTANTS
// ===================================================================

/**
 * iconMap - Mapping ชื่อ icon จาก problemTypes ไปยัง Lucide component
 *
 * Key: ชื่อ icon ที่กำหนดใน problemTypes[].icon
 * Value: Lucide icon component
 */
const iconMap: Record<string, React.ElementType> = {
  clock: Clock,
  users: Users,
  wrench: Wrench,
  volume: Volume2,
  alert: ShieldAlert,
  sparkles: Sparkles,
  user: User,
  more: MoreHorizontal,
}

// ===================================================================
// MAIN COMPONENT
// ===================================================================

/**
 * ReportProblem Component - แบบฟอร์มรายงานปัญหา
 *
 * Features:
 * - Form validation (ต้องเลือกประเภทปัญหาและกรอกรายละเอียด)
 * - แสดงหน้า success เมื่อส่งสำเร็จ (3 วินาที แล้ว reset)
 * - Responsive design (mobile-first)
 *
 * หมายเหตุ:
 * - ฟอร์มนี้เป็น UI เท่านั้น ยังไม่ได้เชื่อมต่อ backend จริง
 * - การส่งฟอร์มจะแสดงหน้า success แล้ว reset
 */
export function ReportProblem() {
  // ===================================================================
  // STATE
  // ===================================================================

  // ประเภทปัญหาที่เลือก (null = ยังไม่เลือก)
  const [selectedType, setSelectedType] = useState<string | null>(null)

  // จุดจอดที่เกี่ยวข้อง (string เพื่อใช้กับ select)
  const [selectedStop, setSelectedStop] = useState("")

  // รถเมล์ที่เกี่ยวข้อง (null = ไม่เลือก)
  const [selectedBus, setSelectedBus] = useState<number | null>(null)

  // รายละเอียดปัญหา
  const [description, setDescription] = useState("")

  // ข้อมูลติดต่อ
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")

  // สถานะส่งฟอร์มสำเร็จ
  const [submitted, setSubmitted] = useState(false)

  // ===================================================================
  // EVENT HANDLERS
  // ===================================================================

  /**
   * handleSubmit - จัดการเมื่อกดปุ่มส่งฟอร์ม
   *
   * Flow:
   * 1. แสดงหน้า success (submitted = true)
   * 2. รอ 3 วินาที
   * 3. Reset ทุก state กลับค่าเริ่มต้น
   *
   * TODO: เพิ่มการส่งข้อมูลไป API จริง
   */
  const handleSubmit = () => {
    // แสดงหน้า success
    setSubmitted(true)

    // รอ 3 วินาที แล้ว reset
    setTimeout(() => {
      setSubmitted(false)
      setSelectedType(null)
      setSelectedStop("")
      setSelectedBus(null)
      setDescription("")
      setName("")
      setPhone("")
    }, 3000)
  }

  // ===================================================================
  // RENDER: SUCCESS STATE
  // ===================================================================

  /**
   * แสดงหน้า Success เมื่อส่งฟอร์มสำเร็จ
   *
   * ประกอบด้วย:
   * - Icon เครื่องหมายถูกสีเขียว
   * - ข้อความขอบคุณ
   * - หน้านี้จะแสดง 3 วินาที แล้ว reset กลับฟอร์ม
   */
  if (submitted) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card py-16">
        {/* Icon เครื่องหมายถูก */}
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#4CAF50]/10">
          <svg
            className="h-8 w-8 text-[#4CAF50]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {/* ข้อความ */}
        <h2 className="text-2xl font-bold text-foreground">
          {"ส่งรายงานเรียบร้อยแล้ว!"}
        </h2>
        <p className="text-base text-muted-foreground">
          {"ขอบคุณที่แจ้งปัญหา ทีมงานจะดำเนินการแก้ไขโดยเร็ว"}
        </p>
      </div>
    )
  }

  // ===================================================================
  // RENDER: FORM STATE
  // ===================================================================

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* 
        ===================================================================
        CARD 1: แบบฟอร์มหลัก
        ===================================================================
      */}
      <div className="rounded-2xl border border-border bg-card p-5 lg:p-8">
        {/* Form Header */}
        <div className="mb-6 flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e63462]/10">
            <AlertCircle className="h-6 w-6 text-[#e63462]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {"รายงานปัญหา"}
            </h2>
            <p className="text-base text-muted-foreground">
              {"แจ้งปัญหาเพื่อให้ทีมงานดำเนินการแก้ไข"}
            </p>
          </div>
        </div>

        {/* 
          ===================================================================
          FIELD 1: ประเภทปัญหา (บังคับ)
          ===================================================================
          
          แสดงเป็น grid 2x4 (4 columns บน tablet+, 2 บน mobile)
          เมื่อคลิกจะ highlight ด้วยสีชมพู
        */}
        <div className="mb-6">
          <p className="mb-3 text-base font-semibold text-foreground">
            {"ประเภทปัญหา"} <span className="text-[#e63462]">*</span>
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {problemTypes.map((pt) => {
              // ดึง icon component (fallback: MoreHorizontal)
              const Icon = iconMap[pt.icon] || MoreHorizontal
              const isSelected = selectedType === pt.id

              return (
                <button
                  key={pt.id}
                  onClick={() => setSelectedType(pt.id)}
                  className={`flex items-center gap-2.5 rounded-xl border-2 p-4 text-left text-sm font-medium transition-all ${
                    isSelected
                      ? "border-[#e63462] bg-[#e63462]/5 text-[#e63462]"
                      : "border-border bg-card text-foreground hover:border-[#e63462]/30 hover:bg-secondary/30"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span>{pt.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* 
          ===================================================================
          FIELD 2: จุดจอดที่เกี่ยวข้อง (ไม่บังคับ)
          ===================================================================
          
          Dropdown select แสดงจุดจอดทั้ง 10 จุด
        */}
        <div className="mb-6">
          <p className="mb-3 text-base font-semibold text-foreground">
            {"จุดจอดที่เกี่ยวข้อง (ถ้ามี)"}
          </p>
          <select
            value={selectedStop}
            onChange={(e) => setSelectedStop(e.target.value)}
            className="w-full rounded-xl border border-border bg-card px-4 py-3.5 text-base text-foreground outline-none focus:border-[#e63462] focus:ring-1 focus:ring-[#e63462]"
          >
            <option value="">{"เลือกจุดจอด..."}</option>
            {stops.map((s) => (
              <option key={s.id} value={s.id.toString()}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* 
          ===================================================================
          FIELD 3: รถเมล์ที่เกี่ยวข้อง (ไม่บังคับ)
          ===================================================================
          
          แสดงปุ่ม 3 คัน พร้อมสีประจำรถ
          คลิกซ้ำเพื่อยกเลิกการเลือก
        */}
        <div className="mb-6">
          <p className="mb-3 text-base font-semibold text-foreground">
            {"รถเมล์ที่เกี่ยวข้อง (ถ้ามี)"}
          </p>
          <div className="flex flex-wrap gap-3">
            {initialBuses.map((bus) => {
              // สีประจำรถแต่ละคัน
              const busColors: Record<number, string> = {
                1: "#E53935", // แดง
                2: "#F9A825", // เหลือง
                3: "#7B1FA2", // ม่วง
              }
              const color = busColors[bus.id] || "#E53935"

              return (
                <button
                  key={bus.id}
                  onClick={() =>
                    // Toggle: คลิกซ้ำ = ยกเลิก
                    setSelectedBus(bus.id === selectedBus ? null : bus.id)
                  }
                  className={`flex items-center gap-2 rounded-xl border-2 px-4 py-3 transition-all ${
                    selectedBus === bus.id
                      ? "bg-opacity-5"
                      : "border-border bg-card hover:bg-secondary/30"
                  }`}
                  style={{
                    borderColor: selectedBus === bus.id ? color : undefined,
                    backgroundColor:
                      selectedBus === bus.id ? `${color}0D` : undefined, // 0D = 5% opacity
                  }}
                >
                  {/* Badge สีรถ */}
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full"
                    style={{ backgroundColor: color }}
                  >
                    <Bus className="h-4 w-4 text-white" />
                  </div>

                  {/* ชื่อรถ */}
                  <div className="text-left">
                    <p className="text-base font-semibold text-foreground">
                      {bus.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {`รถคัน ${bus.id}`}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* 
          ===================================================================
          FIELD 4: รายละเอียดปัญหา (บังคับ)
          ===================================================================
          
          Textarea สำหรับอธิบายปัญหา
        */}
        <div className="mb-6">
          <p className="mb-3 text-base font-semibold text-foreground">
            {"รายละเอียดปัญหา"} <span className="text-[#e63462]">*</span>
          </p>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="โปรดอธิบายปัญหาที่พบอย่างละเอียด..."
            rows={4}
            className="w-full resize-none rounded-xl border border-border bg-card px-4 py-3.5 text-base text-foreground outline-none placeholder:text-muted-foreground focus:border-[#e63462] focus:ring-1 focus:ring-[#e63462]"
          />
        </div>
      </div>

      {/* 
        ===================================================================
        CARD 2: ข้อมูลติดต่อ (ไม่บังคับ)
        ===================================================================
      */}
      <div className="rounded-2xl border border-border bg-card p-5 lg:p-8">
        <h3 className="mb-5 text-base font-bold text-foreground">
          {"ข้อมูลติดต่อ (ไม่บังคับ)"}
        </h3>
        <div className="space-y-4">
          {/* ชื่อ-นามสกุล */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
              <UserCircle className="h-4 w-4" />
              {"ชื่อ-นามสกุล"}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="กรอกชื่อของคุณ"
              className="w-full rounded-xl border border-border bg-card px-4 py-3.5 text-base text-foreground outline-none placeholder:text-muted-foreground focus:border-[#e63462] focus:ring-1 focus:ring-[#e63462]"
            />
          </div>

          {/* เบอร์โทรศัพท์ */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              {"เบอร์โทรศัพท์"}
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0XX-XXX-XXXX"
              className="w-full rounded-xl border border-border bg-card px-4 py-3.5 text-base text-foreground outline-none placeholder:text-muted-foreground focus:border-[#e63462] focus:ring-1 focus:ring-[#e63462]"
            />
          </div>
        </div>
      </div>

      {/* 
        ===================================================================
        SUBMIT BUTTON
        ===================================================================
        
        Disabled ถ้า:
        - ยังไม่เลือกประเภทปัญหา (!selectedType)
        - ยังไม่กรอกรายละเอียด (!description)
      */}
      <button
        onClick={handleSubmit}
        disabled={!selectedType || !description}
        className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#e63462] to-[#fe5196] px-6 py-4.5 text-lg font-bold text-white shadow-lg transition-all hover:opacity-90 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Send className="h-5 w-5" />
        {"ส่งรายงาน"}
      </button>

      {/* 
        ===================================================================
        DISCLAIMER
        ===================================================================
        
        ข้อความเตือนเกี่ยวกับกรณีฉุกเฉิน
      */}
      <div className="flex items-start gap-2.5 rounded-2xl bg-[#FFEBEE] px-5 py-4 text-base">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-[#e63462]" />
        <span className="text-[#795548]">
          <span className="font-semibold text-[#e63462]">{"หมายเหตุ: "}</span>
          {
            "ข้อมูลที่คุณส่งจะถูกใช้เพื่อปรับปรุงระบบเท่านั้น หากเป็นกรณีฉุกเฉิน โปรดติดต่อเจ้าหน้าที่โดยตรงที่ Tel: 034-xxx-xxx"
          }
        </span>
      </div>
    </div>
  )
}
