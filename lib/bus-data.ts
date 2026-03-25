/**
 * ===================================================================
 * bus-data.ts - ข้อมูลหลักและ Logic สำหรับระบบติดตามรถเมล์ไฟฟ้า
 * ===================================================================
 * 
 * ไฟล์นี้ประกอบด้วย:
 * 1. Type definitions - กำหนดรูปแบบข้อมูล
 * 2. Constants - ค่าคงที่ต่างๆ (จุดจอด, สิ่งอำนวยความสะดวก, เวลา)
 * 3. Helper functions - ฟังก์ชันช่วยคำนวณ (ETA, format เวลา)
 * 4. Data generators - สร้างข้อมูลตารางเวลา
 * 
 * @author Bus Tracker Team
 * @version 1.0.0
 */

// ===================================================================
// SECTION 1: TYPE DEFINITIONS
// ===================================================================

/**
 * Facility - สิ่งอำนวยความสะดวกใกล้จุดจอด
 * 
 * @property label - ชื่อภาษาไทยที่แสดงใน UI
 * @property icon - ชื่อ icon สำหรับ mapping กับ Lucide icons
 * @property color - สี HEX สำหรับ badge
 */
export type Facility = {
  label: string
  icon: "toilet" | "market" | "atm" | "cafe" | "parking" | "wifi" | "food" | "pharmacy" | "store" | "gym" | "library" | "hospital"
  color: string
}

/**
 * BusState - สถานะปัจจุบันของรถเมล์แต่ละคัน
 * 
 * ใช้สำหรับ:
 * - แสดงตำแหน่งบนแผนที่
 * - แสดงสถานะใน BusCard
 * - คำนวณ ETA ไปยังจุดจอดต่างๆ
 * 
 * @property id - รหัสรถเมล์ (1, 2, 3)
 * @property name - ชื่อแสดงผล ("รถเมล์ที่ 1")
 * @property code - รหัสย่อ ("รถคัน 1")
 * @property currentStopIndex - index ของจุดจอดปัจจุบัน (0-9)
 * @property progress - ความคืบหน้าระหว่างจุดจอด (0.0 - 1.0)
 * @property speed - ความเร็วปัจจุบัน (กม./ชม.)
 * @property passengers - จำนวนผู้โดยสาร
 * @property battery - เปอร์เซ็นต์แบตเตอรี่
 * @property status - ข้อความสถานะภาษาไทย
 * @property isDwelling - true = จอดอยู่ที่จุดจอด, false = กำลังเดินทาง
 * @property dwellRemaining - เวลาที่เหลือในการจอด (วินาที)
 */
export interface BusState {
  id: number
  name: string
  code: string
  currentStopIndex: number
  progress: number
  speed: number
  passengers: number
  battery: number
  status: "กำลังเดินทาง" | "จอดรับผู้โดยสาร" | "กำลังจะออก"
  isDwelling: boolean
  dwellRemaining: number
}

// ===================================================================
// SECTION 2: CONSTANTS - ค่าคงที่
// ===================================================================

/**
 * FACILITY_MAP - แผนที่ข้อมูลสิ่งอำนวยความสะดวก
 * 
 * Key: ชื่อภาษาไทย (ใช้ใน stops.facilities)
 * Value: ข้อมูลสำหรับแสดงผล (icon, สี)
 * 
 * การใช้งาน:
 * const facility = FACILITY_MAP["ห้องน้ำ"]
 * // => { label: "ห้องน้ำ", icon: "toilet", color: "#2196F3" }
 */
export const FACILITY_MAP: Record<string, Facility> = {
  "ห้องน้ำ":        { label: "ห้องน้ำ",        icon: "toilet",   color: "#2196F3" },
  "ตลาดนัด":        { label: "ตลาดนัด",        icon: "market",   color: "#FF9800" },
  "ตู้ ATM":        { label: "ตู้ ATM",        icon: "atm",      color: "#4CAF50" },
  "ร้านกาแฟ":       { label: "ร้านกาแฟ",       icon: "cafe",     color: "#795548" },
  "ที่จอดรถ":       { label: "ที่จอดรถ",       icon: "parking",  color: "#607D8B" },
  "Wi-Fi":          { label: "Wi-Fi",          icon: "wifi",     color: "#9C27B0" },
  "ร้านอาหาร":      { label: "ร้านอาหาร",      icon: "food",     color: "#F44336" },
  "ร้านยา":         { label: "ร้านยา",         icon: "pharmacy", color: "#00BCD4" },
  "ร้านสะดวกซื้อ":  { label: "ร้านสะดวกซื้อ",  icon: "store",    color: "#E91E63" },
  "ฟิตเนส":         { label: "ฟิตเนส",         icon: "gym",      color: "#FF5722" },
  "ห้องสมุด":       { label: "ห้องสมุด",       icon: "library",  color: "#3F51B5" },
  "โรงพยาบาล":      { label: "โรงพยาบาล",      icon: "hospital", color: "#F44336" },
}

/**
 * stops - ข้อมูลจุดจอดทั้ง 10 จุด
 * 
 * เรียงตามลำดับเส้นทาง (วนรอบ: P1 -> P2 -> ... -> P10 -> P1)
 * 
 * @property id - รหัสจุดจอด (1-10)
 * @property name - ชื่อภาษาไทย
 * @property nameEn - ชื่อภาษาอังกฤษ
 * @property code - รหัสย่อ (P1-P10)
 * @property facilities - รายการสิ่งอำนวยความสะดวกใกล้เคียง
 * @property x, y - พิกัดบนแผนที่ (สำหรับ reference เท่านั้น)
 */
export const stops = [
  { 
    id: 1, 
    name: "ประตูหลัก", 
    nameEn: "Main Gate", 
    code: "P1", 
    facilities: ["ที่จอดรถ", "ห้องน้ำ", "ตู้ ATM"], 
    x: 150, 
    y: 190 
  },
  { 
    id: 2, 
    name: "คณะครุศาสตร์", 
    nameEn: "Faculty of Education", 
    code: "P2", 
    facilities: ["ห้องน้ำ", "ร้านกาแฟ"], 
    x: 350, 
    y: 80 
  },
  { 
    id: 3, 
    name: "หอสมุดกลาง", 
    nameEn: "Central Library", 
    code: "P3", 
    facilities: ["ห้องน้ำ", "Wi-Fi", "ร้านกาแฟ", "ห้องสมุด"], 
    x: 560, 
    y: 100 
  },
  { 
    id: 4, 
    name: "อาคารวิทยาศาสตร์", 
    nameEn: "Science Building", 
    code: "P4", 
    facilities: ["ห้องน้ำ", "ร้านกาแฟ", "ตู้ ATM"], 
    x: 700, 
    y: 190 
  },
  { 
    id: 5, 
    name: "อาคารกีฬา", 
    nameEn: "Sports Complex", 
    code: "P5", 
    facilities: ["ห้องน้ำ", "ฟิตเนส", "ร้านสะดวกซื้อ"], 
    x: 800, 
    y: 250 
  },
  { 
    id: 6, 
    name: "หอพักนักศึกษา", 
    nameEn: "Student Dormitory", 
    code: "P6", 
    facilities: ["ร้านสะดวกซื้อ", "ตลาดนัด", "ห้องน้ำ", "Wi-Fi"], 
    x: 750, 
    y: 370 
  },
  { 
    id: 7, 
    name: "คณะวิศวกรรมศาสตร์", 
    nameEn: "Engineering Faculty", 
    code: "P7", 
    facilities: ["ห้องน้ำ", "ที่จอดรถ", "ร้านกาแฟ"], 
    x: 550, 
    y: 420 
  },
  { 
    id: 8, 
    name: "อาคารบริหาร", 
    nameEn: "Administration Building", 
    code: "P8", 
    facilities: ["ห้องน้ำ", "ตู้ ATM", "ที่จอดรถ"], 
    x: 350, 
    y: 400 
  },
  { 
    id: 9, 
    name: "โรงอาหาร", 
    nameEn: "Canteen", 
    code: "P9", 
    facilities: ["ร้านอาหาร", "ห้องน้ำ", "ตลาดนัด", "Wi-Fi"], 
    x: 200, 
    y: 350 
  },
  { 
    id: 10, 
    name: "ศูนย์แพทย์", 
    nameEn: "Medical Center", 
    code: "P10", 
    facilities: ["โรงพยาบาล", "ร้านยา", "ห้องน้ำ"], 
    x: 120, 
    y: 230 
  },
]

// -------------------------------------------------------------------
// Simulation Constants - ค่าคงที่สำหรับ simulation
// -------------------------------------------------------------------

/**
 * TRAVEL_TIME_PER_SEGMENT - เวลาเดินทางระหว่างจุดจอด (วินาที)
 * 
 * ในความเป็นจริง: ~5 นาที
 * ใน simulation: เร่งความเร็ว 15 เท่า
 */
export const TRAVEL_TIME_PER_SEGMENT = 300 // 5 นาที = 300 วินาที

/**
 * DWELL_TIME - เวลาจอดที่แต่ละจุดจอด (วินาที)
 * 
 * รถจะจอดรับ-ส่งผู้โดยสารจุดละ 5 นาที
 */
export const DWELL_TIME = 300 // 5 นาที = 300 วินาที

/**
 * SIM_TICK - ระยะเวลาระหว่าง simulation tick (มิลลิวินาที)
 * 
 * ทุกๆ 2 วินาที จะอัพเดตสถานะรถเมล์
 */
export const SIM_TICK = 2000 // 2 วินาที

/**
 * SIM_SECONDS_PER_TICK - จำนวน "วินาที" ที่ผ่านไปในแต่ละ tick
 * 
 * เร่งความเร็ว: 1 tick = 15 วินาทีจำลอง
 * ทำให้ดูการทำงานได้เร็วขึ้นโดยไม่ต้องรอจริง 5 นาที
 */
export const SIM_SECONDS_PER_TICK = 15

// -------------------------------------------------------------------
// Initial State - สถานะเริ่มต้นของรถเมล์
// -------------------------------------------------------------------

/**
 * initialBuses - สถานะเริ่มต้นของรถเมล์ทั้ง 3 คัน
 * 
 * กระจายตำแหน่งเพื่อให้เห็นการทำงานทันที:
 * - รถ 1: จอดอยู่ที่ประตูหลัก (P1)
 * - รถ 2: กำลังวิ่งจาก P4 ไป P5
 * - รถ 3: จอดอยู่ที่อาคารบริหาร (P8)
 */
export const initialBuses: BusState[] = [
  { 
    id: 1, 
    name: "รถเมล์ที่ 1", 
    code: "รถคัน 1", 
    currentStopIndex: 0,  // ประตูหลัก
    progress: 0, 
    speed: 0, 
    passengers: 12, 
    battery: 85, 
    status: "จอดรับผู้โดยสาร", 
    isDwelling: true, 
    dwellRemaining: 180  // เหลืออีก 3 นาที
  },
  { 
    id: 2, 
    name: "รถเมล์ที่ 2", 
    code: "รถคัน 2", 
    currentStopIndex: 3,  // กำลังวิ่งจากอาคารวิทยาศาสตร์
    progress: 0.4,        // ไปได้ 40% ของทาง
    speed: 22, 
    passengers: 8, 
    battery: 68, 
    status: "กำลังเดินทาง", 
    isDwelling: false, 
    dwellRemaining: 0 
  },
  { 
    id: 3, 
    name: "รถเมล์ที่ 3", 
    code: "รถคัน 3", 
    currentStopIndex: 7,  // อาคารบริหาร
    progress: 0, 
    speed: 0, 
    passengers: 15, 
    battery: 48, 
    status: "จอดรับผู้โดยสาร", 
    isDwelling: true, 
    dwellRemaining: 60   // เหลืออีก 1 นาที
  },
]

// ===================================================================
// SECTION 3: HELPER FUNCTIONS - ฟังก์ชันช่วยคำนวณ
// ===================================================================

/**
 * calcEtaSeconds - คำนวณเวลาที่รถเมล์จะถึงจุดจอดที่กำหนด
 * 
 * Algorithm:
 * 1. ถ้ารถจอดอยู่ที่จุดนั้นแล้ว => return 0
 * 2. ถ้ารถกำลังจอด => เวลาที่เหลือ + เวลาเดินทาง + เวลาจอดระหว่างทาง
 * 3. ถ้ารถกำลังวิ่ง => เวลาเดินทางที่เหลือ + เวลาจอด + เวลาเดินทางเพิ่ม
 * 
 * @param bus - สถานะรถเมล์ปัจจุบัน
 * @param targetStopIndex - index ของจุดจอดเป้าหมาย (0-9)
 * @returns เวลาเป็นวินาที หรือ null ถ้าคำนวณไม่ได้
 * 
 * @example
 * // รถ 1 อยู่ที่ P1, ต้องการรู้ว่าจะถึง P3 เมื่อไหร่
 * const eta = calcEtaSeconds(bus1, 2) // index 2 = P3
 * // => 660 วินาที (11 นาที)
 */
export function calcEtaSeconds(bus: BusState, targetStopIndex: number): number | null {
  // กรณีพิเศษ: รถจอดอยู่ที่จุดเป้าหมายแล้ว
  if (bus.currentStopIndex === targetStopIndex && bus.isDwelling) {
    return 0
  }
  
  const totalStops = stops.length // 10 จุดจอด
  let stopsAway: number
  
  if (bus.isDwelling) {
    // กรณี 1: รถกำลังจอดอยู่ที่จุดจอด
    // ต้องรอออกก่อน แล้วค่อยเดินทาง
    
    stopsAway = (targetStopIndex - bus.currentStopIndex + totalStops) % totalStops
    if (stopsAway === 0) return 0 // อยู่ที่จุดเป้าหมายแล้ว
    
    // คำนวณเวลา:
    // 1. เวลาที่เหลือก่อนออก (dwellRemaining)
    // 2. เวลาเดินทางทั้งหมด (จำนวนจุด × เวลาต่อจุด)
    // 3. เวลาจอดที่จุดระหว่างทาง (จำนวนจุด - 1)
    const travelTime = stopsAway * TRAVEL_TIME_PER_SEGMENT
    const intermediateDwells = (stopsAway - 1) * DWELL_TIME
    
    return bus.dwellRemaining + travelTime + intermediateDwells
    
  } else {
    // กรณี 2: รถกำลังเดินทางระหว่างจุดจอด
    
    const nextStopIndex = (bus.currentStopIndex + 1) % totalStops
    
    // ถ้าจุดถัดไปคือเป้าหมาย
    if (nextStopIndex === targetStopIndex) {
      // เหลือแค่ระยะทางที่ยังไม่ได้วิ่ง
      return Math.round((1 - bus.progress) * TRAVEL_TIME_PER_SEGMENT)
    }
    
    // ถ้าต้องผ่านหลายจุด
    stopsAway = (targetStopIndex - nextStopIndex + totalStops) % totalStops
    
    // คำนวณเวลา:
    // 1. เวลาที่เหลือถึงจุดถัดไป
    // 2. เวลาจอดที่จุดถัดไป
    // 3. เวลาเดินทางเพิ่มเติม
    // 4. เวลาจอดที่จุดระหว่างทาง
    const remainingToNext = Math.round((1 - bus.progress) * TRAVEL_TIME_PER_SEGMENT)
    const dwellAtNext = DWELL_TIME
    const additionalTravel = stopsAway * TRAVEL_TIME_PER_SEGMENT
    const intermediateDwells = Math.max(0, stopsAway - 1) * DWELL_TIME
    
    return remainingToNext + dwellAtNext + additionalTravel + intermediateDwells
  }
}

/**
 * formatTime - แปลงวินาทีเป็น MM:SS
 * 
 * @param seconds - จำนวนวินาที
 * @returns string ในรูปแบบ "MM:SS"
 * 
 * @example
 * formatTime(65)  // => "01:05"
 * formatTime(300) // => "05:00"
 */
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
}

/**
 * formatMinutes - แปลงวินาทีเป็นจำนวนนาที (ปัดขึ้น, ขั้นต่ำ 1)
 * 
 * ใช้สำหรับแสดง ETA แบบย่อ เช่น "5 นาที"
 * 
 * @param seconds - จำนวนวินาที
 * @returns จำนวนนาที (ขั้นต่ำ 1)
 * 
 * @example
 * formatMinutes(30)  // => 1 (ไม่ใช่ 0.5)
 * formatMinutes(301) // => 6 (ปัดขึ้น)
 */
export function formatMinutes(seconds: number): number {
  return Math.max(1, Math.ceil(seconds / 60))
}

// ===================================================================
// SECTION 4: SCHEDULE DATA - ข้อมูลตารางเวลา
// ===================================================================

/**
 * scheduleStops - รายชื่อจุดจอดสำหรับตารางเวลา
 * 
 * เรียงตามลำดับเส้นทาง ใช้แสดงเป็น column headers
 */
export const scheduleStops = [
  "ประตูหลัก",
  "คณะครุศาสตร์",
  "หอสมุดกลาง",
  "อาคารวิทยาศาสตร์",
  "อาคารกีฬา",
  "หอพักนักศึกษา",
  "คณะวิศวกรรมศาสตร์",
  "อาคารบริหาร",
  "โรงอาหาร",
  "ศูนย์แพทย์",
]

/**
 * scheduleStopCodes - รหัสจุดจอดย่อ (สำหรับแสดงใต้ชื่อในตาราง)
 */
export const scheduleStopCodes = ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8", "P9", "P10"]

/**
 * generateSchedule - สร้างตารางเวลาเดินรถ
 * 
 * สร้างตารางตั้งแต่ 08:00 - 16:00
 * แต่ละแถวคือรอบออกจากประตูหลัก (ทุก 30 นาที)
 * แต่ละ column คือเวลาถึงจุดจอดนั้น (ห่างกัน 5 นาที)
 * 
 * @returns Array ของ row objects
 * 
 * @example
 * const schedule = generateSchedule()
 * // [
 * //   { label: "08:00", times: ["08:00", "08:05", "08:10", ...] },
 * //   { label: "08:30", times: ["08:30", "08:35", "08:40", ...] },
 * //   ...
 * // ]
 */
export function generateSchedule(): { label: string; times: string[] }[] {
  const rows: { label: string; times: string[] }[] = []
  const startHour = 8   // เริ่ม 08:00
  const endHour = 16    // สิ้นสุด 16:00

  // วนสร้างแต่ละรอบ (ทุก 30 นาที)
  for (let hour = startHour; hour <= endHour; hour++) {
    for (const minute of [0, 30]) {
      // หยุดที่ 16:00 (ไม่มี 16:30)
      if (hour === endHour && minute > 0) break
      
      // สร้าง label เวลาออก
      const label = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
      
      // สร้างเวลาถึงแต่ละจุดจอด (ห่างกันจุดละ 5 นาที)
      const times: string[] = []
      for (let stopIndex = 0; stopIndex < 10; stopIndex++) {
        const offsetMinutes = stopIndex * 5  // จุดที่ 0 = 0 นาที, จุดที่ 1 = 5 นาที, ...
        const totalMinutes = minute + offsetMinutes
        const arrivalMinute = totalMinutes % 60
        const arrivalHour = hour + Math.floor(totalMinutes / 60)
        
        // ถ้าเลย 16:45 ให้เว้นว่าง (รถหยุดวิ่ง)
        if (arrivalHour > 16 || (arrivalHour === 16 && arrivalMinute > 45)) {
          times.push("")
        } else {
          times.push(`${String(arrivalHour).padStart(2, "0")}:${String(arrivalMinute).padStart(2, "0")}`)
        }
      }
      
      rows.push({ label, times })
    }
  }
  
  return rows
}

// ===================================================================
// SECTION 5: PROBLEM REPORT DATA - ข้อมูลแบบฟอร์มรายงานปัญหา
// ===================================================================

/**
 * problemTypes - ประเภทปัญหาที่สามารถรายงานได้
 * 
 * @property id - รหัสสำหรับ form submission
 * @property label - ข้อความภาษาไทยแสดงใน UI
 * @property icon - ชื่อ icon สำหรับ mapping
 */
export const problemTypes = [
  { id: "late",     label: "รถเมล์มาช้า",           icon: "clock" },
  { id: "crowded",  label: "รถเมล์คนเยอะมาก",       icon: "users" },
  { id: "broken",   label: "รถเมล์เสีย",           icon: "wrench" },
  { id: "noise",    label: "สิ่งอำนวยความสะดวกเสีย", icon: "volume" },
  { id: "safety",   label: "ปัญหาความปลอดภัย",      icon: "alert" },
  { id: "clean",    label: "ความสะอาด",            icon: "sparkles" },
  { id: "behavior", label: "พฤติกรรมคนขับ",         icon: "user" },
  { id: "other",    label: "อื่นๆ",                icon: "more" },
]
