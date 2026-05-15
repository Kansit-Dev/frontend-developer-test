export type Priority = "low" | "medium" | "high" | "critical"
export type Status = "todo" | "in-progress" | "done"
export type Tag = "Feature" | "Bug" | "Improvement" | "Documentation" | "Design" | "Testing"

export interface Assignee {
  id: string
  name: string
  avatar: string
  email?: string
  role?: string
}

export interface Task {
  id: string
  title: string
  description?: string
  tag: Tag
  priority: Priority
  status: Status
  progress: number
  dueDate: string
  assignees: Assignee[]
  createdAt: string
  updatedAt: string
}
