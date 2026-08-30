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
  heading: number // degrees (0 = North, 90 = East, etc.)
  wheelchairAccessible: boolean
  acTemp: number // Celsius
  lastUpdated: string
}

// ===================================================================
// SECTION 2: NPRU CAMPUS CONSTANTS
// ===================================================================

export const NPRU_CENTER = {
  lat: 13.8368,
  lng: 100.0290,
  zoom: 17,
}

export const NPRU_BOUNDS: [[number, number], [number, number]] = [
  [13.8330, 100.0235], // Southwest
  [13.8408, 100.0358], // Northeast
]

/**
 * ขอบเขตรั้วมหาวิทยาลัยราชภัฏนครปฐม (NPRU Campus Perimeter Boundary)
 * วาดเส้นขอบเขตสีเขียวล้อมรอบเฉพาะพื้นที่วิทยาเขต มรภ.นครปฐม ตามเส้นขอบที่ผู้ใช้ระบุในภาพ
 */
export const NPRU_CAMPUS_POLYGON: [number, number][] = [
  // ยอดทิศเหนือ (สวนเฉลิมพระเกียรติ / สวนป่าเหนือ ติดแนว รร.ศรีวิชัยวิทยา)
  [13.84060, 100.03040],
  // แนวรั้วทิศตะวันออกเฉียงเหนือเลียบฝั่งใน ถ.มาลัยแมน (ไม่ข้ามถนน)
  [13.83980, 100.03150],
  [13.83850, 100.03320],
  [13.83720, 100.03480],
  [13.83580, 100.03650],
  [13.83480, 100.03740], // โซนตะวันออกเฉียงใต้สุดก่อนถึงแนวถนน
  // วนรอบมุมใต้ฝั่งตะวันออกเฉียงใต้ (โซน P9)
  [13.83430, 100.03700],
  [13.83400, 100.03580],
  // แนวถนนด้านใต้เลียบฝั่งใต้อาคาร 4 และลานกิจกรรม
  [13.83450, 100.03420],
  [13.83500, 100.03260],
  [13.83480, 100.03140],
  // แนวกำแพงและทางเดินด้านใต้สระน้ำ มรภ.นครปฐม
  [13.83360, 100.03050],
  [13.83350, 100.02850],
  [13.83420, 100.02650],
  // แนวกำแพงทิศตะวันตกเฉียงใต้
  [13.83500, 100.02480],
  // แนวกำแพงทิศตะวันตก (หลังอาคารเทคโนโลยีอุตสาหกรรม และกลุ่มอาคารปฏิบัติการ)
  [13.83620, 100.02400],
  [13.83750, 100.02360],
  [13.83860, 100.02360], // มุมตะวันตกเฉียงเหนือสุด
  // แนวกำแพงทิศเหนือ
  [13.83890, 100.02460],
  [13.83850, 100.02600],
  [13.83920, 100.02700],
  [13.84000, 100.02880],
  // บรรจบยอดทิศเหนือ
  [13.84060, 100.03040],
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
    lat: 13.83715,
    lng: 100.02820,
    iconName: "GraduationCap",
  },
  {
    name: "คณะครุศาสตร์ (อาคาร A2)",
    nameEn: "Faculty of Education",
    category: "academic",
    lat: 13.83760,
    lng: 100.02980,
    iconName: "Building2",
  },
  {
    name: "สวนเฉลิมพระเกียรติ / สวนป่าเหนือ",
    nameEn: "Royal Green Park",
    category: "facility",
    lat: 13.84000,
    lng: 100.02880,
    iconName: "Trees",
  },
  {
    name: "อาคารเรียนรวมและนวัตกรรม (ฝั่งตะวันตก)",
    nameEn: "West Innovation Complex",
    category: "academic",
    lat: 13.83750,
    lng: 100.02650,
    iconName: "FlaskConical",
  },
  {
    name: "อาคารเทคโนโลยีอุตสาหกรรม",
    nameEn: "Industrial Technology",
    category: "academic",
    lat: 13.83620,
    lng: 100.02550,
    iconName: "Wrench",
  },
  {
    name: "คณะวิทยาการจัดการ (อาคาร 4)",
    nameEn: "Management Sciences (Bldg 4)",
    category: "academic",
    lat: 13.83620,
    lng: 100.03350,
    iconName: "Briefcase",
  },
  {
    name: "สระน้ำ มรภ.นครปฐม",
    nameEn: "NPRU Central Lake",
    category: "facility",
    lat: 13.83540,
    lng: 100.03050,
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
 * รายชื่อจุดจอดรถเมล์ไฟฟ้าจริง 10 จุด ภายใน มรภ.นครปฐม
 */
export const stops: BusStop[] = [
  { 
    id: 1, 
    code: "P1", 
    name: "ประตู 1 (ประตูใหญ่ ถ.มาลัยแมน / หน้าสระน้ำ)", 
    nameEn: "Gate 1 (Main Gate - Malaiman Rd. & Lakefront)", 
    building: "ซุ้มประตูใหญ่ & ป้อม รปภ. กลาง",
    description: "จุดเชื่อมต่อการเดินทางหลัก รถตู้ รถสองแถว และที่จอดรถหน้ามหาวิทยาลัย",
    lat: 13.83535, 
    lng: 100.02790,
    facilities: ["ที่จอดรถยนต์/มอเตอร์ไซค์", "ห้องน้ำ", "ตู้ ATM/ธนาคาร", "Wi-Fi NPRU-Smart", "ทางลาดวีลแชร์"],
    accessible: true,
    isPopular: true
  },
  { 
    id: 2, 
    code: "P2", 
    name: "อาคารเทคโนโลยีอุตสาหกรรม (ฝั่งตะวันตก)", 
    nameEn: "Industrial Technology Building (West Wing)", 
    building: "อาคารคณะเทคโนโลยีอุตสาหกรรมและโรงประลองวิศวกรรม",
    description: "ศูนย์วิศวกรรมศาสตร์ เทคโนโลยีอุตสาหกรรม และโรงประลองเครื่องกล",
    lat: 13.83620, 
    lng: 100.02550,
    facilities: ["ห้องน้ำ", "Wi-Fi NPRU-Smart", "ทางลาดวีลแชร์", "ที่จอดรถยนต์/มอเตอร์ไซค์"],
    accessible: true
  },
  { 
    id: 3, 
    code: "P3", 
    name: "กลุ่มอาคารปฏิบัติการและนวัตกรรม (ตะวันตกสุด)", 
    nameEn: "Innovation & Labs Complex (Far West)", 
    building: "กลุ่มอาคารปฏิบัติการวิจัยและแปลงทดลอง",
    description: "ห้องปฏิบัติการวิจัย นวัตกรรมเกษตรและเทคโนโลยีสิ่งแวดล้อม",
    lat: 13.83800, 
    lng: 100.02450,
    facilities: ["ห้องน้ำ", "Wi-Fi NPRU-Smart", "จุดชาร์จ EV"],
    accessible: true
  },
  { 
    id: 4, 
    code: "P4", 
    name: "อาคารเรียนรวมฝั่งตะวันตก", 
    nameEn: "West Academic & Lecture Complex", 
    building: "อาคารเรียนรวมและศูนย์บริการวิชาการฝั่งตะวันตก",
    description: "ห้องบรรยายรวม ลานกิจกรรมวิชาการ และศูนย์บริการนิสิต",
    lat: 13.83715, 
    lng: 100.02700,
    facilities: ["ห้องน้ำ", "Wi-Fi NPRU-Smart", "ร้านกาแฟ", "ศูนย์ถ่ายเอกสาร/พิมพ์งาน"],
    accessible: true
  },
  { 
    id: 5, 
    code: "P5", 
    name: "ศูนย์ภาษาและคอมพิวเตอร์ (หอประชุมปิ่นเกลียว)", 
    nameEn: "Language & Computer Center (Pin-Kliao Hall)", 
    building: "อาคารศูนย์ภาษาฯ และหอประชุมใหญ่",
    description: "สถานที่จัดพิธีพระราชทานปริญญาบัตร ศูนย์สอบไอที และห้องปฏิบัติการคอมพิวเตอร์",
    lat: 13.83715, 
    lng: 100.02820,
    facilities: ["ห้องน้ำ", "ร้านกาแฟ", "Wi-Fi NPRU-Smart", "ตู้ ATM/ธนาคาร", "ทางลาดวีลแชร์"],
    accessible: true,
    isPopular: true
  },
  { 
    id: 6, 
    code: "P6", 
    name: "สวนเฉลิมพระเกียรติ / ลานกิจกรรมเหนือ", 
    nameEn: "Royal Green Park & North Activity Zone", 
    building: "สวนพฤกษศาสตร์เฉลิมพระเกียรติและลานสุขภาพ",
    description: "พื้นที่สีเขียวพักผ่อน ลานออกกำลังกายกลางแจ้ง และจุดเชื่อมต่อโซนเหนือ",
    lat: 13.84000, 
    lng: 100.02880,
    facilities: ["ห้องน้ำ", "Wi-Fi NPRU-Smart", "ร้านสะดวกซื้อ/ตู้กดเครื่องดื่ม"],
    accessible: true
  },
  { 
    id: 7, 
    code: "P7", 
    name: "คณะครุศาสตร์ (อาคาร A2 / อาคาร 1)", 
    nameEn: "Faculty of Education (Building A2)", 
    building: "อาคารเรียน A2 และสำนักงานคณบดีครุศาสตร์",
    description: "ศูนย์การเรียนรู้วิชาชีพครู ลานกิจกรรมวิชาการ และห้องปฏิบัติการสอน",
    lat: 13.83760, 
    lng: 100.02980,
    facilities: ["ห้องน้ำ", "ร้านกาแฟ", "Wi-Fi NPRU-Smart", "ศูนย์ถ่ายเอกสาร/พิมพ์งาน"],
    accessible: true,
    isPopular: true
  },
  { 
    id: 8, 
    code: "P8", 
    name: "คณะวิทยาการจัดการ & กองบริการการศึกษา (อาคาร 4)", 
    nameEn: "Faculty of Management Sciences (Building 4)", 
    building: "อาคารเฉลิมพระเกียรติ 50 พรรษา / อาคาร 4",
    description: "สำนักงานทะเบียนและประมวลผล กองพัฒนานักศึกษา ห้องประชุมบัณฑิต และคณะวิทยาการจัดการ",
    lat: 13.83620, 
    lng: 100.03350,
    facilities: ["ตู้ ATM/ธนาคาร", "ห้องน้ำ", "Wi-Fi NPRU-Smart", "จุดชาร์จ EV", "ทางลาดวีลแชร์"],
    accessible: true,
    isPopular: true
  },
  { 
    id: 9, 
    code: "P9", 
    name: "อาคารเรียนรวมตะวันออกเฉียงใต้ / ลานจอดรถใต้", 
    nameEn: "Southeast Academic Hall & South Parking", 
    building: "อาคารเรียนรวมและศูนย์อาหารย่อยฝั่งใต้",
    description: "ห้องบรรยายพิเศษ ลานจอดรถยนต์ และทางเชื่อมต่อกลุ่มอาคารริมน้ำ",
    lat: 13.83440, 
    lng: 100.03600,
    facilities: ["ที่จอดรถยนต์/มอเตอร์ไซค์", "ห้องน้ำ", "7-Eleven/ร้านสะดวกซื้อ", "Wi-Fi NPRU-Smart"],
    accessible: true
  },
  { 
    id: 10, 
    code: "P10", 
    name: "ริมสระน้ำ มรภ.นครปฐม (จุดชมทัศนียภาพ & นันทนาการ)", 
    nameEn: "NPRU Central Lakefront Promenade", 
    building: "ลานกิจกรรมริมสระน้ำกลางมหาวิทยาลัย",
    description: "จุดพักผ่อนริมน้ำ ลานดนตรี และทางเดินเพื่อสุขภาพรอบสระน้ำ",
    lat: 13.83550, 
    lng: 100.03150,
    facilities: ["Wi-Fi NPRU-Smart", "ร้านกาแฟ", "ทางลาดวีลแชร์", "ห้องน้ำ"],
    accessible: true,
    isPopular: true
  },
]

/**
 * เส้นทางถนนจริงรอบมหาวิทยาลัยราชภัฏนครปฐม (วิ่งเฉพาะถนนภายในวิทยาเขต 100%)
 * แบ่งเป็นเส้นทางย่อยระหว่างจุดจอด P1 -> P2 -> ... -> P10 -> P1 ตามแนวถนนจริงภายในมหาวิทยาลัย
 */
export const STOP_SEGMENTS: [number, number][][] = [
  // 0: P1 (ประตู 1 หน้าสระน้ำ) -> P2 (อาคารเทคโนโลยีอุตสาหกรรม ฝั่งตะวันตก)
  [
    [13.83535, 100.02790],
    [13.83550, 100.02730],
    [13.83570, 100.02670],
    [13.83600, 100.02600],
    [13.83620, 100.02550],
  ],
  // 1: P2 (อาคารเทคโนโลยีอุตสาหกรรม) -> P3 (กลุ่มอาคารปฏิบัติการ ตะวันตกสุด)
  [
    [13.83620, 100.02550],
    [13.83640, 100.02500],
    [13.83700, 100.02460],
    [13.83750, 100.02440],
    [13.83800, 100.02450],
  ],
  // 2: P3 (มุมตะวันตกเฉียงเหนือ) -> P4 (อาคารเรียนรวมฝั่งตะวันตก)
  [
    [13.83800, 100.02450],
    [13.83810, 100.02520],
    [13.83805, 100.02600],
    [13.83760, 100.02620],
    [13.83730, 100.02650],
    [13.83715, 100.02700],
  ],
  // 3: P4 (อาคารเรียนรวมตะวันตก) -> P5 (หอประชุมปิ่นเกลียว)
  [
    [13.83715, 100.02700],
    [13.83710, 100.02760],
    [13.83715, 100.02820],
  ],
  // 4: P5 (หอประชุมปิ่นเกลียว) -> P6 (สวนเฉลิมพระเกียรติ / โค้งเหนือสุด)
  [
    [13.83715, 100.02820],
    [13.83840, 100.02840],
    [13.83940, 100.02860],
    [13.84000, 100.02880],
  ],
  // 5: P6 (โค้งเหนือสุด) -> P7 (คณะครุศาสตร์ อาคาร A2)
  [
    [13.84000, 100.02880],
    [13.83920, 100.02920],
    [13.83840, 100.02950],
    [13.83760, 100.02980],
  ],
  // 6: P7 (คณะครุศาสตร์) -> P8 (คณะวิทยาการจัดการ / อาคาร 4)
  [
    [13.83760, 100.02980],
    [13.83720, 100.03100],
    [13.83670, 100.03220],
    [13.83620, 100.03350],
  ],
  // 7: P8 (คณะวิทยาการจัดการ) -> P9 (อาคารเรียนรวมตะวันออกเฉียงใต้ / ใต้สุด)
  [
    [13.83620, 100.03350],
    [13.83550, 100.03480],
    [13.83490, 100.03560],
    [13.83440, 100.03600],
  ],
  // 8: P9 (อาคารฝั่งใต้) -> P10 (ริมสระน้ำ มรภ.นครปฐม)
  [
    [13.83440, 100.03600],
    [13.83460, 100.03450],
    [13.83500, 100.03300],
    [13.83550, 100.03150],
  ],
  // 9: P10 (ริมสระน้ำ) -> P1 (ประตู 1 หน้า ถ.มาลัยแมน)
  [
    [13.83550, 100.03150],
    [13.83570, 100.03000],
    [13.83550, 100.02880],
    [13.83535, 100.02790],
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
    name: "สาย 1: วงรอบภายในวิทยาเขต (NPRU Red Campus Loop)",
    nameEn: "Route 1: NPRU Main Red Campus Loop (100% Inside Campus)",
    color: "#e63462",
    stops: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    description: "วิ่งเฉพาะถนนภายใน มรภ.นครปฐม ผ่านอาคารฝั่งตะวันตก หอประชุมปิ่นเกลียว สวนเฉลิมพระเกียรติ คณะครุศาสตร์ อาคาร 4 และริมสระน้ำ",
  },
  {
    id: "route-2",
    name: "สาย 2: ด่วนปิ่นเกลียว-วิทยาการจัดการ-ประตู 1 (Campus Express)",
    nameEn: "Route 2: Pin-Kliao - Management - Gate 1 Express",
    color: "#e63462",
    stops: [1, 2, 5, 7, 8, 10],
    description: "สายด่วนเชื่อมต่ออาคารหลัก หอประชุมปิ่นเกลียว คณะครุศาสตร์ และประตู 1",
  }
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
    currentStopIndex: 0, // ประตู 1
    progress: 0.2, 
    speed: 18, 
    passengers: 14, 
    maxCapacity: 24,
    battery: 92, 
    status: "กำลังเดินทาง", 
    isDwelling: false, 
    dwellRemaining: 0,
    routeId: "route-1",
    currentLat: 13.83550,
    currentLng: 100.02730,
    heading: 280,
    wheelchairAccessible: true,
    acTemp: 24,
    lastUpdated: "เรียลไทม์ (GPS ออนไลน์)"
  },
  { 
    id: 2, 
    name: "NPRU EV Shuttle 02", 
    code: "รถเมล์ไฟฟ้า คันที่ 2 (สายสีแดง)", 
    plateNumber: "นฐ 40-1012 (นครปฐม)",
    driverName: "นายประสิทธิ์ บุญมี",
    driverPhone: "089-223-4455",
    currentStopIndex: 4, // หอประชุมปิ่นเกลียว
    progress: 0.5, 
    speed: 20, 
    passengers: 19, 
    maxCapacity: 24,
    battery: 78, 
    status: "กำลังเดินทาง", 
    isDwelling: false, 
    dwellRemaining: 0,
    routeId: "route-1",
    currentLat: 13.83840,
    currentLng: 100.02840,
    heading: 45,
    wheelchairAccessible: true,
    acTemp: 23.5,
    lastUpdated: "เรียลไทม์ (GPS ออนไลน์)"
  },
  { 
    id: 3, 
    name: "NPRU EV Shuttle 03", 
    code: "รถเมล์ไฟฟ้า คันที่ 3 (สายสีแดง)", 
    plateNumber: "นฐ 40-1013 (นครปฐม)",
    driverName: "นายวิชาญ ใจมั่น",
    driverPhone: "084-556-9911",
    currentStopIndex: 7, // คณะวิทยาการจัดการ
    progress: 0.0, 
    speed: 0, 
    passengers: 10, 
    maxCapacity: 24,
    battery: 85, 
    status: "จอดรับผู้โดยสาร", 
    isDwelling: true, 
    dwellRemaining: 45,
    routeId: "route-1",
    currentLat: 13.83620,
    currentLng: 100.03350,
    heading: 140,
    wheelchairAccessible: true,
    acTemp: 24.0,
    lastUpdated: "เรียลไทม์ (GPS ออนไลน์)"
  }
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
