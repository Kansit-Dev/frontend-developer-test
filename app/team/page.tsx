"use client"

import { useState, useMemo } from "react"
import { Toaster, toast } from "react-hot-toast"
import { Sidebar } from "@/components/layout/Sidebar"
import { DarkModeToggle } from "@/components/layout/DarkModeToggle"
import { UserEditPopup } from "@/components/team/UserEditPopup"
import { useTasks } from "@/hooks/useTasks"
import { useAssignees } from "@/hooks/useAssignees"
import { assignees as initialAssignees } from "@/data/tasks"
import type { Assignee } from "@/types/task"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Menu, Mail, Briefcase, CheckCircle2, Clock, CircleDashed, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function TeamPage() {
  const { tasks, isLoading: isTasksLoading } = useTasks()
  const { assignees: users, addAssignee, updateAssignee, isLoading: isAssigneesLoading } = useAssignees()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  const [selectedUser, setSelectedUser] = useState<Assignee | null>(null)
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [popupMode, setPopupMode] = useState<"edit" | "create">("edit")

  // Calculate workload for each user based on real tasks
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
    setPopupMode("edit")
    setIsPopupOpen(true)
  }

  const handleAddUser = () => {
    setSelectedUser(null)
    setPopupMode("create")
    setIsPopupOpen(true)
  }

  const handleSaveUser = (updatedUser: Assignee) => {
    if (popupMode === "create") {
      addAssignee(updatedUser)
      toast.success("Team member added successfully!")
    } else {
      updateAssignee(updatedUser)
      toast.success("Team member updated successfully!")
    }
  }

  if (isTasksLoading || isAssigneesLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-right" />
      
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
              <h1 className="text-2xl font-bold text-foreground">Team Members</h1>
              <p className="text-sm text-muted-foreground">
                Manage users, roles, and review individual workloads.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <DarkModeToggle />
              <Button onClick={handleAddUser}>
                <Plus className="mr-2 h-4 w-4" />
                Add Member
              </Button>
            </div>
          </div>

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
        mode={popupMode}
      />
    </div>
  )
}
