"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  LayoutDashboard,
  BarChart3,
  Settings,
  Users,
  FolderKanban,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
}

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/chart", label: "Analytics", icon: BarChart3 },
  { href: "#", label: "Projects", icon: FolderKanban },
  { href: "/team", label: "Team", icon: Users },
]

const bottomNavItems = [
  { href: "#", label: "Settings", icon: Settings },
]

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border bg-card text-card-foreground transition-all duration-300 ease-in-out shadow-sm",
          isCollapsed ? "w-[72px]" : "w-64"
        )}
      >
        {/* Header / Logo */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border/50 px-4">
          <div
            className={cn(
              "flex items-center gap-2 overflow-hidden transition-all duration-300",
              isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
            )}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <FolderKanban className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight whitespace-nowrap">
              TaskFlow
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className={cn(
              "h-8 w-8 shrink-0 rounded-full bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors",
              isCollapsed && "mx-auto"
            )}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle Sidebar</span>
          </Button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-6 px-3 scrollbar-none">
          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              
              const navLink = (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    isCollapsed ? "justify-center" : "justify-start gap-3"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5 shrink-0 transition-colors duration-200",
                      isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  {!isCollapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                </Link>
              )

              if (isCollapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>{navLink}</TooltipTrigger>
                    <TooltipContent side="right" sideOffset={12} className="font-medium">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                )
              }

              return navLink
            })}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="mt-auto shrink-0 border-t border-border/50 p-3">
          <nav className="flex flex-col gap-1.5 mb-4">
            {bottomNavItems.map((item) => {
              const navLink = (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200 text-muted-foreground hover:bg-muted hover:text-foreground",
                    isCollapsed ? "justify-center" : "justify-start gap-3"
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </Link>
              )

              if (isCollapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>{navLink}</TooltipTrigger>
                    <TooltipContent side="right" sideOffset={12} className="font-medium">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                )
              }

              return navLink
            })}
          </nav>

          {/* User Profile */}
          <div
            className={cn(
              "flex items-center rounded-lg bg-muted/40 p-2 transition-all duration-300 hover:bg-muted/80 cursor-pointer",
              isCollapsed ? "justify-center" : "gap-3"
            )}
          >
            <Avatar className="h-9 w-9 border border-border/50 shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary">AD</AvatarFallback>
            </Avatar>
            
            {!isCollapsed && (
              <div className="flex flex-1 flex-col overflow-hidden">
                <span className="truncate text-sm font-semibold leading-tight">Admin User</span>
                <span className="truncate text-xs text-muted-foreground">admin@taskflow.app</span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </TooltipProvider>
  )
}
