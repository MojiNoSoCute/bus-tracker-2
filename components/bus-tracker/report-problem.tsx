"use client"

import { useState } from "react"
import { problemTypes, stops, initialBuses } from "@/lib/bus-data"
import {
  AlertCircle,
  Clock,
  Users,
  Wrench,
  Volume2,
  ShieldAlert,
  Sparkles,
  User,
  MoreHorizontal,
  Bus,
  Send,
  Info,
  Phone,
  UserCircle,
} from "lucide-react"

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

export function ReportProblem() {
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [selectedStop, setSelectedStop] = useState("")
  const [selectedBus, setSelectedBus] = useState<number | null>(null)
  const [description, setDescription] = useState("")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    setSubmitted(true)
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

  if (submitted) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card py-16">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#4CAF50]/10">
          <svg className="h-8 w-8 text-[#4CAF50]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-foreground">{"ส่งรายงานเรียบร้อยแล้ว!"}</h2>
        <p className="text-sm text-muted-foreground">{"ขอบคุณที่แจ้งปัญหา ทีมงานจะดำเนินการแก้ไขโดยเร็ว"}</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Main Form Card */}
      <div className="rounded-2xl border border-border bg-card p-4 lg:p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e63462]/10">
            <AlertCircle className="h-5 w-5 text-[#e63462]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">
              {"รายงานปัญหา"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {"แจ้งปัญหาเพื่อให้ทีมงานดำเนินการแก้ไข"}
            </p>
          </div>
        </div>

        {/* Problem Type */}
        <div className="mb-6">
          <p className="mb-3 text-sm font-semibold text-foreground">
            {"ประเภทปัญหา"} <span className="text-[#e63462]">*</span>
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {problemTypes.map((pt) => {
              const Icon = iconMap[pt.icon] || MoreHorizontal
              const isSelected = selectedType === pt.id
              return (
                <button
                  key={pt.id}
                  onClick={() => setSelectedType(pt.id)}
                  className={`flex items-center gap-2 rounded-xl border-2 p-3 text-left text-xs font-medium transition-all ${
                    isSelected
                      ? "border-[#e63462] bg-[#e63462]/5 text-[#e63462]"
                      : "border-border bg-card text-foreground hover:border-[#e63462]/30 hover:bg-secondary/30"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{pt.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Related Stop */}
        <div className="mb-6">
          <p className="mb-3 text-sm font-semibold text-foreground">
            {"จุดจอดที่เกี่ยวข้อง (ถ้ามี)"}
          </p>
          <select
            value={selectedStop}
            onChange={(e) => setSelectedStop(e.target.value)}
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-[#e63462] focus:ring-1 focus:ring-[#e63462]"
          >
            <option value="">{"เลือกจุดจอด..."}</option>
            {stops.map((s) => (
              <option key={s.id} value={s.id.toString()}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Related Bus */}
        <div className="mb-6">
          <p className="mb-3 text-sm font-semibold text-foreground">
            {"รถเมล์ที่เกี่ยวข้อง (ถ้ามี)"}
          </p>
          <div className="flex flex-wrap gap-3">
            {initialBuses.map((bus) => {
              const busColors: Record<number, string> = { 1: "#E53935", 2: "#F9A825", 3: "#7B1FA2" }
              const color = busColors[bus.id] || "#E53935"
              return (
                <button
                  key={bus.id}
                  onClick={() =>
                    setSelectedBus(bus.id === selectedBus ? null : bus.id)
                  }
                  className={`flex items-center gap-2 rounded-xl border-2 px-4 py-3 transition-all ${
                    selectedBus === bus.id
                      ? "bg-opacity-5"
                      : "border-border bg-card hover:bg-secondary/30"
                  }`}
                  style={{
                    borderColor: selectedBus === bus.id ? color : undefined,
                    backgroundColor: selectedBus === bus.id ? `${color}0D` : undefined,
                  }}
                >
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full"
                    style={{ backgroundColor: color }}
                  >
                    <Bus className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-foreground">
                      {bus.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {`รถคัน ${bus.id}`}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <p className="mb-3 text-sm font-semibold text-foreground">
            {"รายละเอียดปัญหา"} <span className="text-[#e63462]">*</span>
          </p>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="โปรดอธิบายปัญหาที่พบอย่างละเอียด..."
            rows={4}
            className="w-full resize-none rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-[#e63462] focus:ring-1 focus:ring-[#e63462]"
          />
        </div>
      </div>

      {/* Contact Info Card */}
      <div className="rounded-2xl border border-border bg-card p-4 lg:p-6">
        <h3 className="mb-4 text-sm font-bold text-foreground">
          {"ข้อมูลติดต่อ (ไม่บังคับ)"}
        </h3>
        <div className="space-y-3">
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              <UserCircle className="h-3.5 w-3.5" />
              {"ชื่อ-นามสกุล"}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="กรอกชื่อของคุณ"
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-[#e63462] focus:ring-1 focus:ring-[#e63462]"
            />
          </div>
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Phone className="h-3.5 w-3.5" />
              {"เบอร์โทรศัพท์"}
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0XX-XXX-XXXX"
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-[#e63462] focus:ring-1 focus:ring-[#e63462]"
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!selectedType || !description}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#e63462] to-[#fe5196] px-6 py-4 text-sm font-bold text-white shadow-lg transition-all hover:opacity-90 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Send className="h-4 w-4" />
        {"ส่งรายงาน"}
      </button>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 rounded-2xl bg-[#FFEBEE] px-4 py-3 text-xs">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#e63462]" />
        <span className="text-[#795548]">
          <span className="font-semibold text-[#e63462]">
            {"หมายเหตุ: "}
          </span>
          {"ข้อมูลที่คุณส่งจะถูกใช้เพื่อปรับปรุงระบบเท่านั้น หากเป็นกรณีฉุกเฉิน โปรดติดต่อเจ้าหน้าที่โดยตรงที่ Tel: 034-xxx-xxx"}
        </span>
      </div>
    </div>
  )
}
