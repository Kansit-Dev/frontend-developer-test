"use client"

import { useState, useMemo } from "react"
import { Toaster, toast } from "react-hot-toast"
import { Sidebar } from "@/components/layout/Sidebar"
import { DarkModeToggle } from "@/components/layout/DarkModeToggle"
import { UserEditPopup } from "@/components/team/UserEditPopup"
import { assignees as initialAssignees, mockTasks } from "@/data/tasks"
import type { Assignee, Task } from "@/types/task"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Menu, Mail, Briefcase, CheckCircle2, Clock, CircleDashed } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function TeamPage() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  const [users, setUsers] = useState<Assignee[]>(initialAssignees)
  const [tasks] = useState<Task[]>(mockTasks) // In a real app, this would be fetched
  
  const [selectedUser, setSelectedUser] = useState<Assignee | null>(null)
  const [isPopupOpen, setIsPopupOpen] = useState(false)

  // Calculate workload for each user
  const userWorkload = useMemo(() => {
    const workload: Record<string, { todo: number; inProgress: number; done: number; total: number }> = {}
    
    users.forEach(user => {
      workload[user.id] = { todo: 0, inProgress: 0, done: 0, total: 0 }
    })

    tasks.forEach(task => {
      task.assignees.forEach(assignee => {
        if (workload[assignee.id]) {
          if (task.status === "todo") workload[assignee.id].todo++
          else if (task.status === "in-progress") workload[assignee.id].inProgress++
          else if (task.status === "done") workload[assignee.id].done++
          
          workload[assignee.id].total++
        }
      })
    })
    
    return workload
  }, [users, tasks])

  const handleEditUser = (user: Assignee) => {
    setSelectedUser(user)
    setIsPopupOpen(true)
  }

  const handleSaveUser = (updatedUser: Assignee) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u))
    toast.success("Team member updated successfully!")
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Toaster position="top-right" />
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 lg:relative lg:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <Sidebar 
          isCollapsed={isCollapsed} 
          onToggle={() => setIsCollapsed(!isCollapsed)} 
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-4 md:p-8 lg:p-12">
          {/* Header */}
          <header className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
                <p className="text-muted-foreground mt-1">Manage users, roles, and review individual workloads.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <DarkModeToggle />
            </div>
          </header>

          {/* Users Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {users.map(user => {
              const stats = userWorkload[user.id] || { todo: 0, inProgress: 0, done: 0, total: 0 }
              return (
                <Card 
                  key={user.id} 
                  className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer border-border/50"
                  onClick={() => handleEditUser(user)}
                >
                  <CardHeader className="bg-muted/30 pb-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-14 w-14 border-2 border-background shadow-sm">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1 flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{user.name}</CardTitle>
                        <CardDescription className="flex items-center gap-1.5 truncate">
                          <Briefcase className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{user.role || "Team Member"}</span>
                        </CardDescription>
                        {user.email && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1.5 truncate">
                            <Mail className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{user.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-muted-foreground">Current Workload</span>
                      <Badge variant="secondary" className="font-normal">{stats.total} Total Tasks</Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <div className="flex flex-col items-center justify-center p-2 rounded-md bg-slate-50 dark:bg-slate-900/50">
                        <CircleDashed className="h-4 w-4 text-slate-500 mb-1" />
                        <span className="text-lg font-semibold">{stats.todo}</span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">To Do</span>
                      </div>
                      <div className="flex flex-col items-center justify-center p-2 rounded-md bg-blue-50 dark:bg-blue-900/50">
                        <Clock className="h-4 w-4 text-blue-500 mb-1" />
                        <span className="text-lg font-semibold">{stats.inProgress}</span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">In Progress</span>
                      </div>
                      <div className="flex flex-col items-center justify-center p-2 rounded-md bg-emerald-50 dark:bg-emerald-900/50">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 mb-1" />
                        <span className="text-lg font-semibold">{stats.done}</span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Done</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </main>

      <UserEditPopup 
        user={selectedUser}
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onSave={handleSaveUser}
      />
    </div>
  )
}
