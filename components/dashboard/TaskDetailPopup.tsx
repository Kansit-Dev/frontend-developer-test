"use client"

import { useState, useEffect } from "react"
import type { Task, Priority, Status, Tag } from "@/types/task"
import { assignees as allAssignees } from "@/data/tasks"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import { Calendar, X } from "lucide-react"

interface TaskDetailPopupProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
  onSave: (task: Task) => void
  mode: "view" | "edit" | "create"
}

const tags: Tag[] = ["Feature", "Bug", "Improvement", "Documentation", "Design", "Testing"]
const priorities: Priority[] = ["low", "medium", "high", "critical"]
const statuses: Status[] = ["todo", "in-progress", "done"]

const tagColors = {
  Feature: "bg-emerald-100 text-emerald-700",
  Bug: "bg-red-100 text-red-700",
  Improvement: "bg-blue-100 text-blue-700",
  Documentation: "bg-purple-100 text-purple-700",
  Design: "bg-pink-100 text-pink-700",
  Testing: "bg-yellow-100 text-yellow-700",
}

const priorityColors = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
}

const statusLabels = {
  "todo": "To Do",
  "in-progress": "In Progress",
  "done": "Done",
}

export function TaskDetailPopup({
  task,
  isOpen,
  onClose,
  onSave,
  mode,
}: TaskDetailPopupProps) {
  const [formData, setFormData] = useState<Partial<Task>>({
    title: "",
    description: "",
    tag: "Feature",
    priority: "medium",
    status: "todo",
    progress: 0,
    dueDate: new Date().toISOString().split("T")[0],
    assignees: [],
  })

  useEffect(() => {
    if (task && (mode === "view" || mode === "edit")) {
      setFormData(task)
    } else if (mode === "create") {
      setFormData({
        title: "",
        description: "",
        tag: "Feature",
        priority: "medium",
        status: "todo",
        progress: 0,
        dueDate: new Date().toISOString().split("T")[0],
        assignees: [],
      })
    }
  }, [task, mode, isOpen])

  const handleSave = () => {
    const now = new Date().toISOString()
    const taskToSave: Task = {
      id: task?.id || Date.now().toString(),
      title: formData.title || "",
      description: formData.description || "",
      tag: formData.tag as Tag,
      priority: formData.priority as Priority,
      status: formData.status as Status,
      progress: formData.progress || 0,
      dueDate: formData.dueDate || now.split("T")[0],
      assignees: formData.assignees || [],
      createdAt: task?.createdAt || now,
      updatedAt: now,
    }
    onSave(taskToSave)
    onClose()
  }

  const toggleAssignee = (assigneeId: string) => {
    const currentAssignees = formData.assignees || []
    const isAssigned = currentAssignees.some((a) => a.id === assigneeId)
    
    if (isAssigned) {
      setFormData({
        ...formData,
        assignees: currentAssignees.filter((a) => a.id !== assigneeId),
      })
    } else {
      const assignee = allAssignees.find((a) => a.id === assigneeId)
      if (assignee) {
        setFormData({
          ...formData,
          assignees: [...currentAssignees, assignee],
        })
      }
    }
  }

  const isViewMode = mode === "view"

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New Task" : mode === "edit" ? "Edit Task" : "Task Details"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {mode === "create" ? "Enter the details for the new task." : mode === "edit" ? "Modify the details of this task." : "View the details of this task."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Task Name</Label>
            {isViewMode ? (
              <p className="text-sm font-medium">{formData.title}</p>
            ) : (
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter task title"
              />
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            {isViewMode ? (
              <p className="text-sm text-muted-foreground">{formData.description || "No description"}</p>
            ) : (
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter task description"
                rows={3}
              />
            )}
          </div>

          {/* Tag & Priority Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tag</Label>
              {isViewMode ? (
                <Badge className={cn("text-xs", tagColors[formData.tag as Tag])}>
                  {formData.tag}
                </Badge>
              ) : (
                <Select
                  value={formData.tag}
                  onValueChange={(value) => setFormData({ ...formData, tag: value as Tag })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tags.map((tag) => (
                      <SelectItem key={tag} value={tag}>
                        {tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              {isViewMode ? (
                <Badge className={cn("text-xs capitalize", priorityColors[formData.priority as Priority])}>
                  {formData.priority}
                </Badge>
              ) : (
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value as Priority })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((priority) => (
                      <SelectItem key={priority} value={priority} className="capitalize">
                        {priority}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {/* Status & Date Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              {isViewMode ? (
                <p className="text-sm font-medium">{statusLabels[formData.status as Status]}</p>
              ) : (
                <Select
                  value={formData.status}
                  onValueChange={(value) => {
                    const status = value as Status
                    let progress = formData.progress || 0
                    if (status === "todo") progress = 0
                    else if (status === "done") progress = 100
                    else if (progress === 0 || progress === 100) progress = 50 // Default to 50% if moving to in-progress from ends
                    setFormData({ ...formData, status, progress })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {statusLabels[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label>Due Date</Label>
              {isViewMode ? (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {new Date(formData.dueDate || "").toLocaleDateString()}
                </div>
              ) : (
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              )}
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <Label>Progress: {formData.progress}%</Label>
            {isViewMode ? (
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full",
                    formData.progress === 100
                      ? "bg-emerald-500"
                      : (formData.progress || 0) >= 50
                      ? "bg-blue-500"
                      : "bg-orange-500"
                  )}
                  style={{ width: `${formData.progress}%` }}
                />
              </div>
            ) : (
              <Slider
                value={[formData.progress || 0]}
                onValueChange={(value) => {
                  const progress = value[0]
                  let status = formData.status
                  if (progress === 0) status = "todo"
                  else if (progress === 100) status = "done"
                  else status = "in-progress"
                  setFormData({ ...formData, progress, status: status as Status })
                }}
                max={100}
                step={5}
              />
            )}
          </div>

          {/* Assignees */}
          <div className="space-y-2">
            <Label>Assignees</Label>
            {isViewMode ? (
              <div className="flex flex-wrap gap-2">
                {formData.assignees?.map((assignee) => (
                  <div key={assignee.id} className="flex items-center gap-2 rounded-full bg-muted px-2 py-1">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={assignee.avatar} alt={assignee.name} />
                      <AvatarFallback className="text-[10px]">
                        {assignee.name.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs">{assignee.name}</span>
                  </div>
                ))}
                {(!formData.assignees || formData.assignees.length === 0) && (
                  <p className="text-sm text-muted-foreground">No assignees</p>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {allAssignees.map((assignee) => {
                  const isSelected = formData.assignees?.some((a) => a.id === assignee.id)
                  return (
                    <button
                      key={assignee.id}
                      type="button"
                      onClick={() => toggleAssignee(assignee.id)}
                      className={cn(
                        "flex items-center gap-2 rounded-full px-2 py-1 transition-colors",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80"
                      )}
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={assignee.avatar} alt={assignee.name} />
                        <AvatarFallback className="text-[10px]">
                          {assignee.name.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs">{assignee.name}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleSave} disabled={!formData.title?.trim()}>
            {mode === "create" ? "Save" : "Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
