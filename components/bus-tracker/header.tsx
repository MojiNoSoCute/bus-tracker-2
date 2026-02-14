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
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-6 lg:py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <Bus className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold leading-tight lg:text-3xl">
                  {"ระบบติดตามรถเมล์ไฟฟ้า"}
                </h1>
                <span className="flex items-center gap-1.5 rounded-full bg-[#4CAF50] px-3 py-1 text-sm font-semibold text-white lg:text-base">
                  <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-white" />
                  LIVE
                </span>
              </div>
              <p className="text-base text-white/80 lg:text-lg">
                {"ม.ราชภัฏนครปฐม · 3 คัน"}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-sm uppercase tracking-wider text-white/60">
              เวลา
            </span>
            <span className="text-3xl font-bold tabular-nums lg:text-5xl">
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
                className={`flex flex-1 items-center justify-center gap-2.5 border-b-2 px-4 py-4 text-base font-medium transition-colors sm:flex-none sm:px-6 sm:text-lg ${
                  isActive
                    ? "border-[#e63462] text-[#e63462]"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-6 w-6" />
                <span className="hidden xs:inline sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </header>
  )
}
