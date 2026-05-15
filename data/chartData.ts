export interface ChartDataPoint {
  hour: string
  orange: number // -100 to 100 scale
  green: number  // 0-100 scale
  blue: number   // 0-10 scale
}

// Generate mock data for 24 hours
export function generateChartData(): ChartDataPoint[] {
  const data: ChartDataPoint[] = []
  
  for (let i = 0; i < 24; i++) {
    const hour = i.toString().padStart(2, "0") + ":00"
    
    // Orange: -100 to 100 scale - simulating net change or sentiment
    const orange = Math.round(Math.cos(i / 5) * 60 + Math.random() * 40 - 20)
    
    // Green: 0-100 scale - simulating percentage or performance
    const green = Math.round(50 + Math.sin(i / 3) * 30 + Math.random() * 20)
    
    // Blue: 0-10 scale - simulating small rating or metric
    const blue = Math.round((5 + Math.sin(i / 4) * 3 + Math.random() * 2) * 10) / 10
    
    data.push({
      hour,
      orange: Math.max(-100, Math.min(100, orange)),
      green: Math.max(0, Math.min(100, green)),
      blue: Math.max(0, Math.min(10, blue)),
    })
  }
  
  return data
}

export const mockChartData = generateChartData()
