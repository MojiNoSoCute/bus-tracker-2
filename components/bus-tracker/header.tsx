/**
 * ===================================================================
 * header.tsx - Header และ Navigation ของระบบติดตามรถเมล์
 * ===================================================================
 * 
 * ประกอบด้วย 2 ส่วน:
 * 1. Top Bar - แสดงโลโก้, ชื่อระบบ, สถานะ LIVE, และนาฬิกา
 * 2. Tab Navigation - เมนูสลับหน้าต่างๆ
 * 
 * Features:
 * - Sticky header (ติดอยู่บนสุดเมื่อ scroll)
 * - นาฬิกา realtime (อัพเดตทุกวินาที)
 * - Responsive design (ซ่อน label บน mobile)
 * 
 * @author Bus Tracker Team
 */

"use client"

import { useEffect, useState } from "react"
import { Bus, MapPin, CalendarClock, AlertCircle } from "lucide-react"

// ===================================================================
// CONSTANTS
// ===================================================================

/**
 * tabs - รายการ tab ทั้งหมดในระบบ
 * 
 * @property id - ค่าสำหรับเช็ค active state
 * @property label - ข้อความแสดงบน tab
 * @property icon - Lucide icon component
 */
const tabs = [
  { id: "tracking", label: "ติดตามสด",     icon: MapPin },
  { id: "schedule", label: "ตารางเวลา",    icon: CalendarClock },
  { id: "stops",    label: "ข้อมูลจุดจอด",  icon: Bus },
  { id: "report",   label: "รายงานปัญหา",  icon: AlertCircle },
]

// ===================================================================
// COMPONENT
// ===================================================================

/**
 * Header Props
 * @property activeTab - id ของ tab ที่กำลัง active
 * @property onTabChange - callback เมื่อ user คลิกเปลี่ยน tab
 */
interface HeaderProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

/**
 * Header Component
 * 
 * ใช้ useEffect เพื่ออัพเดตนาฬิกาทุกวินาที
 * และ cleanup interval เมื่อ component unmount
 */
export function Header({ activeTab, onTabChange }: HeaderProps) {
  // State: เวลาปัจจุบันในรูปแบบ "HH:MM"
  const [time, setTime] = useState("")

  // Effect: อัพเดตนาฬิกาทุกวินาที
  useEffect(() => {
    /**
     * updateTime - อัพเดต state เวลาจาก Date ปัจจุบัน
     * 
     * ใช้ padStart(2, "0") เพื่อให้แสดง "09:05" แทน "9:5"
     */
    const updateTime = () => {
      const now = new Date()
      const hours = String(now.getHours()).padStart(2, "0")
      const minutes = String(now.getMinutes()).padStart(2, "0")
      setTime(`${hours}:${minutes}`)
    }

    // เรียกครั้งแรกทันที (ไม่ต้องรอ 1 วินาที)
    updateTime()

    // ตั้ง interval อัพเดตทุก 1000ms
    const interval = setInterval(updateTime, 1000)

    // Cleanup: ยกเลิก interval เมื่อ component unmount
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="sticky top-0 z-50">
      {/* 
        ===================================================================
        TOP BAR - แถบด้านบนสีชมพู gradient
        ===================================================================
        - Background: gradient จากชมพูเข้มไปอ่อน
        - แสดง: โลโก้, ชื่อระบบ, badge LIVE, นาฬิกา
      */}
      <div className="bg-gradient-to-r from-[#e63462] to-[#fe5196] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-6 lg:py-5">
          
          {/* Left Section: โลโก้และชื่อระบบ */}
          <div className="flex items-center gap-4">
            {/* Icon Container - พื้นหลังโปร่งใสมี blur effect */}
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <Bus className="h-7 w-7" />
            </div>

            {/* Text Container */}
            <div>
              {/* Title Row: ชื่อระบบ + LIVE badge */}
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold leading-tight lg:text-3xl">
                  ระบบติดตามรถเมล์ไฟฟ้า
                </h1>

                {/* LIVE Badge - แสดงจุดกระพริบ */}
                <span className="flex items-center gap-1.5 rounded-full bg-[#4CAF50] px-3 py-1 text-sm font-semibold text-white lg:text-base">
                  {/* Animated dot - ใช้ animate-pulse ของ Tailwind */}
                  <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-white" />
                  LIVE
                </span>
              </div>

              {/* Subtitle: ชื่อมหาวิทยาลัยและจำนวนรถ */}
              <p className="text-sm sm:text-base text-white/90 font-medium">
                ม.ราชภัฏนครปฐม · วิ่งเฉพาะภายในวิทยาเขต (3 คัน)
              </p>
            </div>
          </div>

          {/* Right Section: นาฬิกา */}
          <div className="flex flex-col items-end">
            <span className="text-sm uppercase tracking-wider text-white/60">
              เวลา
            </span>
            {/* 
              tabular-nums: ทำให้ตัวเลขมีความกว้างเท่ากัน
              ป้องกันการกระตุกเมื่อเปลี่ยนจาก "10:59" เป็น "11:00"
            */}
            <span className="text-3xl font-bold tabular-nums lg:text-5xl">
              {time || "--:--"}
            </span>
          </div>
        </div>
      </div>

      {/* 
        ===================================================================
        TAB NAVIGATION - แถบเมนูด้านล่าง
        ===================================================================
        - Background: สีพื้นหลัง card
        - แสดง icon และ label (ซ่อน label บน mobile)
        - Highlight tab ที่ active ด้วยเส้นใต้สีชมพู
      */}
      <nav className="border-b border-border bg-card shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center px-2 lg:px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  flex flex-1 items-center justify-center gap-2.5 
                  border-b-2 px-4 py-4 
                  text-base font-medium transition-colors 
                  sm:flex-none sm:px-6 sm:text-lg
                  ${isActive
                    ? "border-[#e63462] text-[#e63462]"              // Active: เส้นใต้ชมพู, ตัวอักษรชมพู
                    : "border-transparent text-muted-foreground hover:text-foreground"  // Inactive: ไม่มีเส้น, สีจาง
                  }
                `}
              >
                <Icon className="h-6 w-6" />
                {/* 
                  ซ่อน label บน mobile (xs) 
                  แสดงเฉพาะบน sm ขึ้นไป
                */}
                <span className="hidden xs:inline sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </header>
  )
}
