export type Facility = {
  label: string
  icon: "toilet" | "market" | "atm" | "cafe" | "parking" | "wifi" | "food" | "pharmacy" | "store" | "gym" | "library" | "hospital"
  color: string
}

export const FACILITY_MAP: Record<string, Facility> = {
  "ห้องน้ำ":      { label: "ห้องน้ำ",      icon: "toilet",   color: "#2196F3" },
  "ตลาดนัด":      { label: "ตลาดนัด",      icon: "market",   color: "#FF9800" },
  "ตู้ ATM":       { label: "ตู้ ATM",       icon: "atm",      color: "#4CAF50" },
  "ร้านกาแฟ":     { label: "ร้านกาแฟ",     icon: "cafe",     color: "#795548" },
  "ที่จอดรถ":     { label: "ที่จอดรถ",     icon: "parking",  color: "#607D8B" },
  "Wi-Fi":         { label: "Wi-Fi",         icon: "wifi",     color: "#9C27B0" },
  "ร้านอาหาร":    { label: "ร้านอาหาร",    icon: "food",     color: "#F44336" },
  "ร้านยา":       { label: "ร้านยา",       icon: "pharmacy", color: "#00BCD4" },
  "ร้านสะดวกซื้อ": { label: "ร้านสะดวกซื้อ", icon: "store", color: "#E91E63" },
  "ฟิตเนส":       { label: "ฟิตเนส",       icon: "gym",      color: "#FF5722" },
  "ห้องสมุด":     { label: "ห้องสมุด",     icon: "library",  color: "#3F51B5" },
  "โรงพยาบาล":    { label: "โรงพยาบาล",    icon: "hospital", color: "#F44336" },
}

export const stops = [
  { id: 1, name: "ประตูหลัก", nameEn: "Main Gate", code: "P1", facilities: ["ที่จอดรถ", "ห้องน้ำ", "ตู้ ATM"], x: 150, y: 190 },
  { id: 2, name: "คณะครุศาสตร์", nameEn: "Faculty of Education", code: "P2", facilities: ["ห้องน้ำ", "ร้านกาแฟ"], x: 350, y: 80 },
  { id: 3, name: "หอสมุดกลาง", nameEn: "Central Library", code: "P3", facilities: ["ห้องน้ำ", "Wi-Fi", "ร้านกาแฟ", "ห้องสมุด"], x: 560, y: 100 },
  { id: 4, name: "อาคารวิทยาศาสตร์", nameEn: "Science Building", code: "P4", facilities: ["ห้องน้ำ", "ร้านกาแฟ", "ตู้ ATM"], x: 700, y: 190 },
  { id: 5, name: "อาคารกีฬา", nameEn: "Sports Complex", code: "P5", facilities: ["ห้องน้ำ", "ฟิตเนส", "ร้านสะดวกซื้อ"], x: 800, y: 250 },
  { id: 6, name: "หอพักนักศึกษา", nameEn: "Student Dormitory", code: "P6", facilities: ["ร้านสะดวกซื้อ", "ตลาดนัด", "ห้องน้ำ", "Wi-Fi"], x: 750, y: 370 },
  { id: 7, name: "คณะวิศวกรรมศาสตร์", nameEn: "Engineering Faculty", code: "P7", facilities: ["ห้องน้ำ", "ที่จอดรถ", "ร้านกาแฟ"], x: 550, y: 420 },
  { id: 8, name: "อาคารบริหาร", nameEn: "Administration Building", code: "P8", facilities: ["ห้องน้ำ", "ตู้ ATM", "ที่จอดรถ"], x: 350, y: 400 },
  { id: 9, name: "โรงอาหาร", nameEn: "Canteen", code: "P9", facilities: ["ร้านอาหาร", "ห้องน้ำ", "ตลาดนัด", "Wi-Fi"], x: 200, y: 350 },
  { id: 10, name: "ศูนย์แพทย์", nameEn: "Medical Center", code: "P10", facilities: ["โรงพยาบาล", "ร้านยา", "ห้องน้ำ"], x: 120, y: 230 },
]

export interface BusState {
  id: number
  name: string
  code: string
  currentStopIndex: number
  progress: number // 0 to 1, how far between current and next stop
  speed: number
  passengers: number
  battery: number
  status: "กำลังเดินทาง" | "จอดรับผู้โดยสาร" | "กำลังจะออก"
  isDwelling: boolean // true when stopped at a stop
  dwellRemaining: number // seconds remaining at stop (total 300s = 5 min)
}

// Travel time between stops in seconds (simulated ~5 min per segment)
export const TRAVEL_TIME_PER_SEGMENT = 300 // 5 minutes real, simulated faster
export const DWELL_TIME = 300 // 5 minutes dwell at each stop
export const SIM_TICK = 2000 // ms per simulation tick
export const SIM_SECONDS_PER_TICK = 15 // how many "seconds" pass per tick (speed up)

export const initialBuses: BusState[] = [
  { id: 1, name: "รถเมล์ที่ 1", code: "รถคัน 1", currentStopIndex: 0, progress: 0, speed: 0, passengers: 12, battery: 85, status: "จอดรับผู้โดยสาร", isDwelling: true, dwellRemaining: 180 },
  { id: 2, name: "รถเมล์ที่ 2", code: "รถคัน 2", currentStopIndex: 3, progress: 0.4, speed: 22, passengers: 8, battery: 68, status: "กำลังเดินทาง", isDwelling: false, dwellRemaining: 0 },
  { id: 3, name: "รถเมล์ที่ 3", code: "รถคัน 3", currentStopIndex: 7, progress: 0, speed: 0, passengers: 15, battery: 48, status: "จอดรับผู้โดยสาร", isDwelling: true, dwellRemaining: 60 },
]

/** Calculate ETA in seconds for a bus to reach a given stop index */
export function calcEtaSeconds(bus: BusState, targetStopIndex: number): number | null {
  if (bus.currentStopIndex === targetStopIndex && bus.isDwelling) return 0
  
  const total = stops.length
  let stopsAway: number
  
  if (bus.isDwelling) {
    // Bus is stopped at currentStopIndex, needs to leave first then travel
    stopsAway = (targetStopIndex - bus.currentStopIndex + total) % total
    if (stopsAway === 0) return 0 // already there
    // Time = remaining dwell + travel segments + dwell at intermediate stops
    const travelTime = stopsAway * TRAVEL_TIME_PER_SEGMENT
    const intermediateDwells = (stopsAway - 1) * DWELL_TIME
    return bus.dwellRemaining + travelTime + intermediateDwells
  } else {
    // Bus is traveling from currentStopIndex toward next stop
    const nextStopIndex = (bus.currentStopIndex + 1) % total
    if (nextStopIndex === targetStopIndex) {
      // Next stop is the target
      return Math.round((1 - bus.progress) * TRAVEL_TIME_PER_SEGMENT)
    }
    stopsAway = (targetStopIndex - nextStopIndex + total) % total
    const remainingToNext = Math.round((1 - bus.progress) * TRAVEL_TIME_PER_SEGMENT)
    const dwellAtNext = DWELL_TIME
    const additionalTravel = stopsAway * TRAVEL_TIME_PER_SEGMENT
    const intermediateDwells = Math.max(0, stopsAway - 1) * DWELL_TIME
    return remainingToNext + dwellAtNext + additionalTravel + intermediateDwells
  }
}

/** Format seconds to MM:SS */
export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

/** Format seconds to just minutes */
export function formatMinutes(seconds: number): number {
  return Math.max(1, Math.ceil(seconds / 60))
}

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

export const scheduleStopCodes = ["P", "P", "P", "P", "S", "P", "P", "P", "P", "P1"]

export function generateSchedule(): { label: string; times: string[] }[] {
  const rows: { label: string; times: string[] }[] = []
  const startHour = 8
  const endHour = 16

  for (let hour = startHour; hour <= endHour; hour++) {
    for (const min of [0, 30]) {
      if (hour === endHour && min > 0) break
      const label = `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`
      const times: string[] = []
      for (let s = 0; s < 10; s++) {
        const offset = s * 5
        const totalMin = min + offset
        const m = totalMin % 60
        const h = hour + Math.floor(totalMin / 60)
        if (h > 16 || (h === 16 && m > 45)) {
          times.push("")
        } else {
          times.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`)
        }
      }
      rows.push({ label, times })
    }
  }
  return rows
}

export const problemTypes = [
  { id: "late", label: "รถเมล์มาช้า", icon: "clock" },
  { id: "crowded", label: "รถเมล์คนเยอะมาก", icon: "users" },
  { id: "broken", label: "รถเมล์เสีย", icon: "wrench" },
  { id: "noise", label: "สิ่งอำนวยความสะดวกเสีย", icon: "volume" },
  { id: "safety", label: "ปัญหาความปลอดภัย", icon: "alert" },
  { id: "clean", label: "ความสะอาด", icon: "sparkles" },
  { id: "behavior", label: "พฤติกรรมคนขับ", icon: "user" },
  { id: "other", label: "อื่นๆ", icon: "more" },
]
