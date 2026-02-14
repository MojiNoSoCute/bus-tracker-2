"use client"

import { useState } from "react"
import { Header } from "@/components/bus-tracker/header"
import { Footer } from "@/components/bus-tracker/footer"
import { LiveTracking } from "@/components/bus-tracker/live-tracking"
import { Schedule } from "@/components/bus-tracker/schedule"
import { StopInfo } from "@/components/bus-tracker/stop-info"
import { ReportProblem } from "@/components/bus-tracker/report-problem"

export default function Page() {
  const [activeTab, setActiveTab] = useState("tracking")

  return (
    <div className="flex min-h-screen flex-col">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 lg:px-6">
        {activeTab === "tracking" && <LiveTracking />}
        {activeTab === "schedule" && <Schedule />}
        {activeTab === "stops" && <StopInfo />}
        {activeTab === "report" && <ReportProblem />}
      </main>
      <Footer />
    </div>
  )
}
