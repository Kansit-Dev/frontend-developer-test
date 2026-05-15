"use client"

import { useState, useMemo, useEffect } from "react"
import { Toaster, toast } from "react-hot-toast"
import { Sidebar } from "@/components/layout/Sidebar"
import { DarkModeToggle } from "@/components/layout/DarkModeToggle"
import { SearchFilterBar } from "@/components/dashboard/SearchFilterBar"
import { TaskBoard } from "@/components/dashboard/TaskBoard"
import { TaskDetailPopup } from "@/components/dashboard/TaskDetailPopup"
import { Button } from "@/components/ui/button"
import { useTasks } from "@/hooks/useTasks"
import type { Task, Priority, Status } from "@/types/task"
import { Plus, Menu } from "lucide-react"
import { cn } from "@/lib/utils"

export default function DashboardPage() {
  const { tasks, createTask, updateTask, moveTask, isLoading } = useTasks()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("")
  const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all")
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all")
  
  // Popup State
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [popupMode, setPopupMode] = useState<"view" | "edit" | "create">("view")
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  
  // Drag State
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  // Keyboard shortcut for closing popup
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isPopupOpen) {
        setIsPopupOpen(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isPopupOpen])

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Search query filter (searches in title, priority, and status)
      const searchLower = searchQuery.toLowerCase()
      // Normalize searchable status so users can search "todo", "to do", "inprogress", "in progress", "in-progress"
      const normalizedSearchQuery = searchLower.replace(/[\s-]/g, "")
      const normalizedStatus = task.status.toLowerCase().replace(/[\s-]/g, "")
      
      const matchesSearch =
        !searchQuery ||
        task.title.toLowerCase().includes(searchLower) ||
        task.priority.toLowerCase().includes(searchLower) ||
        normalizedStatus.includes(normalizedSearchQuery) ||
        task.tag.toLowerCase().includes(searchLower)

      // Priority filter
      const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter

      // Status filter
      const matchesStatus = statusFilter === "all" || task.status === statusFilter

      return matchesSearch && matchesPriority && matchesStatus
    })
  }, [tasks, searchQuery, priorityFilter, statusFilter])

  const handleClearFilters = () => {
    setSearchQuery("")
    setPriorityFilter("all")
    setStatusFilter("all")
  }

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    setPopupMode("edit")
    setIsPopupOpen(true)
  }

  const handleCreateTask = () => {
    setSelectedTask(null)
    setPopupMode("create")
    setIsPopupOpen(true)
  }

  const handleSaveTask = (task: Task) => {
    // Check if this is a request to switch to edit mode
    if ((task as Task & { _switchToEdit?: boolean })._switchToEdit) {
      setPopupMode("edit")
      return
    }
    
    if (popupMode === "create") {
      createTask(task)
      toast.success("Task created successfully!")
    } else {
      updateTask(task)
      toast.success("Task updated successfully!")
    }
  }

  const handleTaskMove = (taskId: string, newStatus: Status) => {
    moveTask(taskId, newStatus)
    toast.success(`Task moved to ${newStatus === "todo" ? "To Do" : newStatus === "in-progress" ? "In Progress" : "Done"}`)
  }

  if (isLoading) {
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
              <h1 className="text-2xl font-bold text-foreground">Task Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Manage and track your team&apos;s tasks
              </p>
            </div>
            <div className="flex items-center gap-2">
              <DarkModeToggle />
              <Button onClick={handleCreateTask}>
                <Plus className="mr-2 h-4 w-4" />
                New Task
              </Button>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="mb-6">
            <SearchFilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              priorityFilter={priorityFilter}
              onPriorityChange={setPriorityFilter}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* Task Board */}
          <div className="mb-6">
            {filteredTasks.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border">
                <p className="text-lg font-medium text-muted-foreground">No tasks found</p>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search or filters
                </p>
              </div>
            ) : (
              <TaskBoard
                tasks={filteredTasks}
                onTaskClick={handleTaskClick}
                onTaskMove={handleTaskMove}
                activeTask={activeTask}
                setActiveTask={setActiveTask}
                searchQuery={searchQuery}
                priorityFilter={priorityFilter}
                statusFilter={statusFilter}
                isFiltered={searchQuery.trim().length > 0 || priorityFilter !== "all" || statusFilter !== "all"}
              />
            )}
          </div>

          {/* Task Count Summary */}
          <div className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Showing {filteredTasks.length} task{filteredTasks.length !== 1 ? "s" : ""}
              {filteredTasks.length !== tasks.length && ` (filtered from ${tasks.length} total)`}
            </p>
          </div>
        </div>
      </main>

      {/* Task Detail Popup */}
      <TaskDetailPopup
        task={selectedTask}
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onSave={handleSaveTask}
        mode={popupMode}
      />
    </div>
  )
}
