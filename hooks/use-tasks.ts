'use client'

import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import type { Task, Person, Reminder, Schedule, TaskCategory, TaskStatus } from '@/lib/types'

const supabase = createClient()

async function fetchTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*, assignee:people(*)')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

async function fetchPeople(): Promise<Person[]> {
  const { data, error } = await supabase
    .from('people')
    .select('*')
    .order('name', { ascending: true })
  
  if (error) throw error
  return data || []
}

async function fetchReminders(): Promise<Reminder[]> {
  const { data, error } = await supabase
    .from('reminders')
    .select('*, task:tasks(*)')
    .order('reminder_date', { ascending: true })
  
  if (error) throw error
  return data || []
}

async function fetchSchedules(): Promise<Schedule[]> {
  const { data, error } = await supabase
    .from('schedules')
    .select('*, task:tasks(*)')
    .order('start_time', { ascending: true })
  
  if (error) throw error
  return data || []
}

export function useTasks() {
  const { data, error, isLoading, mutate } = useSWR<Task[]>('tasks', fetchTasks)

  const addTask = async (task: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'assignee'>) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: newTask, error } = await supabase
      .from('tasks')
      .insert({ ...task, user_id: user.id })
      .select('*, assignee:people(*)')
      .single()

    if (error) throw error
    mutate()
    return newTask
  }

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const { data: updatedTask, error } = await supabase
      .from('tasks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*, assignee:people(*)')
      .single()

    if (error) throw error
    mutate()
    return updatedTask
  }

  const deleteTask = async (id: string) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)

    if (error) throw error
    mutate()
  }

  const filterByCategory = (category: TaskCategory) => {
    return data?.filter(task => task.category === category) || []
  }

  const filterByStatus = (status: TaskStatus) => {
    return data?.filter(task => task.status === status) || []
  }

  const searchTasks = (query: string) => {
    const lowerQuery = query.toLowerCase()
    return data?.filter(task => 
      task.title.toLowerCase().includes(lowerQuery) ||
      task.description?.toLowerCase().includes(lowerQuery)
    ) || []
  }

  const getEisenhowerTasks = () => {
    return {
      doFirst: data?.filter(t => t.is_important && t.is_urgent) || [],
      schedule: data?.filter(t => t.is_important && !t.is_urgent) || [],
      delegate: data?.filter(t => !t.is_important && t.is_urgent) || [],
      eliminate: data?.filter(t => !t.is_important && !t.is_urgent) || [],
    }
  }

  return {
    tasks: data || [],
    isLoading,
    error,
    addTask,
    updateTask,
    deleteTask,
    filterByCategory,
    filterByStatus,
    searchTasks,
    getEisenhowerTasks,
    mutate,
  }
}

export function usePeople() {
  const { data, error, isLoading, mutate } = useSWR<Person[]>('people', fetchPeople)

  const addPerson = async (person: Omit<Person, 'id' | 'user_id' | 'created_at'>) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: newPerson, error } = await supabase
      .from('people')
      .insert({ ...person, user_id: user.id })
      .select()
      .single()

    if (error) throw error
    mutate()
    return newPerson
  }

  const deletePerson = async (id: string) => {
    const { error } = await supabase
      .from('people')
      .delete()
      .eq('id', id)

    if (error) throw error
    mutate()
  }

  return {
    people: data || [],
    isLoading,
    error,
    addPerson,
    deletePerson,
    mutate,
  }
}

export function useReminders() {
  const { data, error, isLoading, mutate } = useSWR<Reminder[]>('reminders', fetchReminders)

  const addReminder = async (reminder: Omit<Reminder, 'id' | 'user_id' | 'created_at' | 'task'>) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: newReminder, error } = await supabase
      .from('reminders')
      .insert({ ...reminder, user_id: user.id })
      .select('*, task:tasks(*)')
      .single()

    if (error) throw error
    mutate()
    return newReminder
  }

  const updateReminder = async (id: string, updates: Partial<Reminder>) => {
    const { error } = await supabase
      .from('reminders')
      .update(updates)
      .eq('id', id)

    if (error) throw error
    mutate()
  }

  const deleteReminder = async (id: string) => {
    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', id)

    if (error) throw error
    mutate()
  }

  return {
    reminders: data || [],
    isLoading,
    error,
    addReminder,
    updateReminder,
    deleteReminder,
    mutate,
  }
}

export function useSchedules() {
  const { data, error, isLoading, mutate } = useSWR<Schedule[]>('schedules', fetchSchedules)

  const addSchedule = async (schedule: Omit<Schedule, 'id' | 'user_id' | 'created_at' | 'task'>) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: newSchedule, error } = await supabase
      .from('schedules')
      .insert({ ...schedule, user_id: user.id })
      .select('*, task:tasks(*)')
      .single()

    if (error) throw error
    mutate()
    return newSchedule
  }

  const updateSchedule = async (id: string, updates: Partial<Schedule>) => {
    const { error } = await supabase
      .from('schedules')
      .update(updates)
      .eq('id', id)

    if (error) throw error
    mutate()
  }

  const deleteSchedule = async (id: string) => {
    const { error } = await supabase
      .from('schedules')
      .delete()
      .eq('id', id)

    if (error) throw error
    mutate()
  }

  return {
    schedules: data || [],
    isLoading,
    error,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    mutate,
  }
}
