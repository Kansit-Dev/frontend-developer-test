"use client"

import { useMemo, useState, useEffect } from "react"
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { useDroppable } from "@dnd-kit/core"
import type { Task, Status } from "@/types/task"
import { TaskCard } from "./TaskCard"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"

const ITEMS_PER_COLUMN = 3

interface TaskBoardProps {
  tasks: Task[]
  onTaskClick: (task: Task) => void
  onTaskMove: (taskId: string, newStatus: Status) => void
  activeTask: Task | null
  setActiveTask: (task: Task | null) => void
  searchQuery?: string
  priorityFilter?: string
  statusFilter?: string
  isFiltered?: boolean
}

interface ColumnProps {
  status: string
  title: string
  tasks: Task[]
  onTaskClick: (task: Task) => void
  color: string
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  itemsPerPage?: number
  isGrid?: boolean
}

function Column({ status, title, tasks, onTaskClick, color, currentPage, totalPages, onPageChange, itemsPerPage = ITEMS_PER_COLUMN, isGrid = false }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status })
  
  // Paginate tasks for this column
  const paginatedTasks = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return tasks.slice(start, start + itemsPerPage)
  }, [tasks, currentPage, itemsPerPage])

  return (
    <div className="flex flex-col">
      <div className={cn("mb-3 flex items-center gap-2 rounded-lg px-3 py-2", color)}>
        <h3 className="text-sm font-semibold">{title}</h3>
        <span className="rounded-full bg-background/50 px-2 py-0.5 text-xs font-medium">
          {tasks.length}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "min-h-[200px] flex-1 rounded-lg border-2 border-dashed p-2 transition-colors",
          isGrid ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 content-start" : "space-y-3",
          isOver ? "border-primary bg-primary/5" : "border-transparent"
        )}
      >
        <SortableContext items={paginatedTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <div className={cn("flex h-[150px] items-center justify-center text-sm text-muted-foreground", isGrid && "col-span-full")}>
              No tasks
            </div>
          ) : (
            paginatedTasks.map((task) => (
              <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
            ))
          )}
        </SortableContext>
      </div>
      
      {/* Column Pagination */}
      {totalPages > 1 && (
        <div className="mt-3 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}

export function TaskBoard({
  tasks,
  onTaskClick,
  onTaskMove,
  activeTask,
  setActiveTask,
  searchQuery = "",
  priorityFilter = "all",
  statusFilter = "all",
  isFiltered = false,
}: TaskBoardProps) {
  const showGrid = searchQuery.trim().length > 0 || isFiltered

  // Pagination state per column
  const [columnPages, setColumnPages] = useState<Record<string, number>>({
    "todo": 1,
    "in-progress": 1,
    "done": 1,
    "filtered-results": 1,
  })

  // Reset search results page to 1 when search query changes
  useEffect(() => {
    if (showGrid) {
      setColumnPages((prev) => ({ ...prev, "filtered-results": 1 }))
    }
  }, [searchQuery, priorityFilter, statusFilter, isFiltered, showGrid])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const getFilteredTitle = () => {
    const formatStatus = (s: string) => {
      if (s === "todo") return "To Do"
      if (s === "in-progress") return "In Progress"
      if (s === "done") return "Done"
      return s
    }

    const formatPriority = (p: string) => {
      return p.charAt(0).toUpperCase() + p.slice(1)
    }

    const parts = []
    if (searchQuery.trim().length > 0) parts.push(`"${searchQuery}"`)
    if (statusFilter !== "all") parts.push(`Status: ${formatStatus(statusFilter)}`)
    if (priorityFilter !== "all") parts.push(`Priority: ${formatPriority(priorityFilter)}`)
    
    return parts.length > 0 ? `Filtered Results (${parts.join(", ")})` : "Filtered Results"
  }

  const columns = showGrid
    ? [
        {
          status: "filtered-results",
          title: getFilteredTitle(),
          color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
        },
      ]
    : [
        { status: "todo", title: "To Do", color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
        { status: "in-progress", title: "In Progress", color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
        { status: "done", title: "Done", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" },
      ]

  const tasksByStatus = useMemo(() => {
    if (showGrid) {
      return { "filtered-results": tasks } as Record<string, Task[]>
    }
    return columns.reduce((acc, col) => {
      acc[col.status] = tasks.filter((task) => task.status === col.status)
      return acc
    }, {} as Record<string, Task[]>)
  }, [tasks, showGrid, columns])

  const handleColumnPageChange = (status: string, page: number) => {
    setColumnPages((prev) => ({ ...prev, [status]: page }))
  }

  const getItemsPerPage = (status: string) => status === "filtered-results" ? 9 : ITEMS_PER_COLUMN

  const getTotalPages = (status: string) => {
    return Math.ceil((tasksByStatus[status]?.length || 0) / getItemsPerPage(status))
  }

  const handleDragStart = (event: DragStartEvent) => {
    if (showGrid) return // Disable dragging during search/filter
    const task = tasks.find((t) => t.id === event.active.id)
    if (task) setActiveTask(task)
  }

  const handleDragOver = (event: DragOverEvent) => {
    // Handle drag over if needed
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null)
    
    // Disable drag and drop functionality during search/filter
    if (showGrid) return

    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Check if dropped on a column
    const isColumn = columns.some((col) => col.status === overId)
    if (isColumn) {
      const task = tasks.find((t) => t.id === activeId)
      if (task && task.status !== overId) {
        onTaskMove(activeId, overId as Status)
      }
      return
    }

    // Check if dropped on another task
    const overTask = tasks.find((t) => t.id === overId)
    if (overTask) {
      const activeTaskData = tasks.find((t) => t.id === activeId)
      if (activeTaskData && activeTaskData.status !== overTask.status) {
        onTaskMove(activeId, overTask.status)
      }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className={cn(
        "grid gap-4",
        showGrid
          ? "w-full"
          : columns.filter(col => tasksByStatus[col.status]?.length > 0).length === 1
            ? "md:grid-cols-1 max-w-md mx-auto" 
            : columns.filter(col => tasksByStatus[col.status]?.length > 0).length === 2 
              ? "md:grid-cols-2 max-w-2xl mx-auto" 
              : "md:grid-cols-3"
      )}>
        {columns
          .filter((column) => showGrid || tasksByStatus[column.status]?.length > 0)
          .map((column) => (
            <Column
              key={column.status}
              status={column.status}
              title={column.title}
              tasks={tasksByStatus[column.status] || []}
              onTaskClick={onTaskClick}
              color={column.color}
              currentPage={columnPages[column.status] || 1}
              totalPages={getTotalPages(column.status)}
              onPageChange={(page) => handleColumnPageChange(column.status, page)}
              itemsPerPage={getItemsPerPage(column.status)}
              isGrid={showGrid}
            />
          ))}
      </div>

      <DragOverlay>
        {activeTask && (
          <div className="rotate-3 opacity-90">
            <TaskCard task={activeTask} onClick={() => {}} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
