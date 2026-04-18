'use client'

import { useState } from 'react'
import { useTasks, useReminders, useSchedules } from '@/hooks/use-tasks'
import { TaskCard } from '@/components/task-card'
import { TaskDialog } from '@/components/task-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import {
  Plus,
  Search,
  ListTodo,
  Lightbulb,
  Calendar,
  Bell,
  Star,
  AlertTriangle,
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function DashboardPage() {
  const { tasks, isLoading, getEisenhowerTasks } = useTasks()
  const { reminders } = useReminders()
  const { schedules } = useSchedules()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const eisenhower = getEisenhowerTasks()

  const recentTasks = tasks
    .filter((task) => task.status !== 'completed')
    .slice(0, 5)

  const upcomingReminders = reminders
    .filter((r) => !r.is_completed && new Date(r.reminder_date) > new Date())
    .slice(0, 3)

  const todaySchedules = schedules.filter((s) => {
    const today = new Date()
    const start = new Date(s.start_time)
    return start.toDateString() === today.toDateString()
  })

  const stats = [
    {
      label: 'Tareas Pendientes',
      value: tasks.filter((t) => t.status === 'pending').length,
      icon: ListTodo,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Ideas Capturadas',
      value: tasks.filter((t) => t.category === 'brainstorm').length,
      icon: Lightbulb,
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10',
    },
    {
      label: 'Importantes',
      value: tasks.filter((t) => t.is_important && t.status !== 'completed').length,
      icon: Star,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
    },
    {
      label: 'Urgentes',
      value: tasks.filter((t) => t.is_urgent && t.status !== 'completed').length,
      icon: AlertTriangle,
      color: 'text-red-500',
      bg: 'bg-red-500/10',
    },
  ]

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Bienvenido a tu espacio de productividad
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar tareas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 pl-9"
            />
          </div>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Tarea
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-card p-4"
          >
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2 ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Recent Tasks */}
        <div className="col-span-2 rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Tareas Recientes
            </h2>
            <Button variant="ghost" size="sm" asChild>
              <a href="/dashboard/tasks">Ver todas</a>
            </Button>
          </div>

          <div className="space-y-3">
            {recentTasks.length > 0 ? (
              recentTasks.map((task) => (
                <TaskCard key={task.id} task={task} compact />
              ))
            ) : (
              <p className="py-8 text-center text-muted-foreground">
                No hay tareas pendientes
              </p>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Eisenhower Quick View */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Matriz Eisenhower
            </h2>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-red-500/10 p-3 text-center">
                <p className="text-2xl font-bold text-red-500">
                  {eisenhower.doFirst.length}
                </p>
                <p className="text-xs text-muted-foreground">Hacer Primero</p>
              </div>
              <div className="rounded-lg bg-blue-500/10 p-3 text-center">
                <p className="text-2xl font-bold text-blue-500">
                  {eisenhower.schedule.length}
                </p>
                <p className="text-xs text-muted-foreground">Programar</p>
              </div>
              <div className="rounded-lg bg-yellow-500/10 p-3 text-center">
                <p className="text-2xl font-bold text-yellow-500">
                  {eisenhower.delegate.length}
                </p>
                <p className="text-xs text-muted-foreground">Delegar</p>
              </div>
              <div className="rounded-lg bg-gray-500/10 p-3 text-center">
                <p className="text-2xl font-bold text-gray-500">
                  {eisenhower.eliminate.length}
                </p>
                <p className="text-xs text-muted-foreground">Eliminar</p>
              </div>
            </div>
          </div>

          {/* Upcoming Reminders */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold text-foreground">
                Recordatorios
              </h2>
            </div>
            <div className="space-y-2">
              {upcomingReminders.length > 0 ? (
                upcomingReminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className="rounded-lg bg-accent p-3"
                  >
                    <p className="text-sm font-medium text-foreground">
                      {reminder.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(reminder.reminder_date), 'dd MMM, HH:mm', {
                        locale: es,
                      })}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Sin recordatorios próximos
                </p>
              )}
            </div>
          </div>

          {/* Today's Schedule */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold text-foreground">
                Hoy
              </h2>
            </div>
            <div className="space-y-2">
              {todaySchedules.length > 0 ? (
                todaySchedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="flex items-center gap-3 rounded-lg bg-accent p-3"
                  >
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(schedule.start_time), 'HH:mm')}
                    </div>
                    <div className="h-8 w-0.5 bg-primary" />
                    <p className="text-sm font-medium text-foreground">
                      {schedule.title}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Sin actividades programadas
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <TaskDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        mode="create"
      />
    </div>
  )
}
