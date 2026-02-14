import { Globe } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-card py-6">
      <div className="mx-auto max-w-7xl px-4 text-center lg:px-6">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Globe className="h-4 w-4" />
          <span>{"© 2026 มหาวิทยาลัยราชภัฏนครปฐม | ระบบติดตามรถเมล์ไฟฟ้า"}</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground/70">
          {"ข้อมูลในระบบเป็นข้อมูลเบื้องต้นสำหรับการเดินทาง · เส้นทางอาจมีการเปลี่ยนแปลงตามสภาพจราจร · 3 คันให้บริการ"}
        </p>
      </div>
    </footer>
  )
}
