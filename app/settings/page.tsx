"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout/Sidebar"
import { DarkModeToggle } from "@/components/layout/DarkModeToggle"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { cn } from "@/lib/utils"

export default function SettingsPage() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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
          "flex min-h-screen flex-col transition-all duration-300",
          isCollapsed ? "md:ml-[72px]" : "md:ml-64"
        )}
      >
        <div className="p-4 md:p-6 lg:p-8 flex-1 flex flex-col">
          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between shrink-0">
            <div className="ml-12 md:ml-0">
              <h1 className="text-2xl font-bold text-foreground">Settings</h1>
              <p className="text-sm text-muted-foreground">
                Manage your account preferences and application settings.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <DarkModeToggle />
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-border rounded-lg bg-muted/10 min-h-[400px]">
            <div className="text-center">
              <p className="text-2xl font-semibold text-muted-foreground mb-2">Coming Soon</p>
              <p className="text-muted-foreground">This feature is currently under development.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
