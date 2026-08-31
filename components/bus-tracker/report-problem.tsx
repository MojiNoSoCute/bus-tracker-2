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
  Accessibility,
  CheckCircle2,
  History,
  FileText
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
  wheelchair: Accessibility,
}

export function ReportProblem() {
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [selectedStop, setSelectedStop] = useState("")
  const [selectedBus, setSelectedBus] = useState<number | null>(null)
  const [description, setDescription] = useState("")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [ticketId, setTicketId] = useState("")

  const handleSubmit = () => {
    if (!selectedType || !description) return
    const randomTicket = `NPRU-EV-${Math.floor(100000 + Math.random() * 900000)}`
    setTicketId(randomTicket)
    setSubmitted(true)

    // Reset after 4 seconds
    setTimeout(() => {
      setSubmitted(false)
      setSelectedType(null)
      setSelectedStop("")
      setSelectedBus(null)
      setDescription("")
      setName("")
      setPhone("")
    }, 4000)
  }

  if (submitted) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-4 rounded-3xl border border-emerald-200 bg-emerald-50/50 p-8 py-16 text-center shadow-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
          <CheckCircle2 className="h-8 w-8" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            ส่งรายงานปัญหาเรียบร้อยแล้ว!
          </h2>
          <p className="text-sm font-semibold text-emerald-700 mt-1">
            หมายเลขคำร้อง (Ticket ID): <span className="font-mono">{ticketId}</span>
          </p>
        </div>

        <p className="text-sm text-slate-600 max-w-md">
          ระบบได้บันทึกข้อมูลและส่งไปยังกองอาคารสถานที่และยานพาหนะ มรภ.นครปฐม เรียบร้อยแล้ว ขอบคุณที่ช่วยพัฒนาระบบขนส่งสีเขียวของพวกเรา
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Main Form Card */}
      <div className="rounded-2xl border border-border bg-card p-5 lg:p-8 shadow-sm">
        {/* Form Header */}
        <div className="mb-6 flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e63462]/10 text-[#e63462]">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              แจ้งปัญหาและข้อเสนอแนะ รถเมล์ไฟฟ้า มรภ.นครปฐม
            </h2>
            <p className="text-sm text-muted-foreground">
              ส่งตรงถึงงานยานพาหนะ กองอาคารสถานที่และบริการ มหาวิทยาลัยราชภัฏนครปฐม
            </p>
          </div>
        </div>

        {/* 1. Problem Type */}
        <div className="mb-6">
          <p className="mb-3 text-sm font-bold text-foreground">
            1. ประเภทปัญหาที่พบ <span className="text-[#e63462]">*</span>
          </p>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {problemTypes.map((pt) => {
              const Icon = iconMap[pt.icon] || MoreHorizontal
              const isSelected = selectedType === pt.id

              return (
                <button
                  key={pt.id}
                  onClick={() => setSelectedType(pt.id)}
                  className={`flex flex-col items-start gap-2 rounded-xl border p-3.5 text-left transition-all ${
                    isSelected
                      ? "border-[#e63462] bg-[#e63462]/10 text-[#e63462] font-bold shadow-sm"
                      : "border-border bg-card text-foreground hover:border-[#e63462]/40"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="text-xs leading-snug">{pt.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* 2. Related Stop */}
        <div className="mb-6">
          <p className="mb-2 text-sm font-bold text-foreground">
            2. จุดจอดหรือสถานที่ที่เกี่ยวข้อง (ถ้ามี)
          </p>
          <select
            value={selectedStop}
            onChange={(e) => setSelectedStop(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-[#e63462] focus:ring-2 focus:ring-[#e63462]/20"
          >
            <option value="">-- เลือกจุดจอด มรภ.นครปฐม (10 จุด) --</option>
            {stops.map((s) => (
              <option key={s.id} value={s.id.toString()}>
                {s.code} - {s.name} ({s.building})
              </option>
            ))}
          </select>
        </div>

        {/* 3. Related Bus */}
        <div className="mb-6">
          <p className="mb-2 text-sm font-bold text-foreground">
            3. รถเมล์ไฟฟ้าคันที่พบปัญหา (ถ้ามี)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {initialBuses.map((bus) => {
              const isSelected = selectedBus === bus.id
              const color = bus.id === 1 ? "#E53935" : bus.id === 2 ? "#F59E0B" : bus.id === 3 ? "#8B5CF6" : "#3B82F6"

              return (
                <button
                  key={bus.id}
                  onClick={() => setSelectedBus(isSelected ? null : bus.id)}
                  className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                    isSelected
                      ? "border-[#e63462] bg-[#e63462]/5 ring-2 ring-[#e63462]/20"
                      : "border-border bg-card hover:bg-muted/40"
                  }`}
                >
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-white font-bold text-xs shrink-0 shadow-sm"
                    style={{ backgroundColor: color }}
                  >
                    <Bus className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">
                      คันที่ {bus.id}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {bus.plateNumber}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* 4. Description */}
        <div className="mb-6">
          <p className="mb-2 text-sm font-bold text-foreground">
            4. รายละเอียดปัญหา <span className="text-[#e63462]">*</span>
          </p>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="อธิบายเหตุการณ์หรือปัญหาที่พบ เช่น ช่วงเวลาที่เกิดเหตุ, สิ่งของที่ลืมไว้, หรือข้อเสนอแนะ..."
            rows={4}
            className="w-full resize-none rounded-xl border border-border bg-background p-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-[#e63462] focus:ring-2 focus:ring-[#e63462]/20"
          />
        </div>

        {/* 5. Contact info */}
        <div className="pt-4 border-t border-border space-y-3">
          <p className="text-sm font-bold text-foreground">
            5. ข้อมูลสำหรับติดต่อกลับ (ไม่บังคับ)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <UserCircle className="h-3.5 w-3.5" />
                ชื่อ-นามสกุล / รหัสนักศึกษา
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="เช่น สมชาย ใจดี หรือ 6542xxxxx"
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground outline-none focus:border-[#e63462]"
              />
            </div>

            <div>
              <label className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Phone className="h-3.5 w-3.5" />
                เบอร์โทรศัพท์ / LINE ID
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08X-XXX-XXXX"
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground outline-none focus:border-[#e63462]"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!selectedType || !description.trim()}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#e63462] to-[#fe5196] py-3.5 text-base font-bold text-white shadow-md transition-all hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          <span>ส่งรายงานปัญหา</span>
        </button>
      </div>

      {/* Emergency Contact Hotline Banner */}
      <div className="flex items-start gap-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4 text-xs text-amber-950 dark:text-amber-200">
        <Phone className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <div>
          <span className="font-bold text-amber-900 dark:text-amber-100">
            สายด่วนกรณีฉุกเฉิน / ลืมของมีค่าเร่งด่วน:
          </span>{" "}
          โทรติดต่อศูนย์วิทยุ รปภ. มรภ.นครปฐม ได้ตลอด 24 ชั่วโมง ที่เบอร์{" "}
          <strong className="underline text-red-600 dark:text-red-400">034-109-300 ต่อ 3000</strong> หรือ งานยานพาหนะ{" "}
          <strong>081-456-7890</strong>
        </div>
      </div>
    </div>
  )
}
