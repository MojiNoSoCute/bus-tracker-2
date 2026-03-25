/**
 * ===================================================================
 * footer.tsx - ส่วน Footer ของแอปพลิเคชัน
 * ===================================================================
 *
 * แสดงข้อมูลลิขสิทธิ์และข้อมูลเพิ่มเติมด้านล่างของหน้า
 *
 * โครงสร้าง:
 * 1. ชื่อมหาวิทยาลัยและปีลิขสิทธิ์
 * 2. ข้อความ disclaimer เกี่ยวกับข้อมูลในระบบ
 *
 * @author Bus Tracker Team
 */

import { Globe } from "lucide-react"

// ===================================================================
// FOOTER COMPONENT
// ===================================================================

/**
 * Footer Component
 *
 * เป็น Stateless Component (ไม่มี state หรือ props)
 * แสดงข้อมูลลิขสิทธิ์และคำเตือนเกี่ยวกับความแม่นยำของข้อมูล
 *
 * Styling:
 * - border-t: เส้นขอบด้านบนแยก footer จาก content
 * - bg-card: พื้นหลังสีเดียวกับ card อื่นๆ
 * - text-center: จัดข้อความกึ่งกลาง
 */
export function Footer() {
  return (
    <footer className="border-t border-border bg-card py-6">
      <div className="mx-auto max-w-7xl px-4 text-center lg:px-6">
        {/* 
          ส่วนที่ 1: ลิขสิทธิ์และชื่อระบบ
          - Icon Globe: แสดงถึงการเข้าถึงออนไลน์
          - ข้อความ: ปี + ชื่อมหาวิทยาลัย + ชื่อระบบ
        */}
        <div className="flex items-center justify-center gap-2.5 text-base text-muted-foreground">
          <Globe className="h-5 w-5" />
          <span>
            {"© 2026 มหาวิทยาลัยราชภัฏนครปฐม | ระบบติดตามรถเมล์ไฟฟ้า"}
          </span>
        </div>

        {/* 
          ส่วนที่ 2: Disclaimer / ข้อจำกัดความรับผิดชอบ
          - แจ้งให้ผู้ใช้ทราบว่าข้อมูลอาจไม่ตรงกับความเป็นจริง
          - ใช้ text-muted-foreground/70 เพื่อให้จางกว่าข้อความหลัก
        */}
        <p className="mt-1.5 text-sm text-muted-foreground/70">
          {
            "ข้อมูลในระบบเป็นข้อมูลเบื้องต้นสำหรับการเดินทาง · เส้นทางอาจมีการเปลี่ยนแปลงตามสภาพจราจร · 3 คันให้บริการ"
          }
        </p>
      </div>
    </footer>
  )
}
