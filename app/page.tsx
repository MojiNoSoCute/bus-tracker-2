/**
 * ===================================================================
 * page.tsx - หน้าหลักของระบบติดตามรถเมล์ไฟฟ้า
 * ===================================================================
 * 
 * โครงสร้างหน้า:
 * - Header: แสดงชื่อระบบ, เวลาปัจจุบัน, และ tab navigation
 * - Main Content: แสดง component ตาม tab ที่เลือก
 * - Footer: ข้อมูลลิขสิทธิ์
 * 
 * State Management:
 * - activeTab: ควบคุมว่าแสดง tab ไหน (tracking, schedule, stops, report)
 * 
 * @author Bus Tracker Team
 */

"use client"

import { useState } from "react"

// Components
import { Header } from "@/components/bus-tracker/header"
import { Footer } from "@/components/bus-tracker/footer"
import { LiveTracking } from "@/components/bus-tracker/live-tracking"
import { Schedule } from "@/components/bus-tracker/schedule"
import { StopInfo } from "@/components/bus-tracker/stop-info"
import { ReportProblem } from "@/components/bus-tracker/report-problem"

/**
 * Page Component - หน้าหลักของแอพพลิเคชัน
 * 
 * ใช้ useState เพื่อจัดการ tab ที่ active
 * และส่ง callback ไปยัง Header เพื่อเปลี่ยน tab
 */
export default function Page() {
  // State: tab ที่กำลังแสดง
  // ค่าเริ่มต้น: "tracking" (หน้าติดตามสด)
  const [activeTab, setActiveTab] = useState("tracking")

  return (
    <div className="flex min-h-screen flex-col">
      {/* 
        Header Section
        - แสดงชื่อระบบและเวลาปัจจุบัน
        - Tab Navigation สำหรับสลับหน้า
        - รับ activeTab เพื่อ highlight tab ปัจจุบัน
        - รับ onTabChange เพื่อเปลี่ยน tab เมื่อ click
      */}
      <Header 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />

      {/* 
        Main Content Section
        - แสดง component ต่างๆ ตาม tab ที่เลือก
        - max-w-7xl: จำกัดความกว้างไม่เกิน 80rem
        - flex-1: ขยายเต็มพื้นที่ที่เหลือ (push footer ลงล่าง)
      */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 lg:px-6">
        {/* Tab: ติดตามสด - แสดงแผนที่และสถานะรถเมล์ realtime */}
        {activeTab === "tracking" && <LiveTracking />}
        
        {/* Tab: ตารางเวลา - แสดงตารางเวลาเดินรถ */}
        {activeTab === "schedule" && <Schedule />}
        
        {/* Tab: ข้อมูลจุดจอด - แสดงรายละเอียดจุดจอดทั้งหมด */}
        {activeTab === "stops" && <StopInfo />}
        
        {/* Tab: รายงานปัญหา - แบบฟอร์มแจ้งปัญหา */}
        {activeTab === "report" && <ReportProblem />}
      </main>

      {/* Footer Section - ข้อมูลลิขสิทธิ์และ credits */}
      <Footer />
    </div>
  )
}
