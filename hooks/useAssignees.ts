import { useState, useEffect } from "react"
import { assignees as initialAssignees } from "@/data/tasks"
import type { Assignee } from "@/types/task"

const STORAGE_KEY = "taskflow_assignees"

export function useAssignees() {
  const [assignees, setAssignees] = useState<Assignee[]>([])
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setAssignees(JSON.parse(saved))
      } catch (e) {
        console.error("Failed to parse assignees from localStorage", e)
        setAssignees(initialAssignees)
      }
    } else {
      setAssignees(initialAssignees)
    }
    setIsInitialLoad(false)
  }, [])

  useEffect(() => {
    if (!isInitialLoad) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(assignees))
    }
  }, [assignees, isInitialLoad])

  const addAssignee = (a: Assignee) => setAssignees(prev => [a, ...prev])
  const updateAssignee = (a: Assignee) =>
    setAssignees(prev => prev.map(u => u.id === a.id ? a : u))

  return { assignees, addAssignee, updateAssignee, isLoading: isInitialLoad }
}
