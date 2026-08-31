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
 * รายชื่อจุดจอดรถเมล์ไฟฟ้า 14 จุด (ตามจุดสีฟ้าในแผนที่)
 *
 * ลำดับวิ่ง: P1(แนวทแยงเหนือ) → P2(สี่แยกกลาง/ยอดเส้นทแยงกลาง) → P3(กลางเส้นทแยง)
 * → P4(ใต้หอประชุมฝั่งตะวันตก) → P5(เรียนรวมฯ ฝั่งใต้) → P6(สี่แยกตะวันตก)
 * → P7(loop Computer เหนือ) → P8(loop Computer ใต้) → P9(สี่แยกตะวันตก กลับ)
 * → P10(ครุศาสตร์ A2 ขาขึ้น) → P11(ครุศาสตร์ A2 ฝั่งตะวันออก) → P12(อาคาร 4 ฝั่งเหนือ)
 * → P13(เส้นทแยง loop สิริวรปัญญา) → P14(สิริวรปัญญา ฝั่งตะวันออก) → วนกลับ P1
 */
export const stops: BusStop[] = [
  {
    id: 1,
    code: "P1",
    name: "อาคารศูนย์คอมพิวเตอร์ (แนวทแยงเหนือ)",
    nameEn: "Computer Center - North Diagonal",
    building: "อาคารปฏิบัติการคอมพิวเตอร์และนวัตกรรม",
    description: "จุดจอดบนแนวทแยงตะวันตก ขาลงจากสวนเฉลิมพระเกียรติ",
    lat: 13.83805,
    lng: 100.02753,
    facilities: ["ห้องน้ำ", "Wi-Fi NPRU-Smart"],
    accessible: true,
    isPopular: true,
  },
  {
    id: 2,
    code: "P2",
    name: "สี่แยกกลาง / จุดเชื่อมเส้นทแยงกลาง",
    nameEn: "Central Junction / Diagonal Connector",
    building: "อาคารศูนย์คอมพิวเตอร์ มรภ.นครปฐม",
    description: "สี่แยกกลางมหาวิทยาลัย จุดเชื่อมต่อแนวทแยงกับเส้นทแยงกลาง",
    lat: 13.83791,
    lng: 100.02736,
    facilities: ["ห้องน้ำ", "Wi-Fi NPRU-Smart", "ร้านกาแฟ", "ตู้ ATM/ธนาคาร"],
    accessible: true,
    isPopular: true,
  },
  {
    id: 3,
    code: "P3",
    name: "หอประชุมปิ่นเกลียว (เส้นทแยงกลาง)",
    nameEn: "Pin-Kliao Auditorium - Central Diagonal",
    building: "หอประชุมปิ่นเกลียว",
    description: "จุดจอดกลางเส้นทแยงกลางวิทยาเขต ใกล้หอประชุมปิ่นเกลียว",
    lat: 13.83685,
    lng: 100.02817,
    facilities: ["ห้องน้ำ", "Wi-Fi NPRU-Smart", "จุดชาร์จ EV"],
    accessible: true,
    isPopular: true,
  },
  {
    id: 4,
    code: "P4",
    name: "หอประชุมปิ่นเกลียว (ฝั่งใต้ตะวันตก)",
    nameEn: "Pin-Kliao Auditorium (South-West)",
    building: "หอประชุมปิ่นเกลียว",
    description: "แนวถนนฝั่งใต้หอประชุมปิ่นเกลียว ฝั่งตะวันตก",
    lat: 13.83629,
    lng: 100.02718,
    facilities: ["ห้องน้ำ", "Wi-Fi NPRU-Smart"],
    accessible: true,
  },
  {
    id: 5,
    code: "P5",
    name: "อาคารเรียนรวมนวัตกรรม (ฝั่งใต้)",
    nameEn: "Innovation Complex (South Side)",
    building: "อาคารเรียนรวมและนวัตกรรม (ฝั่งตะวันตก)",
    description: "แนวถนนฝั่งใต้ ใกล้อาคารเรียนรวมและนวัตกรรม",
    lat: 13.83697,
    lng: 100.02617,
    facilities: ["ห้องน้ำ", "Wi-Fi NPRU-Smart", "จุดชาร์จ EV"],
    accessible: true,
    isPopular: true,
  },
  {
    id: 6,
    code: "P6",
    name: "สี่แยกตะวันตก / อาคารเรียนรวมนวัตกรรม",
    nameEn: "West Junction / Innovation Complex",
    building: "อาคารเรียนรวมและนวัตกรรม (ฝั่งตะวันตก)",
    description: "สี่แยกฝั่งตะวันตก จุดเชื่อมต่อ loop Computer และแนวใต้หอประชุม",
    lat: 13.83723,
    lng: 100.02628,
    facilities: ["ห้องน้ำ", "ร้านกาแฟ", "Wi-Fi NPRU-Smart", "ตู้ ATM/ธนาคาร"],
    accessible: true,
    isPopular: true,
  },
  {
    id: 7,
    code: "P7",
    name: "อาคาร Computer (loop เหนือ)",
    nameEn: "Computer Building - North Loop",
    building: "อาคาร Computer มรภ.นครปฐม",
    description: "แนว loop สี่เหลี่ยม NW ด้านเหนือ หน้าอาคาร Computer",
    lat: 13.83807,
    lng: 100.02541,
    facilities: ["ห้องน้ำ", "Wi-Fi NPRU-Smart", "จุดชาร์จ EV"],
    accessible: true,
    isPopular: true,
  },
  {
    id: 8,
    code: "P8",
    name: "อาคาร Computer (loop ใต้)",
    nameEn: "Computer Building - South Loop",
    building: "อาคาร Computer มรภ.นครปฐม",
    description: "แนว loop สี่เหลี่ยม NW ด้านใต้",
    lat: 13.83767,
    lng: 100.02545,
    facilities: ["ห้องน้ำ", "Wi-Fi NPRU-Smart"],
    accessible: true,
  },
  {
    id: 9,
    code: "P9",
    name: "สี่แยกตะวันตก (กลับจาก loop Computer)",
    nameEn: "West Junction (Return from NW Loop)",
    building: "อาคารเรียนรวมและนวัตกรรม (ฝั่งตะวันตก)",
    description: "กลับสู่สี่แยกตะวันตกหลังวน loop Computer",
    lat: 13.83723,
    lng: 100.02628,
    facilities: ["ห้องน้ำ", "ร้านกาแฟ", "Wi-Fi NPRU-Smart"],
    accessible: true,
  },
  {
    id: 10,
    code: "P10",
    name: "คณะครุศาสตร์ (อาคาร A2 ขาขึ้น)",
    nameEn: "Faculty of Education (A2 Northbound)",
    building: "อาคาร A2 คณะครุศาสตร์",
    description: "แนวขาขึ้นคณะครุศาสตร์ จากสี่แยกตะวันออก",
    lat: 13.83702,
    lng: 100.02933,
    facilities: ["ห้องน้ำ", "Wi-Fi NPRU-Smart"],
    accessible: true,
  },
  {
    id: 11,
    code: "P11",
    name: "คณะครุศาสตร์ (อาคาร A2 ฝั่งตะวันออก)",
    nameEn: "Faculty of Education (A2 East)",
    building: "อาคาร A2 คณะครุศาสตร์",
    description: "แนวครุศาสตร์ A2 ฝั่งตะวันออก ขาลงไปอาคาร 4",
    lat: 13.83726,
    lng: 100.02993,
    facilities: ["ห้องน้ำ", "ร้านกาแฟ", "Wi-Fi NPRU-Smart"],
    accessible: true,
    isPopular: true,
  },
  {
    id: 12,
    code: "P12",
    name: "คณะวิทยาการจัดการ (อาคาร 4 ฝั่งเหนือ)",
    nameEn: "Management Sciences (Bldg 4 North)",
    building: "อาคารเฉลิมพระเกียรติ 50 พรรษา / อาคาร 4",
    description: "แนว loop ขวาล่าง ฝั่งเหนือ ใกล้คณะวิทยาการจัดการ",
    lat: 13.83604,
    lng: 100.03130,
    facilities: ["ตู้ ATM/ธนาคาร", "ห้องน้ำ", "Wi-Fi NPRU-Smart"],
    accessible: true,
    isPopular: true,
  },
  {
    id: 13,
    code: "P13",
    name: "อาคารสิริวรปัญญา (เส้นทแยง loop)",
    nameEn: "Sirivorapanya Building - Loop Diagonal",
    building: "อาคารสิริวรปัญญา สำนักงานอธิการบดี",
    description: "จุดจอดบนเส้นทแยงกลาง loop ขวาล่าง",
    lat: 13.83548,
    lng: 100.03119,
    facilities: ["ตู้ ATM/ธนาคาร", "ห้องน้ำ", "Wi-Fi NPRU-Smart"],
    accessible: true,
    isPopular: true,
  },
  {
    id: 14,
    code: "P14",
    name: "อาคารสิริวรปัญญา (ฝั่งตะวันออก)",
    nameEn: "Sirivorapanya Building (East Side)",
    building: "อาคารสิริวรปัญญา สำนักงานอธิการบดี",
    description: "แนว loop ขวาล่าง ฝั่งตะวันออก",
    lat: 13.83524,
    lng: 100.03178,
    facilities: ["ห้องน้ำ", "Wi-Fi NPRU-Smart"],
    accessible: true,
  },
]

/**
 * STOP_SEGMENTS — waypoints ถนนจริงระหว่างแต่ละคู่จุดจอด (14 จุด)
 * เส้นทางวน: แนวทแยงเหนือ → สี่แยกกลาง → เส้นทแยงกลาง → แนวใต้หอประชุม (ตะวันตก) →
 * สี่แยกตะวันตก → loop Computer → สี่แยกตะวันตก → แนวใต้หอประชุม (ตะวันออก) →
 * สี่แยกตะวันออก → ครุศาสตร์ A2 → loop อาคาร 4/สิริวรปัญญา → กลับยอดเหนือสวนเฉลิมฯ → P1
 */
export const STOP_SEGMENTS: [number, number][][] = [
  // SEG 0: P1 → P2
  // ลงซ้ายตามแนวทแยงตะวันตกไปสี่แยกกลาง
  [
    [13.83805, 100.02753],
    [13.83791, 100.02736],
  ],

  // SEG 1: P2 → P3
  // ลงเส้นทแยงกลางไปทางหอประชุมปิ่นเกลียว
  [
    [13.83791, 100.02736],
    [13.83685, 100.02817],
  ],

  // SEG 2: P3 → P4
  // ปลายเส้นทแยง แล้วเลียบแนวใต้หอประชุมไปทางตะวันตก
  [
    [13.83685, 100.02817],
    [13.83632, 100.02857],
    [13.83618, 100.02839],
    [13.83617, 100.02800],
    [13.83618, 100.02737],
    [13.83629, 100.02718],
  ],

  // SEG 3: P4 → P5
  // เลียบแนวใต้หอประชุมต่อไปทางตะวันตก
  [
    [13.83629, 100.02718],
    [13.83639, 100.02700],
    [13.83663, 100.02661],
    [13.83697, 100.02617],
  ],

  // SEG 4: P5 → P6
  // ขึ้นสี่แยกตะวันตก
  [
    [13.83697, 100.02617],
    [13.83710, 100.02611],
    [13.83723, 100.02628],
  ],

  // SEG 5: P6 → P7
  // จากสี่แยกตะวันตก วนขึ้น loop NW ด้านขวา ไปด้านเหนืออาคาร Computer
  [
    [13.83723, 100.02628],
    [13.83770, 100.02590],
    [13.83810, 100.02586],
    [13.83807, 100.02541],
  ],

  // SEG 6: P7 → P8
  // วน loop NW ด้านซ้าย ลงใต้ไปด้านใต้อาคาร Computer
  [
    [13.83807, 100.02541],
    [13.83804, 100.02506],
    [13.83764, 100.02501],
    [13.83767, 100.02545],
  ],

  // SEG 7: P8 → P9
  // ออกจาก loop กลับสี่แยกตะวันตก
  [
    [13.83767, 100.02545],
    [13.83770, 100.02590],
    [13.83723, 100.02628],
  ],

  // SEG 8: P9 → P10
  // เลียบแนวใต้หอประชุมไปตะวันออก ขึ้นสี่แยกตะวันออก แล้วขึ้นครุศาสตร์ A2
  [
    [13.83723, 100.02628],
    [13.83710, 100.02611],
    [13.83687, 100.02622],
    [13.83663, 100.02661],
    [13.83639, 100.02700],
    [13.83629, 100.02718],
    [13.83618, 100.02737],
    [13.83617, 100.02800],
    [13.83618, 100.02839],
    [13.83685, 100.02926],
    [13.83702, 100.02933],
  ],

  // SEG 9: P10 → P11
  // ผ่านแยกครุศาสตร์ เลี้ยวออกฝั่งตะวันออกของ A2
  [
    [13.83702, 100.02933],
    [13.83739, 100.02947],
    [13.83726, 100.02993],
  ],

  // SEG 10: P11 → P12
  // ลงขวาเข้า loop ขวาล่าง อาคาร 4 / สิริวรปัญญา ฝั่งเหนือ
  [
    [13.83726, 100.02993],
    [13.83718, 100.03022],
    [13.83677, 100.03072],
    [13.83622, 100.03111],
    [13.83604, 100.03130],
  ],

  // SEG 11: P12 → P13
  // วนด้านใต้ แล้วตัดเส้นทแยงลงตะวันตกเฉียงใต้ที่สิริวรปัญญา
  [
    [13.83604, 100.03130],
    [13.83593, 100.03141],
    [13.83583, 100.03156],
    [13.83548, 100.03119],
  ],

  // SEG 12: P13 → P14
  // กลับขึ้นเส้นทแยง แล้ววนออกฝั่งตะวันออกของ loop
  [
    [13.83548, 100.03119],
    [13.83583, 100.03156],
    [13.83551, 100.03203],
    [13.83527, 100.03183],
    [13.83524, 100.03178],
  ],

  // SEG 13: P14 → P1 (ปิดวงรอบ)
  // ขึ้นฝั่งตะวันออก ผ่านครุศาสตร์ A2 ขึ้นยอดเหนือสวนเฉลิมฯ แล้วลงแนวทแยงกลับ P1
  [
    [13.83524, 100.03178],
    [13.83527, 100.03183],
    [13.83551, 100.03203],
    [13.83583, 100.03156],
    [13.83622, 100.03111],
    [13.83677, 100.03072],
    [13.83718, 100.03022],
    [13.83739, 100.02947],
    [13.83866, 100.02828],
    [13.83805, 100.02753],
  ],
]

/**
 * เส้นทางถนนหลักสำหรับวาดบนแผนที่ (คงรูปเดิมตามที่ออกแบบไว้ ไม่ขึ้นกับลำดับจุดจอด)
 * ยอดเหนือสวนเฉลิมฯ → สี่แยกตะวันตก → loop Computer → แนวใต้หอประชุม →
 * สี่แยกตะวันออก → ครุศาสตร์ A2 → loop อาคาร 4/สิริวรปัญญา → เลียบสระน้ำ → กลับขึ้นเหนือ
 */
export const CAMPUS_ROAD_WAYPOINTS: [number, number][] = [
  // ยอดเหนือ → แนวทแยงลงสี่แยกตะวันตก
  [13.83866, 100.02828],
  [13.83791, 100.02736],
  // สี่แยกตะวันตก → วนขึ้นด้านขวาของ loop NW
  [13.83723, 100.02628],
  [13.83770, 100.02590],
  [13.83810, 100.02586],
  // ด้านบน-ซ้ายของ loop NW (อาคาร Computer)
  [13.83804, 100.02506],
  [13.83764, 100.02501],
  [13.83770, 100.02590],
  // กลับสี่แยกตะวันตก → เลียบแนวใต้หอประชุมไปตะวันออก
  [13.83723, 100.02628],
  [13.83710, 100.02611],
  [13.83687, 100.02622],
  [13.83663, 100.02661],
  [13.83639, 100.02700],
  [13.83618, 100.02737],
  // ปลายใต้หอประชุม → สี่แยกตะวันออก
  [13.83617, 100.02800],
  [13.83618, 100.02839],
  [13.83685, 100.02926],
  // สี่แยกตะวันออก → ครุศาสตร์ A2 → ลง loop ขวาล่าง
  [13.83739, 100.02947],
  [13.83718, 100.03022],
  [13.83677, 100.03072],
  // วนรอบอาคารสิริวรปัญญา ด้านขวา-ล่าง
  [13.83622, 100.03111],
  [13.83593, 100.03141],
  [13.83551, 100.03203],
  [13.83527, 100.03183],
  [13.83498, 100.03130],
  // เลียบสระน้ำฝั่งตะวันออก กลับสี่แยกตะวันออก
  [13.83507, 100.03097],
  [13.83576, 100.03076],
  [13.83612, 100.02992],
  // ปิดวง: สี่แยกตะวันออก → ครุศาสตร์ A2 → ยอดเหนือ
  [13.83685, 100.02926],
  [13.83739, 100.02947],
  [13.83866, 100.02828],
]

/**
 * เส้นตรงเชื่อมต่อเพิ่มเติม 3 เส้น (วาดทับบนแผนที่เป็นเส้นทางสีแดงเดียวกัน)
 *  1. เส้นทแยงกลางวิทยาเขต: เชื่อมแนวทแยงตะวันตก (ใกล้ P2) กับแนวใต้หอประชุม
 *  2. เส้นสั้นฝั่งตะวันออก: เชื่อมด้านเหนือของ loop ขวาล่าง (ใกล้ P12) เข้ากับแนวสระน้ำฝั่งตะวันตก
 *  3. เส้นทแยง loop ขวาล่าง: ตัดข้ามกลาง loop สิริวรปัญญา ระหว่างฝั่งตะวันออกกับฝั่งตะวันตก
 */
export const EXTRA_ROAD_SEGMENTS: [number, number][][] = [
  [
    [13.83791, 100.02736],
    [13.83632, 100.02857],
  ],
  [
    [13.83622, 100.03111],
    [13.83576, 100.03076],
  ],
  [
    [13.83583, 100.03156],
    [13.83523, 100.03092],
  ],
]

export const ROUTES: BusRoute[] = [
  {
    id: "route-1",
    name: "สาย 1: วงรอบประจำวิทยาเขต (NPRU Red Campus Loop)",
    nameEn: "Route 1: NPRU Red Campus Master Loop",
    color: "#e63462",
    stops: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
    description: "วิ่งตามเส้นทางสีแดง: แนวทแยงเหนือ → สี่แยกกลาง → เส้นทแยงกลาง → แนวใต้หอประชุม → สี่แยกตะวันตก → loop Computer → แนวใต้หอประชุม → สี่แยกตะวันออก → ครุศาสตร์ A2 → วิทยาการจัดการ → loop สิริวรปัญญา → ยอดเหนือสวนเฉลิมฯ → วนซ้ำ",
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
    currentStopIndex: 0,   // P1→P2 กำลังลงซ้ายตามแนวทแยงตะวันตก
    progress: 0.5,
    speed: 18,
    passengers: 14,
    maxCapacity: 24,
    battery: 92,
    status: "กำลังเดินทาง",
    isDwelling: false,
    dwellRemaining: 0,
    routeId: "route-1",
    currentLat: 13.83798,
    currentLng: 100.02745,
    heading: 225,
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
    currentStopIndex: 4,   // P5 จอดรับผู้โดยสาร แนวใต้ใกล้อาคารเรียนรวมนวัตกรรม
    progress: 0.0,
    speed: 0,
    passengers: 19,
    maxCapacity: 24,
    battery: 78,
    status: "จอดรับผู้โดยสาร",
    isDwelling: true,
    dwellRemaining: 60,
    routeId: "route-1",
    currentLat: 13.83697,
    currentLng: 100.02617,
    heading: 25,
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
    currentStopIndex: 6,   // P7→P8 กำลังลงด้านตะวันตกของ loop อาคาร Computer
    progress: 0.5,
    speed: 16,
    passengers: 10,
    maxCapacity: 24,
    battery: 85,
    status: "กำลังเดินทาง",
    isDwelling: false,
    dwellRemaining: 0,
    routeId: "route-1",
    currentLat: 13.83784,
    currentLng: 100.02504,
    heading: 180,
    wheelchairAccessible: true,
    acTemp: 24.0,
    lastUpdated: "เรียลไทม์ (GPS ออนไลน์)",
  },
  {
    id: 4,
    name: "NPRU EV Shuttle 04",
    code: "รถเมล์ไฟฟ้า คันที่ 4 (สายสีแดง)",
    plateNumber: "นฐ 40-1014 (นครปฐม)",
    driverName: "นายอนุชา พูลสุข",
    driverPhone: "086-778-1122",
    currentStopIndex: 10,  // P11→P12 กำลังลงขวาเข้าด้านเหนือของ loop อาคาร 4
    progress: 0.5,
    speed: 17,
    passengers: 8,
    maxCapacity: 24,
    battery: 88,
    status: "กำลังเดินทาง",
    isDwelling: false,
    dwellRemaining: 0,
    routeId: "route-1",
    currentLat: 13.83677,
    currentLng: 100.03072,
    heading: 133,
    wheelchairAccessible: true,
    acTemp: 24.5,
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
