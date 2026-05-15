import { useState, useEffect } from "react"
import type { Task, Status } from "@/types/task"
import { mockTasks } from "@/data/tasks"

const LOCAL_STORAGE_KEY = "taskflow_tasks"

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  // Load tasks from localStorage on init
  useEffect(() => {
    const savedTasks = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (savedTasks) {
      try {
        const parsed = JSON.parse(savedTasks)
        setTasks(parsed)
      } catch (e) {
        console.error("Failed to parse tasks from localStorage", e)
        setTasks(mockTasks)
      }
    } else {
      setTasks(mockTasks)
    }
    setIsInitialLoad(false)
  }, [])

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    if (!isInitialLoad) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks))
    }
  }, [tasks, isInitialLoad])

  const createTask = (newTask: Task) => {
    setTasks((prev) => [newTask, ...prev])
  }

  const updateTask = (updatedTask: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)))
  }

  const moveTask = (taskId: string, newStatus: Status) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: newStatus,
              progress: newStatus === "done" ? 100 : newStatus === "todo" ? 0 : task.progress,
              updatedAt: new Date().toISOString(),
            }
          : task
      )
    )
  }

  return {
    tasks,
    createTask,
    updateTask,
    moveTask,
    isLoading: isInitialLoad
  }
}
