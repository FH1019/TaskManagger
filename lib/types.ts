export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'archived'
export type TaskCategory = 'task' | 'brainstorm' | 'note'
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly'

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Person {
  id: string
  user_id: string
  name: string
  email: string | null
  color: string
  created_at: string
}

export interface Task {
  id: string
  user_id: string
  title: string
  description: string | null
  is_important: boolean
  is_urgent: boolean
  status: TaskStatus
  rating: number | null
  due_date: string | null
  assignee_id: string | null
  is_personal: boolean
  category: TaskCategory
  created_at: string
  updated_at: string
  assignee?: Person | null
}

export interface Reminder {
  id: string
  user_id: string
  task_id: string | null
  title: string
  reminder_date: string
  is_completed: boolean
  created_at: string
  task?: Task | null
}

export interface Schedule {
  id: string
  user_id: string
  task_id: string | null
  title: string
  start_time: string
  end_time: string
  recurrence: RecurrenceType
  created_at: string
  task?: Task | null
}

export type EisenhowerQuadrant = 
  | 'do-first' // Important & Urgent
  | 'schedule' // Important & Not Urgent
  | 'delegate' // Not Important & Urgent
  | 'eliminate' // Not Important & Not Urgent
