/**
 * ===================================================================
 * layout.tsx - Root Layout สำหรับแอปพลิเคชัน Next.js
 * ===================================================================
 *
 * ไฟล์นี้เป็น Layout หลักที่ครอบคลุมทุกหน้าในแอป
 *
 * หน้าที่หลัก:
 * 1. กำหนด metadata (title, description) สำหรับ SEO
 * 2. กำหนด viewport settings (theme-color)
 * 3. โหลดฟอนต์ภาษาไทย (Noto Sans Thai) จาก Google Fonts
 * 4. ใส่ global styles จาก globals.css
 *
 * @author Bus Tracker Team
 */

import type { Metadata, Viewport } from "next"
import { Noto_Sans_Thai } from "next/font/google"

import "./globals.css"

// ===================================================================
// FONT CONFIGURATION
// ===================================================================

/**
 * Noto Sans Thai - ฟอนต์ภาษาไทยจาก Google Fonts
 *
 * - subsets: โหลดทั้งภาษาไทยและ Latin (ภาษาอังกฤษ)
 * - variable: สร้าง CSS variable --font-sans สำหรับใช้ใน Tailwind
 *
 * การใช้งาน: ใส่ class "font-sans" ใน element ที่ต้องการ
 */
const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  variable: "--font-sans",
})

// ===================================================================
// SEO METADATA
// ===================================================================

/**
 * Metadata - ข้อมูล SEO สำหรับแอป
 *
 * - title: ชื่อที่แสดงใน browser tab
 * - description: คำอธิบายสำหรับ search engines
 */
export const metadata: Metadata = {
  title: "Bus Tracker - Electric Bus Tracking System",
  description: "Real-time electric bus tracking system for university campus",
}

/**
 * Viewport - การตั้งค่า viewport สำหรับ mobile
 *
 * - themeColor: สีที่แสดงใน address bar บน mobile browsers
 *   ใช้สีชมพูหลักของแอป (#e63462)
 */
export const viewport: Viewport = {
  themeColor: "#e63462",
}

// ===================================================================
// ROOT LAYOUT COMPONENT
// ===================================================================

/**
 * RootLayout - Component หลักที่ครอบทุกหน้า
 *
 * @param children - หน้าที่กำลังแสดง (page.tsx)
 *
 * Structure:
 * <html>
 *   <body>
 *     {children} <- หน้าปัจจุบัน
 *   </body>
 * </html>
 *
 * Classes ที่ใช้:
 * - notoSansThai.variable: ใส่ CSS variable --font-sans
 * - font-sans: ใช้ฟอนต์ Noto Sans Thai
 * - antialiased: ทำให้ตัวอักษรเรียบขึ้น (font smoothing)
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="th">
      <body className={`${notoSansThai.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
