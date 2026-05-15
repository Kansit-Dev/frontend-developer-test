"use client"

import { useState, useRef, useCallback } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
import { toPng } from "html-to-image"
import jsPDF from "jspdf"
import { Sidebar } from "@/components/layout/Sidebar"
import { DarkModeToggle } from "@/components/layout/DarkModeToggle"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { mockChartData, generateChartData } from "@/data/chartData"
import { cn } from "@/lib/utils"
import { Download, Menu, RefreshCw } from "lucide-react"

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    dataKey: string
    value: number
    color: string
    name: string
  }>
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null

  return (
    <div className="rounded-lg border border-border bg-white p-3 shadow-lg dark:bg-zinc-900">
      <p className="mb-2 font-semibold text-zinc-900 dark:text-zinc-100">{label}</p>
      <div className="space-y-1">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-zinc-600 dark:text-zinc-400">{entry.name}:</span>
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {entry.value.toFixed(entry.dataKey === "green" ? 1 : 0)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

interface LegendPayloadItem {
  value: string
  type: string
  id?: string
  color?: string
  dataKey?: string
}

interface CustomLegendProps {
  payload?: LegendPayloadItem[]
  visibleLines: Record<string, boolean>
  onToggle: (key: string) => void
}

function CustomLegend({ payload, visibleLines, onToggle }: CustomLegendProps) {
  if (!payload) return null

  return (
    <div className="flex flex-wrap justify-center gap-4 pt-4">
      {payload.map((entry) => {
        const key = entry.dataKey as string
        const isVisible = visibleLines[key]
        return (
          <button
            key={key}
            onClick={() => onToggle(key)}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
              isVisible
                ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                : "bg-zinc-50 text-zinc-400 line-through opacity-60 dark:bg-zinc-900 dark:text-zinc-500"
            )}
          >
            <div
              className="h-3 w-3 rounded-full"
              style={{
                backgroundColor: entry.color,
                opacity: isVisible ? 1 : 0.4,
              }}
            />
            {entry.value}
          </button>
        )
      })}
    </div>
  )
}

export default function ChartPage() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [chartData, setChartData] = useState(mockChartData)
  const [isExporting, setIsExporting] = useState(false)
  const [visibleLines, setVisibleLines] = useState({
    green: true,
    orange: true,
    blue: true,
  })
  
  const chartRef = useRef<HTMLDivElement>(null)

  const handleToggleLine = (key: string) => {
    setVisibleLines((prev) => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }))
  }

  const handleRefreshData = () => {
    setChartData(generateChartData())
  }

  const handleExportPDF = useCallback(async () => {
    if (!chartRef.current) return
    
    setIsExporting(true)
    
    try {
      const dataUrl = await toPng(chartRef.current, {
        cacheBust: true,
        backgroundColor: "#ffffff",
        pixelRatio: 2,
      })
      
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      })
      
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      
      // Add title
      pdf.setFontSize(16)
      pdf.text("Daily Analytics Chart", 14, 15)
      pdf.setFontSize(10)
      pdf.text(`Generated: ${new Date().toLocaleString()}`, 14, 22)
      
      // Calculate image dimensions
      const imgWidth = pdfWidth - 28
      const imgHeight = (pdfHeight - 40) * 0.8
      const imgX = 14
      const imgY = 30
      
      pdf.addImage(dataUrl, "PNG", imgX, imgY, imgWidth, imgHeight)
      pdf.save("daily-chart.pdf")
    } catch (error) {
      console.error("Error exporting PDF:", error)
      alert("Failed to export PDF. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Menu Button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed left-4 top-4 z-50 md:hidden"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <Menu className="h-4 w-4" />
      </Button>

      {/* Sidebar - Desktop */}
      <div className="hidden md:block">
        <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
      </div>

      {/* Sidebar - Mobile */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/50 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed left-0 top-0 z-40 md:hidden">
            <Sidebar isCollapsed={false} onToggle={() => setIsMobileMenuOpen(false)} />
          </div>
        </>
      )}

      {/* Main Content */}
      <main
        className={cn(
          "min-h-screen transition-all duration-300",
          isCollapsed ? "md:ml-[72px]" : "md:ml-64"
        )}
      >
        <div className="p-4 md:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="ml-12 md:ml-0">
              <h1 className="text-2xl font-bold text-foreground">Daily Analytics</h1>
              <p className="text-sm text-muted-foreground">
                24-hour performance metrics with multi-scale visualization
              </p>
            </div>
            <div className="flex items-center gap-2">
              <DarkModeToggle />
              <Button variant="outline" onClick={handleRefreshData}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Button onClick={handleExportPDF} disabled={isExporting}>
                <Download className="mr-2 h-4 w-4" />
                {isExporting ? "Exporting..." : "Export PDF"}
              </Button>
            </div>
          </div>

          {/* Chart Card */}
          <Card>
            <CardHeader>
              <CardTitle>Hourly Performance Chart</CardTitle>
            </CardHeader>
            <CardContent>
              <div ref={chartRef} className="rounded-lg bg-white p-6 dark:bg-zinc-900">
                <ResponsiveContainer width="100%" height={450}>
                  <LineChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="hour"
                      tick={{ fontSize: 11, fill: "#6b7280" }}
                      axisLine={{ stroke: "#d1d5db" }}
                      tickLine={{ stroke: "#d1d5db" }}
                    />
                    
                    {/* Orange Y-Axis: -100 to 100 (Left - First/Outermost) */}
                    <YAxis
                      yAxisId="orange"
                      orientation="left"
                      domain={[-100, 100]}
                      ticks={[-100, -50, 0, 50, 100]}
                      tick={{ fontSize: 10, fill: "#f97316", fontWeight: 500 }}
                      axisLine={{ stroke: "#f97316", strokeWidth: 1.5 }}
                      tickLine={{ stroke: "#f97316" }}
                      width={38}
                    />
                    
                    {/* Green Y-Axis: 0-100 (Left - Second/Middle) */}
                    <YAxis
                      yAxisId="green"
                      orientation="left"
                      domain={[0, 100]}
                      ticks={[0, 25, 50, 75, 100]}
                      tick={{ fontSize: 10, fill: "#22c55e", fontWeight: 500 }}
                      axisLine={{ stroke: "#22c55e", strokeWidth: 1.5 }}
                      tickLine={{ stroke: "#22c55e" }}
                      width={32}
                    />
                    
                    {/* Blue Y-Axis: 0-10 (Left - Third/Innermost) */}
                    <YAxis
                      yAxisId="blue"
                      orientation="left"
                      domain={[0, 10]}
                      ticks={[0, 2, 4, 6, 8, 10]}
                      tick={{ fontSize: 10, fill: "#3b82f6", fontWeight: 500 }}
                      axisLine={{ stroke: "#3b82f6", strokeWidth: 1.5 }}
                      tickLine={{ stroke: "#3b82f6" }}
                      width={28}
                    />

                    {/* Reference line at 0 for orange axis */}
                    <ReferenceLine yAxisId="orange" y={0} stroke="#f97316" strokeDasharray="3 3" strokeOpacity={0.3} />

                    <Tooltip 
                      content={<CustomTooltip />} 
                      cursor={{ stroke: "#94a3b8", strokeWidth: 1, strokeDasharray: "4 4" }}
                    />
                    <Legend
                      content={
                        <CustomLegend
                          visibleLines={visibleLines}
                          onToggle={handleToggleLine}
                        />
                      }
                    />

                    <Line
                      yAxisId="orange"
                      type="monotone"
                      dataKey="orange"
                      name="Orange (-100 to 100)"
                      stroke="#f97316"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6, strokeWidth: 2 }}
                      hide={!visibleLines.orange}
                    />
                    
                    <Line
                      yAxisId="green"
                      type="monotone"
                      dataKey="green"
                      name="Green (0-100)"
                      stroke="#22c55e"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6, strokeWidth: 2 }}
                      hide={!visibleLines.green}
                    />
                    
                    <Line
                      yAxisId="blue"
                      type="monotone"
                      dataKey="blue"
                      name="Blue (0-10)"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6, strokeWidth: 2 }}
                      hide={!visibleLines.blue}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Scale Legend */}
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="flex items-center gap-3 rounded-lg border border-orange-200 bg-orange-50 p-3 dark:border-orange-900 dark:bg-orange-950">
                  <div className="h-4 w-4 rounded-full bg-orange-500" />
                  <div>
                    <p className="text-sm font-medium text-orange-700 dark:text-orange-300">
                      Orange Line
                    </p>
                    <p className="text-xs text-orange-600 dark:text-orange-400">
                      Scale: -100 to 100
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900 dark:bg-emerald-950">
                  <div className="h-4 w-4 rounded-full bg-emerald-500" />
                  <div>
                    <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                      Green Line
                    </p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">
                      Scale: 0 to 100
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950">
                  <div className="h-4 w-4 rounded-full bg-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      Blue Line
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      Scale: 0 to 10
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>How to Use</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <ul className="list-inside list-disc space-y-1">
                <li>Hover over the chart to see detailed values at each hour</li>
                <li>Click on the legend labels below the chart to toggle each line visibility</li>
                <li>Use the &quot;Refresh&quot; button to generate new random data</li>
                <li>Click &quot;Export PDF&quot; to download the chart as a PDF document</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
