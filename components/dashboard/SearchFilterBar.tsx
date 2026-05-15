"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Priority, Status } from "@/types/task"
import { Search, X } from "lucide-react"

interface SearchFilterBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  priorityFilter: Priority | "all"
  onPriorityChange: (priority: Priority | "all") => void
  statusFilter: Status | "all"
  onStatusChange: (status: Status | "all") => void
  onClearFilters: () => void
}

export function SearchFilterBar({
  searchQuery,
  onSearchChange,
  priorityFilter,
  onPriorityChange,
  statusFilter,
  onStatusChange,
  onClearFilters,
}: SearchFilterBarProps) {
  const hasFilters = searchQuery || priorityFilter !== "all" || statusFilter !== "all"

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by task name, priority, or status..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Priority Filter */}
      <Select value={priorityFilter} onValueChange={(value) => onPriorityChange(value as Priority | "all")}>
        <SelectTrigger className="w-full sm:w-36">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priorities</SelectItem>
          <SelectItem value="low">Low</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="critical">Critical</SelectItem>
        </SelectContent>
      </Select>

      {/* Status Filter */}
      <Select value={statusFilter} onValueChange={(value) => onStatusChange(value as Status | "all")}>
        <SelectTrigger className="w-full sm:w-36">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="todo">To Do</SelectItem>
          <SelectItem value="in-progress">In Progress</SelectItem>
          <SelectItem value="done">Done</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear Filters Button */}
      {hasFilters && (
        <Button variant="ghost" size="icon" onClick={onClearFilters} className="shrink-0">
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
