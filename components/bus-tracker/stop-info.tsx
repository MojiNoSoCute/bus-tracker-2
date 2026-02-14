"use client"

import { stops, FACILITY_MAP } from "@/lib/bus-data"
import {
  Droplets,
  ShoppingCart,
  CreditCard,
  Coffee,
  CircleParking,
  Wifi,
  UtensilsCrossed,
  Pill,
  Store,
  Dumbbell,
  BookOpen,
  Heart,
} from "lucide-react"
import type React from "react"

const FACILITY_ICONS: Record<string, React.ElementType> = {
  toilet: Droplets,
  market: ShoppingCart,
  atm: CreditCard,
  cafe: Coffee,
  parking: CircleParking,
  wifi: Wifi,
  food: UtensilsCrossed,
  pharmacy: Pill,
  store: Store,
  gym: Dumbbell,
  library: BookOpen,
  hospital: Heart,
}

const cardColors = [
  "from-[#e63462] to-[#fe5196]",
  "from-[#e63462] to-[#fe5196]",
  "from-[#e63462] to-[#fe5196]",
  "from-[#FF9800] to-[#FFB74D]",
  "from-[#FF9800] to-[#FFB74D]",
  "from-[#FF9800] to-[#FFB74D]",
  "from-[#4CAF50] to-[#66BB6A]",
  "from-[#4CAF50] to-[#66BB6A]",
  "from-[#4CAF50] to-[#66BB6A]",
  "from-[#26C6DA] to-[#4DD0E1]",
]

export function StopInfo() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stops.map((stop, idx) => (
        <div
          key={stop.id}
          className="overflow-hidden rounded-2xl border border-border bg-card"
        >
          {/* Header */}
          <div
            className={`bg-gradient-to-r ${cardColors[idx]} flex items-center gap-3.5 px-5 py-4 text-white`}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/25 text-base font-bold">
              {stop.id}
            </span>
            <div>
              <h3 className="text-lg font-bold leading-tight">{stop.name}</h3>
              <p className="text-sm text-white/80">{stop.nameEn}</p>
            </div>
          </div>
          {/* Body */}
          <div className="space-y-5 p-5">
            <div>
              <p className="text-sm text-muted-foreground">{"รหัสจุดจอด"}</p>
              <p className="text-3xl font-bold text-foreground">P{stop.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {"สิ่งอำนวยความสะดวกใกล้เคียง"}
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {stop.facilities.map((fName) => {
                  const fac = FACILITY_MAP[fName]
                  if (!fac) return null
                  const Icon = FACILITY_ICONS[fac.icon]
                  return (
                    <span
                      key={fName}
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-white"
                      style={{ backgroundColor: fac.color }}
                    >
                      {Icon && <Icon className="h-3.5 w-3.5" />}
                      {fac.label}
                    </span>
                  )
                })}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {"ตำแหน่งพิกัดแผนที่"}
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2.5">
                <div className="rounded-lg bg-secondary/50 px-4 py-2.5 text-center">
                  <p className="text-xs text-muted-foreground">X</p>
                  <p className="text-base font-bold text-foreground">{stop.x}</p>
                </div>
                <div className="rounded-lg bg-secondary/50 px-4 py-2.5 text-center">
                  <p className="text-xs text-muted-foreground">Y</p>
                  <p className="text-base font-bold text-foreground">{stop.y}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
