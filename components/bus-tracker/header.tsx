"use client"

import { Bus, MapPin, CalendarClock, AlertCircle } from "lucide-react"
import { useEffect, useState } from "react"

const tabs = [
  { id: "tracking", label: "ติดตามสด", icon: MapPin },
  { id: "schedule", label: "ตารางเวลา", icon: CalendarClock },
  { id: "stops", label: "ข้อมูลจุดจอด", icon: Bus },
  { id: "report", label: "รายงานปัญหา", icon: AlertCircle },
]

export function Header({
  activeTab,
  onTabChange,
}: {
  activeTab: string
  onTabChange: (tab: string) => void
}) {
  const [time, setTime] = useState("")

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTime(
        `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
      )
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-gradient-to-r from-[#e63462] to-[#fe5196] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-6 lg:py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <Bus className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold leading-tight lg:text-xl">
                  {"ระบบติดตามรถเมล์ไฟฟ้า"}
                </h1>
                <span className="flex items-center gap-1 rounded-full bg-[#4CAF50] px-2 py-0.5 text-[10px] font-semibold text-white lg:text-xs">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                  LIVE
                </span>
              </div>
              <p className="text-[11px] text-white/80 lg:text-sm">
                {"ม.ราชภัฏนครปฐม · 3 คัน"}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[9px] uppercase tracking-wider text-white/60">
              เวลา
            </span>
            <span className="text-xl font-bold tabular-nums lg:text-3xl">
              {time || "--:--"}
            </span>
          </div>
        </div>
      </div>
      {/* Tab navigation */}
      <nav className="border-b border-border bg-card shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center px-2 lg:px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-1 items-center justify-center gap-1.5 border-b-2 px-2 py-3 text-xs font-medium transition-colors sm:flex-none sm:px-4 sm:text-sm ${
                  isActive
                    ? "border-[#e63462] text-[#e63462]"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden xs:inline sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </header>
  )
}
