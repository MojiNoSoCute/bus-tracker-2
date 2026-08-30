/**
 * ===================================================================
 * bus-data.ts - ข้อมูลและ Logic ระบบติดตามรถเมล์ไฟฟ้า มรภ.นครปฐม (NPRU)
 * ===================================================================
 * 
 * มหาวิทยาลัยราชภัฏนครปฐม (Nakhon Pathom Rajabhat University - NPRU)
 * พิกัดศูนย์กลาง: 13.8373° N, 100.0308° E (ถนนมาลัยแมน อ.เมือง จ.นครปฐม)
 * 
 * @author Bus Tracker Team - NPRU EV Smart Mobility
 * @version 2.0.0
 */

// ===================================================================
// SECTION 1: TYPE DEFINITIONS
// ===================================================================

export type FacilityType = 
  | "toilet" 
  | "market" 
  | "atm" 
  | "cafe" 
  | "parking" 
  | "wifi" 
  | "food" 
  | "pharmacy" 
  | "store" 
  | "gym" 
  | "library" 
  | "hospital"
  | "ev_charger"
  | "wheelchair"
  | "printer"

export interface Facility {
  label: string
  icon: FacilityType
  color: string
}

export interface BusStop {
  id: number
  code: string
  name: string
  nameEn: string
  building: string
  description: string
  lat: number
  lng: number
  facilities: string[]
  accessible: boolean
  isPopular?: boolean
}

export interface BusRoute {
  id: string
  name: string
  nameEn: string
  color: string
  stops: number[] // array of stop IDs
  description: string
}

export interface BusState {
  id: number
  name: string
  code: string
  plateNumber: string
  driverName: string
  driverPhone: string
  currentStopIndex: number
  progress: number // 0.0 to 1.0 between currentStopIndex and nextStopIndex
  speed: number // km/h
  passengers: number
  maxCapacity: number
  battery: number // %
  status: "กำลังเดินทาง" | "จอดรับผู้โดยสาร" | "กำลังจะออก" | "ชาร์จไฟ/พักรถ"
  isDwelling: boolean
  dwellRemaining: number // seconds
  routeId: string
  currentLat: number
  currentLng: number
  heading: number
  wheelchairAccessible: boolean
  acTemp: number
  lastUpdated: string
}

// ===================================================================
// SECTION 2: NPRU CAMPUS CONSTANTS
// ===================================================================

export const NPRU_CENTER = {
  lat: 13.8365,
  lng: 100.0282,
  zoom: 17,
}

export const NPRU_BOUNDS: [[number, number], [number, number]] = [
  [13.8320, 100.0220], // Southwest
  [13.8410, 100.0340], // Northeast
]

/**
 * ขอบเขตรั้วมหาวิทยาลัยราชภัฏนครปฐม (NPRU Campus Perimeter Boundary)
 * พิกัดขอบเขตรั้วจริงของ มรภ.นครปฐม 100% อยู่เฉพาะภายในพื้นที่มหาวิทยาลัย ไม่ข้ามถนนมาลัยแมน
 */
export const NPRU_CAMPUS_POLYGON: [number, number][] = [
  [13.83803, 100.02372], // มุมตะวันตกเฉียงเหนือ
  [13.83765, 100.02379],
  [13.83776, 100.02436],
  [13.83748, 100.02443],
  [13.83757, 100.02497],
  [13.83694, 100.02512],
  [13.83609, 100.02559],
  [13.83606, 100.02563],
  [13.83589, 100.02592],
  [13.83529, 100.02681],
  [13.83495, 100.02660],
  [13.83453, 100.02730], // มุมใต้ฝั่งตะวันตก
  [13.83482, 100.02782],
  [13.83411, 100.02801],
  [13.83357, 100.02883], // มุมใต้สุด (ใต้สระน้ำ)
  [13.83365, 100.02944],
  [13.83414, 100.03030],
  [13.83445, 100.03016],
  [13.83486, 100.03030],
  [13.83501, 100.03061],
  [13.83516, 100.03063],
  [13.83491, 100.03111],
  [13.83418, 100.03229], // มุมตะวันออกเฉียงใต้
  [13.83469, 100.03262], // มุมตะวันออกเฉียงใต้ติดแนวถนนมาลัยแมน
  [13.83499, 100.03238],
  [13.83514, 100.03259],
  [13.83776, 100.03033], // เลียบฝั่งในถนนมาลัยแมน (ไม่ข้ามถนน)
  [13.83919, 100.02909], // ทางเหนือฝั่งมาลัยแมน
  [13.83980, 100.02856], // ยอดทิศเหนือสุด (แนวรั้วทิศเหนือ)
  [13.83971, 100.02835],
  [13.83932, 100.02756],
  [13.83837, 100.02594],
  [13.83904, 100.02533],
  [13.83932, 100.02522],
  [13.83894, 100.02474],
  [13.83931, 100.02466],
  [13.83926, 100.02389],
  [13.83874, 100.02393],
  [13.83876, 100.02428],
  [13.83818, 100.02431],
  [13.83803, 100.02372],
]

/**
 * สถานที่และอาคารสำคัญภายในมหาวิทยาลัยราชภัฏนครปฐม
 */
export interface CampusLandmark {
  name: string
  nameEn: string
  category: "academic" | "facility" | "sports" | "dorm" | "service"
  lat: number
  lng: number
  iconName: string
}

export const CAMPUS_LANDMARKS: CampusLandmark[] = [
  {
    name: "หอประชุมปิ่นเกลียว",
    nameEn: "Pin-Kliao Auditorium",
    category: "academic",
    lat: 13.83700,
    lng: 100.02800,
    iconName: "GraduationCap",
  },
  {
    name: "คณะครุศาสตร์ (อาคาร A2)",
    nameEn: "Faculty of Education",
    category: "academic",
    lat: 13.83760,
    lng: 100.02940,
    iconName: "Building2",
  },
  {
    name: "สวนเฉลิมพระเกียรติ / สวนป่าเหนือ",
    nameEn: "Royal Green Park",
    category: "facility",
    lat: 13.83920,
    lng: 100.02820,
    iconName: "Trees",
  },
  {
    name: "อาคารเรียนรวมและนวัตกรรม (ฝั่งตะวันตก)",
    nameEn: "West Innovation Complex",
    category: "academic",
    lat: 13.83720,
    lng: 100.02640,
    iconName: "FlaskConical",
  },
  {
    name: "อาคารเทคโนโลยีอุตสาหกรรม",
    nameEn: "Industrial Technology",
    category: "academic",
    lat: 13.83620,
    lng: 100.02530,
    iconName: "Wrench",
  },
  {
    name: "คณะวิทยาการจัดการ (อาคาร 4)",
    nameEn: "Management Sciences (Bldg 4)",
    category: "academic",
    lat: 13.83580,
    lng: 100.03180,
    iconName: "Briefcase",
  },
  {
    name: "สระน้ำ มรภ.นครปฐม",
    nameEn: "NPRU Central Lake",
    category: "facility",
    lat: 13.83520,
    lng: 100.02950,
    iconName: "Waves",
  },
]

export const FACILITY_MAP: Record<string, Facility> = {
  "ห้องน้ำ":            { label: "ห้องน้ำ",            icon: "toilet",      color: "#2196F3" },
  "ตลาดนัด/ร้านค้า":    { label: "ตลาดนัด/ร้านค้า",    icon: "market",      color: "#FF9800" },
  "ตู้ ATM/ธนาคาร":     { label: "ตู้ ATM/ธนาคาร",     icon: "atm",         color: "#4CAF50" },
  "ร้านกาแฟ":           { label: "ร้านกาแฟ",           icon: "cafe",        color: "#795548" },
  "ที่จอดรถยนต์/มอเตอร์ไซค์": { label: "ที่จอดรถ",      icon: "parking",     color: "#607D8B" },
  "Wi-Fi NPRU-Smart":   { label: "Wi-Fi มหาวิทยาลัย", icon: "wifi",        color: "#9C27B0" },
  "ศูนย์อาหาร/ร้านข้าว": { label: "ศูนย์อาหาร",        icon: "food",        color: "#F44336" },
  "ร้านยา/ห้องปฐมพยาบาล": { label: "ห้องพยาบาล/ยา",   icon: "pharmacy",    color: "#00BCD4" },
  "7-Eleven/ร้านสะดวกซื้อ": { label: "ร้านสะดวกซื้อ",   icon: "store",       color: "#E91E63" },
  "ฟิตเนส/สนามกีฬา":    { label: "ฟิตเนส/สนามกีฬา",    icon: "gym",         color: "#FF5722" },
  "ห้องสมุด/Co-Working": { label: "ห้องสมุด/Co-Working", icon: "library",   color: "#3F51B5" },
  "ศูนย์บริการสาธารณสุข": { label: "ศูนย์แพทย์",       icon: "hospital",    color: "#D32F2F" },
  "จุดชาร์จ EV":        { label: "จุดชาร์จ EV",        icon: "ev_charger",  color: "#10B981" },
  "ทางลาดวีลแชร์":       { label: "ทางลาดวีลแชร์",      icon: "wheelchair",  color: "#0284C7" },
  "ศูนย์ถ่ายเอกสาร/พิมพ์งาน": { label: "ร้านถ่ายเอกสาร", icon: "printer",    color: "#8B5CF6" },
}

/**
 * รายชื่อจุดจอดรถเมล์ไฟฟ้า 12 จุด
 * พิกัดอ้างอิงจากแผนที่จริง NPRU และเส้นสีแดงในภาพ
 *
 * เส้นทางวิ่ง (เริ่มจากสวนเฉลิมฯ ยอดเหนือ):
 * P1(สวนเฉลิมฯ/สนามป้าสมัน ยอดเหนือ)
 *  ↓ ลงแนวกลาง
 * P2(สี่แยกกลาง หน้าอาคาร Computer/ศูนย์ภาษา)
 *  ← ออกซ้าย (ตะวันตก) แนวนอน
 * P3(Computer building ปลาย loop NW)
 *  วน loop สี่เหลี่ยม NW แล้วกลับ
 * P4(สี่แยกกลาง กลับมา)
 *  ↙ ลงซ้าย-ใต้ ไปอาคาร ETB
 * P5(อาคารเทคโนโลยีอุตสาหกรรม ซ้ายล่าง)
 *  ↗ กลับขึ้นสี่แยกกลาง
 * P6(สี่แยกกลาง)
 *  → ออกขวา (ตะวันออก) ไปครุศาสตร์
 * P7(ครุศาสตร์ A2)
 *  ↓ ลงใต้ตามแนวขวา ใกล้มาลัยแมน
 * P8(วิทยาการจัดการ อาคาร 4)
 *  ↓ ลงใต้ต่อ → วน loop ขวาล่าง
 * P9(อาคารสิริวรปัญญา ใต้สุด)
 *  ← ออกซ้าย ข้ามสระน้ำ
 * P10(ริมสระน้ำ)
 *  ↑ ขึ้นเหนือกลับสี่แยก
 * P11(สี่แยกกลาง ขาขึ้น)
 *  ↑ ขึ้นเหนือต่อ
 * P12(สวนเฉลิมฯ วนซ้ำ)
 */
export const stops: BusStop[] = [
  {
    id: 1,
    code: "P1",
    name: "สวนเฉลิมพระเกียรติ / สนามป้าสมัน (จุดเริ่ม)",
    nameEn: "Royal Garden / North Start",
    building: "สวนเฉลิมพระเกียรติ & สนามป้าสมัน",
    description: "จุดเริ่มต้นเส้นทาง ยอดเหนือสุดของวิทยาเขต",
    lat: 13.83942,
    lng: 100.02810,
    facilities: ["ห้องน้ำ", "Wi-Fi NPRU-Smart"],
    accessible: true,
    isPopular: true,
  },
  {
    id: 2,
    code: "P2",
    name: "สี่แยกกลาง / อาคารศูนย์คอมพิวเตอร์",
    nameEn: "Central Junction / Computer Center",
    building: "อาคารศูนย์คอมพิวเตอร์ มรภ.นครปฐม",
    description: "สี่แยกกลางมหาวิทยาลัย จุดเชื่อมต่อหลักทุกทิศทาง",
    lat: 13.83810,
    lng: 100.02740,
    facilities: ["ห้องน้ำ", "Wi-Fi NPRU-Smart", "ร้านกาแฟ", "ตู้ ATM/ธนาคาร"],
    accessible: true,
    isPopular: true,
  },
  {
    id: 3,
    code: "P3",
    name: "อาคาร Computer (loop ตะวันตกเฉียงเหนือ)",
    nameEn: "Computer Building - NW Loop",
    building: "อาคาร Computer มรภ.นครปฐม",
    description: "ปลาย loop สี่เหลี่ยม NW หน้าอาคาร Computer",
    lat: 13.83845,
    lng: 100.02435,
    facilities: ["ห้องน้ำ", "Wi-Fi NPRU-Smart", "จุดชาร์จ EV"],
    accessible: true,
    isPopular: true,
  },
  {
    id: 4,
    code: "P4",
    name: "สี่แยกกลาง (กลับจาก loop Computer)",
    nameEn: "Central Junction (Return from NW Loop)",
    building: "อาคารศูนย์คอมพิวเตอร์ / หอประชุมปิ่นเกลียว",
    description: "กลับสู่สี่แยกกลางหลังวน loop Computer",
    lat: 13.83810,
    lng: 100.02740,
    facilities: ["ห้องน้ำ", "ร้านกาแฟ", "Wi-Fi NPRU-Smart"],
    accessible: true,
  },
  {
    id: 5,
    code: "P5",
    name: "อาคารเทคโนโลยีอุตสาหกรรม",
    nameEn: "Industrial Technology Building",
    building: "คณะเทคโนโลยีอุตสาหกรรม มรภ.นครปฐม",
    description: "คณะเทคโนโลยีอุตสาหกรรม ห้องปฏิบัติการและโรงประลอง",
    lat: 13.83600,
    lng: 100.02535,
    facilities: ["ห้องน้ำ", "Wi-Fi NPRU-Smart", "จุดชาร์จ EV"],
    accessible: true,
    isPopular: true,
  },
  {
    id: 6,
    code: "P6",
    name: "สี่แยกกลาง (กลับจาก ETB)",
    nameEn: "Central Junction (Return from ETB)",
    building: "อาคารศูนย์คอมพิวเตอร์ / ผลประสุมณีคลินา",
    description: "กลับสู่สี่แยกกลาง หลังวน ETB เสร็จ",
    lat: 13.83810,
    lng: 100.02740,
    facilities: ["ห้องน้ำ", "Wi-Fi NPRU-Smart"],
    accessible: true,
  },
  {
    id: 7,
    code: "P7",
    name: "คณะครุศาสตร์ (อาคาร A2)",
    nameEn: "Faculty of Education (Building A2)",
    building: "อาคาร A2 คณะครุศาสตร์",
    description: "คณะครุศาสตร์ ฝั่งถนนมาลัยแมน",
    lat: 13.83798,
    lng: 100.02950,
    facilities: ["ห้องน้ำ", "ร้านกาแฟ", "Wi-Fi NPRU-Smart"],
    accessible: true,
    isPopular: true,
  },
  {
    id: 8,
    code: "P8",
    name: "คณะวิทยาการจัดการ (อาคาร 4)",
    nameEn: "Faculty of Management Sciences (Building 4)",
    building: "อาคารเฉลิมพระเกียรติ 50 พรรษา / อาคาร 4",
    description: "สำนักงานทะเบียน คณะวิทยาการจัดการ",
    lat: 13.83560,
    lng: 100.03175,
    facilities: ["ตู้ ATM/ธนาคาร", "ห้องน้ำ", "Wi-Fi NPRU-Smart"],
    accessible: true,
    isPopular: true,
  },
  {
    id: 9,
    code: "P9",
    name: "อาคารสิริวรปัญญา (ใต้สุด)",
    nameEn: "Sirivorapanya Building (Southernmost)",
    building: "อาคารสิริวรปัญญา สำนักงานอธิการบดี",
    description: "จุดใต้สุดของเส้นทาง loop ขวาล่าง อาคารสิริวรปัญญา",
    lat: 13.83388,
    lng: 100.03048,
    facilities: ["ตู้ ATM/ธนาคาร", "ห้องน้ำ", "Wi-Fi NPRU-Smart"],
    accessible: true,
    isPopular: true,
  },
  {
    id: 10,
    code: "P10",
    name: "ริมสระน้ำ มรภ.นครปฐม",
    nameEn: "NPRU Lakefront",
    building: "ลานนันทนาการริมสระน้ำ",
    description: "ริมสระน้ำกลางมหาวิทยาลัย",
    lat: 13.83490,
    lng: 100.02900,
    facilities: ["Wi-Fi NPRU-Smart", "ร้านกาแฟ", "ห้องน้ำ"],
    accessible: true,
    isPopular: true,
  },
  {
    id: 11,
    code: "P11",
    name: "สี่แยกกลาง (ขาขึ้นเหนือ)",
    nameEn: "Central Junction (Northbound)",
    building: "อาคารศูนย์คอมพิวเตอร์ / ผลประสุมณีคลินา",
    description: "สี่แยกกลาง ขากลับขึ้นทิศเหนือ",
    lat: 13.83810,
    lng: 100.02740,
    facilities: ["ห้องน้ำ", "Wi-Fi NPRU-Smart"],
    accessible: true,
  },
  {
    id: 12,
    code: "P12",
    name: "สวนเฉลิมพระเกียรติ / สนามป้าสมัน (วนซ้ำ)",
    nameEn: "Royal Garden - North Loop Complete",
    building: "สวนเฉลิมพระเกียรติ & สนามป้าสมัน",
    description: "วนกลับสู่จุดเริ่มต้น",
    lat: 13.83942,
    lng: 100.02810,
    facilities: ["ห้องน้ำ", "Wi-Fi NPRU-Smart"],
    accessible: true,
  },
]

/**
 * STOP_SEGMENTS — waypoints ถนนจริงระหว่างแต่ละคู่จุดจอด
 *
 * อ้างอิงจาก NPRU_CAMPUS_POLYGON เป็น anchor:
 *  - แนวรั้วตะวันตกเฉียงเหนือ: lng ~100.0237–100.0248, lat ~13.838
 *  - แนวถนนกลาง: lng ~100.0274–100.0281
 *  - แนวรั้วตะวันออก (มาลัยแมน): lng ~100.0303–100.0326
 *  - ยอดเหนือสุด polygon: lat 13.83980, lng 100.02856
 *  - ใต้สุด polygon: lat 13.83357, lng 100.02883
 */
export const STOP_SEGMENTS: [number, number][][] = [
  // SEG 0: P1 → P2
  // ลงแนวกลาง จากสวนเฉลิมฯ (ยอดเหนือ) → สี่แยกกลาง
  // ใน polygon ยอดเหนือ = 13.83980, 100.02856
  // เส้นแนวตั้งกลางมหาวิทยาลัย lng ~100.0281
  [
    [13.83942, 100.02810],
    [13.83930, 100.02810],
    [13.83910, 100.02795],
    [13.83880, 100.02775],
    [13.83855, 100.02758],
    [13.83810, 100.02740],
  ],

  // SEG 1: P2 → P3
  // จากสี่แยกกลาง ออกซ้าย (ตะวันตก) แนวนอน
  // → ถึงถนนแนวตั้งฝั่งซ้าย (lng ~100.0260) → เลี้ยวขึ้นเหนือ
  // → ถึง loop NW บน (lat ~13.8385, lng ~100.0243)
  // polygon NW: [13.83818, 100.02431] และ [13.83876, 100.02428]
  [
    [13.83810, 100.02740],
    [13.83815, 100.02670],
    [13.83820, 100.02590],
    [13.83830, 100.02510],
    [13.83845, 100.02460],
    [13.83845, 100.02435],
  ],

  // SEG 2: P3 → P4
  // วน loop NW สี่เหลี่ยม แล้วกลับสี่แยกกลาง
  // loop: ลงใต้ (lat ลด) → เลี้ยวขวา (lng เพิ่ม) → ขึ้นเหนือ → กลับสี่แยก
  // ขอบล่าง loop อ้างอิง polygon: [13.83757, 100.02497] และ [13.83776, 100.02436]
  [
    [13.83845, 100.02435],
    [13.83845, 100.02455],
    [13.83815, 100.02465],
    [13.83785, 100.02470],
    [13.83775, 100.02490],
    [13.83775, 100.02545],
    [13.83785, 100.02605],
    [13.83800, 100.02660],
    [13.83810, 100.02700],
    [13.83810, 100.02740],
  ],

  // SEG 3: P4 → P5
  // จากสี่แยกกลาง → ลงซ้าย-ใต้ (SW) ไปอาคาร ETB
  // polygon SW: [13.83609, 100.02559] และ [13.83589, 100.02592]
  // เส้นผ่านกลางๆ ระหว่างแนวกลางกับแนวตะวันตก
  [
    [13.83810, 100.02740],
    [13.83790, 100.02700],
    [13.83765, 100.02660],
    [13.83730, 100.02620],
    [13.83695, 100.02590],
    [13.83650, 100.02563],
    [13.83600, 100.02535],
  ],

  // SEG 4: P5 → P6
  // กลับขึ้นเหนือ-ขวา ตามเส้นเดิม
  [
    [13.83600, 100.02535],
    [13.83650, 100.02563],
    [13.83695, 100.02590],
    [13.83730, 100.02620],
    [13.83765, 100.02660],
    [13.83790, 100.02700],
    [13.83810, 100.02740],
  ],

  // SEG 5: P6 → P7
  // จากสี่แยกกลาง → ออกขวา (ตะวันออก) ไปครุศาสตร์ A2
  // A2 อยู่ที่ lat ~13.8380, lng ~100.0295 (ห่างจากมาลัยแมนพอสมควร)
  [
    [13.83810, 100.02740],
    [13.83815, 100.02800],
    [13.83812, 100.02860],
    [13.83806, 100.02910],
    [13.83798, 100.02950],
  ],

  // SEG 6: P7 → P8
  // ลงใต้ตามแนวขวา ใกล้รั้วมาลัยแมน
  // polygon ฝั่งขวา: [13.83776, 100.03033] → [13.83514, 100.03259]
  // วิ่งฝั่งในห่างจากรั้วนิดหน่อย
  [
    [13.83798, 100.02950],
    [13.83770, 100.03000],
    [13.83740, 100.03040],
    [13.83705, 100.03085],
    [13.83670, 100.03120],
    [13.83625, 100.03148],
    [13.83560, 100.03175],
  ],

  // SEG 7: P8 → P9
  // ลงใต้ต่อ → วน loop ขวาล่าง (สี่เหลี่ยม)
  // polygon SE: [13.83486, 100.03030] [13.83501, 100.03061] [13.83516, 100.03063]
  // [13.83491, 100.03111] [13.83418, 100.03229]
  // loop ขวาล่าง: ลงใต้ → เลี้ยวซ้าย → ขึ้นเหนือเล็กน้อย
  [
    [13.83560, 100.03175],
    [13.83530, 100.03195],
    [13.83505, 100.03200],
    // เลี้ยวซ้าย (ตะวันตก) ข้ามล่าง loop
    [13.83480, 100.03185],
    [13.83455, 100.03155],
    [13.83430, 100.03115],
    [13.83410, 100.03075],
    [13.83388, 100.03048],
  ],

  // SEG 8: P9 → P10
  // จากสิริวรปัญญา → ออกซ้าย (ตะวันตก) → ขึ้นเหนือ → ริมสระน้ำ
  // สระน้ำอยู่ที่ lat ~13.8352, lng ~100.0295 (landmark)
  [
    [13.83388, 100.03048],
    [13.83395, 100.02990],
    [13.83420, 100.02950],
    [13.83450, 100.02920],
    [13.83490, 100.02900],
  ],

  // SEG 9: P10 → P11
  // จากริมสระน้ำ → ขึ้นเหนือ → กลับสี่แยกกลาง
  [
    [13.83490, 100.02900],
    [13.83535, 100.02870],
    [13.83580, 100.02840],
    [13.83625, 100.02810],
    [13.83670, 100.02790],
    [13.83720, 100.02768],
    [13.83770, 100.02752],
    [13.83810, 100.02740],
  ],

  // SEG 10: P11 → P12
  // จากสี่แยกกลาง → ขึ้นเหนือต่อ → สวนเฉลิมฯ ยอดเหนือ
  [
    [13.83810, 100.02740],
    [13.83855, 100.02758],
    [13.83880, 100.02775],
    [13.83910, 100.02795],
    [13.83930, 100.02810],
    [13.83942, 100.02810],
  ],
]

/**
 * เส้นทางถนนหลักรวมทุกจุดภายในมหาวิทยาลัย
 */
export const CAMPUS_ROAD_WAYPOINTS: [number, number][] = STOP_SEGMENTS.flatMap((seg, idx) =>
  idx === STOP_SEGMENTS.length - 1 ? seg : seg.slice(0, -1)
)

export const ROUTES: BusRoute[] = [
  {
    id: "route-1",
    name: "สาย 1: วงรอบประจำวิทยาเขต (NPRU Red Campus Loop)",
    nameEn: "Route 1: NPRU Red Campus Master Loop",
    color: "#e63462",
    stops: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    description: "วิ่งตามเส้นทางสีแดงเป๊ะๆ: สวนเฉลิมฯ → สี่แยกกลาง → loop Computer NW → อาคารเรียนรวม/ETB → ครุศาสตร์ A2 → วิทยาการจัดการ → สิริวรปัญญา → ริมสระ → วนซ้ำ",
  },
]

// ===================================================================
// SECTION 3: SIMULATION CONSTANTS & INITIAL STATE
// ===================================================================

export const TRAVEL_TIME_PER_SEGMENT = 180 // 3 นาทีต่อช่วงในความเร็วปกติ
export const DWELL_TIME = 90 // จอด 1.5 นาทีต่อจุด
export const SIM_TICK = 1000 // อัปเดตทุก 1 วินาทีเพื่อความนุ่มนวล
export const SIM_SECONDS_PER_TICK = 5 // 1 tick = 5 วินาทีจำลอง

export const initialBuses: BusState[] = [
  {
    id: 1,
    name: "NPRU EV Shuttle 01",
    code: "รถเมล์ไฟฟ้า คันที่ 1 (สายสีแดง)",
    plateNumber: "นฐ 40-1011 (นครปฐม)",
    driverName: "นายสมศักดิ์ รัตนชัย",
    driverPhone: "081-456-7890",
    currentStopIndex: 0,   // P1→P2 กำลังลงใต้จากสวนเฉลิมฯ
    progress: 0.5,
    speed: 18,
    passengers: 14,
    maxCapacity: 24,
    battery: 92,
    status: "กำลังเดินทาง",
    isDwelling: false,
    dwellRemaining: 0,
    routeId: "route-1",
    currentLat: 13.83895,
    currentLng: 100.02787,
    heading: 195,
    wheelchairAccessible: true,
    acTemp: 24,
    lastUpdated: "เรียลไทม์ (GPS ออนไลน์)",
  },
  {
    id: 2,
    name: "NPRU EV Shuttle 02",
    code: "รถเมล์ไฟฟ้า คันที่ 2 (สายสีแดง)",
    plateNumber: "นฐ 40-1012 (นครปฐม)",
    driverName: "นายประสิทธิ์ บุญมี",
    driverPhone: "089-223-4455",
    currentStopIndex: 4,   // P5 จอดรับผู้โดยสาร อาคาร ETB
    progress: 0.0,
    speed: 0,
    passengers: 19,
    maxCapacity: 24,
    battery: 78,
    status: "จอดรับผู้โดยสาร",
    isDwelling: true,
    dwellRemaining: 60,
    routeId: "route-1",
    currentLat: 13.83600,
    currentLng: 100.02535,
    heading: 30,
    wheelchairAccessible: true,
    acTemp: 23.5,
    lastUpdated: "เรียลไทม์ (GPS ออนไลน์)",
  },
  {
    id: 3,
    name: "NPRU EV Shuttle 03",
    code: "รถเมล์ไฟฟ้า คันที่ 3 (สายสีแดง)",
    plateNumber: "นฐ 40-1013 (นครปฐม)",
    driverName: "นายวิชาญ ใจมั่น",
    driverPhone: "084-556-9911",
    currentStopIndex: 6,   // P7→P8 กำลังลงใต้ฝั่งขวา
    progress: 0.5,
    speed: 16,
    passengers: 10,
    maxCapacity: 24,
    battery: 85,
    status: "กำลังเดินทาง",
    isDwelling: false,
    dwellRemaining: 0,
    routeId: "route-1",
    currentLat: 13.83680,
    currentLng: 100.03085,
    heading: 165,
    wheelchairAccessible: true,
    acTemp: 24.0,
    lastUpdated: "เรียลไทม์ (GPS ออนไลน์)",
  },
]

// ===================================================================
// SECTION 4: HELPER FUNCTIONS & MATHEMATICAL LOGIC
// ===================================================================

/**
 * คำนวณระยะทางจริงระหว่าง 2 พิกัดด้วย Haversine Formula (เมตร)
 */
export function calculateDistanceMeters(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 6371e3 // รัศมีโลกในหน่วยเมตร
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return Math.round(R * c)
}

/**
 * คำนวณมุมองศา (Heading / Bearing) ระหว่างจุดเริ่มต้นและจุดสิ้นสุด (0 - 360 องศา)
 */
export function calculateBearing(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const y = Math.sin(Δλ) * Math.cos(φ2)
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ)
  const θ = Math.atan2(y, x)
  return Math.round(((θ * 180) / Math.PI + 360) % 360)
}

/**
 * หาพิกัด GPS ณ จุดใดๆ บนเส้นทางตามความคืบหน้าระหว่าง 2 จุดจอด
 * โดยคำนวณตามแนวถนนจริงภายในมหาวิทยาลัย (STOP_SEGMENTS) ไม่วิ่งตัดอาคาร และไม่วิ่งออกนอก ม.
 */
export function getInterpolatedBusCoordinates(
  fromStopIndex: number,
  progress: number
): { lat: number; lng: number; heading: number } {
  const segment = STOP_SEGMENTS[fromStopIndex] || [
    [stops[fromStopIndex].lat, stops[fromStopIndex].lng],
    [stops[(fromStopIndex + 1) % stops.length].lat, stops[(fromStopIndex + 1) % stops.length].lng],
  ]

  if (segment.length <= 1) {
    return {
      lat: segment[0][0],
      lng: segment[0][1],
      heading: 0,
    }
  }

  // Calculate cumulative distances along segment sub-lines
  const distances: number[] = []
  let totalDist = 0

  for (let i = 0; i < segment.length - 1; i++) {
    const d = calculateDistanceMeters(
      segment[i][0],
      segment[i][1],
      segment[i + 1][0],
      segment[i + 1][1]
    )
    distances.push(d)
    totalDist += d
  }

  if (totalDist === 0) {
    return {
      lat: segment[0][0],
      lng: segment[0][1],
      heading: 0,
    }
  }

  const clampedProgress = Math.max(0, Math.min(1, progress))
  const targetDist = clampedProgress * totalDist

  let accumulated = 0
  for (let i = 0; i < distances.length; i++) {
    const subDist = distances[i]
    if (accumulated + subDist >= targetDist || i === distances.length - 1) {
      const subProgress = subDist > 0 ? (targetDist - accumulated) / subDist : 0
      const p1 = segment[i]
      const p2 = segment[i + 1]

      const lat = p1[0] + (p2[0] - p1[0]) * subProgress
      const lng = p1[1] + (p2[1] - p1[1]) * subProgress
      const heading = calculateBearing(p1[0], p1[1], p2[0], p2[1])

      return { lat, lng, heading }
    }
    accumulated += subDist
  }

  const lastPoint = segment[segment.length - 1]
  const prevPoint = segment[segment.length - 2]
  return {
    lat: lastPoint[0],
    lng: lastPoint[1],
    heading: calculateBearing(prevPoint[0], prevPoint[1], lastPoint[0], lastPoint[1]),
  }
}

/**
 * คำนวณเวลาที่รถเมล์จะมาถึงจุดจอด (ETA เป็นวินาที)
 */
export function calcEtaSeconds(bus: BusState, targetStopIndex: number): number | null {
  if (!stops || stops.length === 0) return null

  if (bus.currentStopIndex === targetStopIndex && bus.isDwelling) {
    return 0
  }
  
  const totalStops = stops.length
  let stopsAway: number
  
  if (bus.isDwelling) {
    stopsAway = (targetStopIndex - bus.currentStopIndex + totalStops) % totalStops
    if (stopsAway === 0) return 0
    
    const travelTime = stopsAway * TRAVEL_TIME_PER_SEGMENT
    const intermediateDwells = (stopsAway - 1) * DWELL_TIME
    return bus.dwellRemaining + travelTime + intermediateDwells
  } else {
    const nextStopIndex = (bus.currentStopIndex + 1) % totalStops
    
    if (nextStopIndex === targetStopIndex) {
      return Math.round((1 - bus.progress) * TRAVEL_TIME_PER_SEGMENT)
    }
    
    stopsAway = (targetStopIndex - nextStopIndex + totalStops) % totalStops
    const remainingToNext = Math.round((1 - bus.progress) * TRAVEL_TIME_PER_SEGMENT)
    const dwellAtNext = DWELL_TIME
    const additionalTravel = stopsAway * TRAVEL_TIME_PER_SEGMENT
    const intermediateDwells = Math.max(0, stopsAway - 1) * DWELL_TIME
    
    return remainingToNext + dwellAtNext + additionalTravel + intermediateDwells
  }
}

/**
 * แปลงวินาทีเป็น MM:SS
 */
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
}

/**
 * แปลงวินาทีเป็นจำนวนนาที (ปัดขึ้น)
 */
export function formatMinutes(seconds: number): number {
  return Math.max(1, Math.ceil(seconds / 60))
}

// ===================================================================
// SECTION 5: SCHEDULE GENERATOR (NPRU TIMETABLE)
// ===================================================================

export const scheduleStops = stops.map(s => s.name)
export const scheduleStopCodes = stops.map(s => s.code)

export function generateSchedule(): { label: string; times: string[] }[] {
  if (!stops || stops.length === 0) return []

  const rows: { label: string; times: string[] }[] = []
  const startHour = 7   // เริ่ม 07:30 น.
  const endHour = 18    // สิ้นสุด 18:00 น.

  for (let hour = startHour; hour <= endHour; hour++) {
    for (const minute of [0, 20, 40]) {
      if (hour === 7 && minute < 30) continue
      if (hour === endHour && minute > 0) break
      
      const label = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
      const times: string[] = []
      
      for (let stopIndex = 0; stopIndex < stops.length; stopIndex++) {
        const offsetMinutes = stopIndex * 3 // เฉลี่ย 3 นาทีต่อป้าย
        const totalMinutes = minute + offsetMinutes
        const arrivalMinute = totalMinutes % 60
        const arrivalHour = hour + Math.floor(totalMinutes / 60)
        
        if (arrivalHour > 18 || (arrivalHour === 18 && arrivalMinute > 30)) {
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
// SECTION 6: PROBLEM REPORTS
// ===================================================================

export const problemTypes = [
  { id: "late",     label: "รถมาช้ากว่าตารางเวลา",        icon: "clock" },
  { id: "crowded",  label: "ผู้โดยสารหนาแน่น/ไม่มีที่นั่ง", icon: "users" },
  { id: "broken",   label: "แอร์ไม่เย็น / รถขัดข้อง",     icon: "wrench" },
  { id: "ramp",     label: "ปัญหาทางลาด/วีลแชร์",        icon: "wheelchair" },
  { id: "stop",     label: "ป้ายหยุดรถ/จุดจอดชำรุด",     icon: "alert" },
  { id: "clean",    label: "ความสะอาดภายในรถ",           icon: "sparkles" },
  { id: "behavior", label: "การขับขี่/มารยาทพนักงาน",     icon: "user" },
  { id: "other",    label: "ข้อเสนอแนะอื่นๆ",            icon: "more" },
]
