# Bus Tracker - ระบบติดตามรถบัสมหาวิทยาลัย

ระบบติดตามรถบัสแบบ Real-time สำหรับมหาวิทยาลัย พัฒนาด้วย Next.js 15 และ TypeScript

---

## สารบัญ

- [ภาพรวมโปรเจค](#ภาพรวมโปรเจค)
- [เทคโนโลยีที่ใช้](#เทคโนโลยีที่ใช้)
- [โครงสร้างโปรเจค](#โครงสร้างโปรเจค)
- [การติดตั้ง](#การติดตั้ง)
- [คำอธิบาย Components](#คำอธิบาย-components)
- [Data Flow](#data-flow)
- [การพัฒนาต่อยอด](#การพัฒนาต่อยอด)

---

## ภาพรวมโปรเจค

Bus Tracker เป็นเว็บแอปพลิเคชันสำหรับติดตามตำแหน่งรถบัสภายในมหาวิทยาลัย โดยมีฟีเจอร์หลักดังนี้:

### ฟีเจอร์หลัก

| ฟีเจอร์ | คำอธิบาย |
|---------|----------|
| **Live Tracking** | แสดงตำแหน่งรถบัสแบบ Real-time บนแผนที่ พร้อม animation การเคลื่อนที่ |
| **Schedule** | แสดงตารางเวลาเดินรถของแต่ละสาย |
| **Stop Info** | ข้อมูลป้ายรถเมล์ รวมถึงสิ่งอำนวยความสะดวก |
| **Report Problem** | ฟอร์มแจ้งปัญหาสำหรับผู้ใช้งาน |

---

## เทคโนโลยีที่ใช้

### Frontend Framework
- **Next.js 15** - React Framework พร้อม App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS Framework

### UI Components
- **shadcn/ui** - Component Library ที่ใช้ Radix UI เป็นฐาน
- **Lucide React** - Icon Library

### State Management
- **React Hooks** - useState, useEffect, useCallback สำหรับจัดการ state

### Animation
- **CSS Transitions** - สำหรับ smooth animations
- **setInterval** - สำหรับ simulation การเคลื่อนที่ของรถบัส

---

## โครงสร้างโปรเจค

```
bus-tracker-2/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root Layout - กำหนด fonts, metadata, viewport
│   ├── page.tsx                  # หน้าหลัก - รวม components ทั้งหมด
│   └── globals.css               # Global styles และ CSS variables
│
├── components/
│   ├── bus-tracker/              # Components หลักของแอป
│   │   ├── header.tsx            # Header - โลโก้, navigation tabs
│   │   ├── footer.tsx            # Footer - credits, social links
│   │   ├── live-tracking.tsx     # แสดงแผนที่และติดตามรถบัส real-time
│   │   ├── schedule.tsx          # ตารางเวลาเดินรถ
│   │   ├── stop-info.tsx         # ข้อมูลป้ายรถเมล์
│   │   └── report-problem.tsx    # ฟอร์มแจ้งปัญหา
│   │
│   └── ui/                       # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── tabs.tsx
│       └── ...
│
├── lib/
│   ├── bus-data.ts               # ข้อมูลรถบัส, สาย, ป้าย (Mock Data)
│   └── utils.ts                  # Utility functions (cn helper)
│
└── public/                       # Static assets
```

---

## การติดตั้ง

### ความต้องการของระบบ
- Node.js 18.x หรือใหม่กว่า
- npm, yarn, pnpm หรือ bun

### ขั้นตอนการติดตั้ง

```bash
# 1. Clone repository
git clone https://github.com/MojiNoSoCute/bus-tracker-2.git
cd bus-tracker-2

# 2. ติดตั้ง dependencies
pnpm install

# 3. รัน development server
pnpm dev

# 4. เปิดเบราว์เซอร์ไปที่
# http://localhost:3000
```

### Scripts ที่มี

| Script | คำอธิบาย |
|--------|----------|
| `pnpm dev` | รัน development server พร้อม hot reload |
| `pnpm build` | Build สำหรับ production |
| `pnpm start` | รัน production server |
| `pnpm lint` | ตรวจสอบ code ด้วย ESLint |

---

## คำอธิบาย Components

### 1. Header (`header.tsx`)

**หน้าที่:** แสดงโลโก้และ navigation tabs

```
┌─────────────────────────────────────────────┐
│  🚌 Bus Tracker              [Tabs...]      │
│     มหาวิทยาลัย                              │
└─────────────────────────────────────────────┘
```

**Props:**
- `activeTab: string` - tab ที่กำลังแสดงอยู่
- `onTabChange: (tab: string) => void` - callback เมื่อเปลี่ยน tab

**การทำงาน:**
- ใช้ `TabsList` จาก shadcn/ui สำหรับ navigation
- Responsive design - แสดงเป็น scroll บนมือถือ

---

### 2. Live Tracking (`live-tracking.tsx`)

**หน้าที่:** แสดงแผนที่และติดตามตำแหน่งรถบัส real-time

```
┌─────────────────────────────────────────────┐
│  ┌─────────────────────────────────────┐    │
│  │           Route Map                 │    │
│  │    ○──────●──────○──────○           │    │
│  │           🚌                        │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  [Bus Card 1] [Bus Card 2] [Bus Card 3]     │
│                                             │
│  Stop Timeline                              │
│  ├─ Stop 1 (arrived)                        │
│  ├─ Stop 2 (current)                        │
│  └─ Stop 3 (upcoming)                       │
└─────────────────────────────────────────────┘
```

**State ที่ใช้:**
| State | Type | คำอธิบาย |
|-------|------|----------|
| `selectedRoute` | `string` | สายรถที่เลือก |
| `selectedBus` | `string \| null` | รถคันที่เลือก |
| `busPositions` | `Map<string, number>` | ตำแหน่งรถแต่ละคัน (0-100%) |
| `currentStopIndices` | `Map<string, number>` | index ของป้ายปัจจุบัน |

**Algorithm การจำลองการเคลื่อนที่:**
```
1. ทุก 100ms: เพิ่มตำแหน่ง += ความเร็ว
2. ถ้าตำแหน่ง >= 100: วนกลับเป็น 0 (รอบใหม่)
3. คำนวณ currentStopIndex จากตำแหน่ง
4. อัพเดท SVG position ด้วย CSS transition
```

**Sub-components:**
- `RouteMap` - แสดงแผนที่เส้นทางและตำแหน่งรถ
- `BusCard` - การ์ดแสดงข้อมูลรถแต่ละคัน
- `StopTimeline` - timeline แสดงป้ายที่ผ่านมาและกำลังจะถึง

---

### 3. Schedule (`schedule.tsx`)

**หน้าที่:** แสดงตารางเวลาเดินรถ

```
┌─────────────────────────────────────────────┐
│  ตารางเวลาเดินรถ                             │
│  ┌─────────────────────────────────────┐    │
│  │ เวลา    │ สาย 1  │ สาย 2  │ สาย 3  │    │
│  │ 07:00   │   ✓    │   ✓    │   -    │    │
│  │ 07:30   │   ✓    │   -    │   ✓    │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  [รอบแรก: 07:00] [รอบสุดท้าย: 19:00]        │
└─────────────────────────────────────────────┘
```

**ข้อมูลที่แสดง:**
- ตารางเวลาทุกรอบของแต่ละสาย
- เวลารอบแรกและรอบสุดท้าย
- ความถี่ในการเดินรถ

---

### 4. Stop Info (`stop-info.tsx`)

**หน้าที่:** แสดงข้อมูลป้ายรถเมล์

```
┌─────────────────────────────────────────────┐
│  [Dropdown เลือกป้าย]                        │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │  📍 หน้าตึก A                        │    │
│  │  สายที่ผ่าน: 1, 2                    │    │
│  │  สิ่งอำนวยความสะดวก: 🪑 ☂️ 💡        │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

**Constants:**
- `FACILITY_ICONS` - mapping icon สำหรับสิ่งอำนวยความสะดวก
- `cardColors` - สีพื้นหลังการ์ดแต่ละป้าย

---

### 5. Report Problem (`report-problem.tsx`)

**หน้าที่:** ฟอร์มแจ้งปัญหา

```
┌─────────────────────────────────────────────┐
│  แจ้งปัญหา                                   │
│                                             │
│  ประเภทปัญหา: [Dropdown]                     │
│  สายรถ: [Dropdown]                          │
│  รายละเอียด: [Textarea]                      │
│                                             │
│  [ส่งรายงาน]                                 │
└─────────────────────────────────────────────┘
```

**State Flow:**
```
1. User กรอกฟอร์ม
2. Validation ตรวจสอบข้อมูล
3. Submit -> แสดง loading
4. สำเร็จ -> แสดง success message
5. Reset ฟอร์มหลัง 3 วินาที
```

**Validation Rules:**
- ต้องเลือกประเภทปัญหา
- ต้องกรอกรายละเอียด (ยกเว้นปัญหาทั่วไป)

---

### 6. Footer (`footer.tsx`)

**หน้าที่:** แสดง credits และ social links

---

## Data Flow

### ภาพรวม Data Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  bus-data.ts │────▶│   page.tsx   │────▶│  Components  │
│  (Mock Data) │     │  (Container) │     │   (Views)    │
└──────────────┘     └──────────────┘     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │    State     │
                     │  Management  │
                     └──────────────┘
```

### ข้อมูลใน `bus-data.ts`

| Export | Type | คำอธิบาย |
|--------|------|----------|
| `busRoutes` | `BusRoute[]` | ข้อมูลสายรถทั้งหมด |
| `buses` | `Bus[]` | ข้อมูลรถแต่ละคัน |
| `stops` | `Stop[]` | ข้อมูลป้ายรถเมล์ |
| `schedules` | `Schedule[]` | ตารางเวลาเดินรถ |

### State ใน `page.tsx`

```typescript
// Tab ที่กำลังแสดง
const [activeTab, setActiveTab] = useState("live")

// ส่งต่อไปยัง Header และ Content components
<Header activeTab={activeTab} onTabChange={setActiveTab} />
```

---

## การพัฒนาต่อยอด

### แนวทางการพัฒนาเพิ่มเติม

1. **เชื่อมต่อ Backend จริง**
   - เปลี่ยนจาก Mock Data เป็น API calls
   - ใช้ WebSocket สำหรับ real-time updates

2. **เพิ่ม GPS Tracking**
   - ติดตั้ง GPS บนรถบัส
   - ส่งข้อมูลตำแหน่งมาที่ server

3. **Push Notifications**
   - แจ้งเตือนเมื่อรถใกล้ถึงป้าย
   - แจ้งเตือนการเปลี่ยนแปลงตารางเวลา

4. **User Authentication**
   - ระบบ login สำหรับผู้ใช้
   - บันทึกป้ายโปรด

5. **Admin Dashboard**
   - จัดการข้อมูลรถและเส้นทาง
   - ดูรายงานปัญหาจากผู้ใช้

---

## License

MIT License - สามารถนำไปใช้และดัดแปลงได้อย่างอิสระ

---

## ผู้พัฒนา

พัฒนาโดย MojiNoSoCute

สำหรับโปรเจคมหาวิทยาลัย
