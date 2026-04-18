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
      label: 'Pendientes',
      value: tasks.filter((t) => t.status === 'pending').length,
      icon: ListTodo,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Ideas',
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
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground md:text-2xl">Dashboard</h1>
          <p className="text-sm text-muted-foreground md:text-base">
            Bienvenido a tu espacio de productividad
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar tareas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 sm:w-64"
            />
          </div>
          <Button onClick={() => setIsCreateOpen(true)} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Tarea
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:mb-8 md:grid-cols-4 md:gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-card p-3 md:p-4"
          >
            <div className="flex items-center gap-2 md:gap-3">
              <div className={`rounded-lg p-1.5 md:p-2 ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 md:h-5 md:w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground md:text-2xl">{stat.value}</p>
                <p className="text-xs text-muted-foreground md:text-sm">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Tasks */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-4 md:p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground md:text-lg">
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

        {/* Right Sidebar - Stacks on mobile */}
        <div className="space-y-4 md:space-y-6">
          {/* Eisenhower Quick View */}
          <div className="rounded-xl border border-border bg-card p-4 md:p-5">
            <h2 className="mb-3 text-base font-semibold text-foreground md:mb-4 md:text-lg">
              Matriz Eisenhower
            </h2>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-red-500/10 p-2.5 text-center md:p-3">
                <p className="text-xl font-bold text-red-500 md:text-2xl">
                  {eisenhower.doFirst.length}
                </p>
                <p className="text-xs text-muted-foreground">Hacer Primero</p>
              </div>
              <div className="rounded-lg bg-blue-500/10 p-2.5 text-center md:p-3">
                <p className="text-xl font-bold text-blue-500 md:text-2xl">
                  {eisenhower.schedule.length}
                </p>
                <p className="text-xs text-muted-foreground">Programar</p>
              </div>
              <div className="rounded-lg bg-yellow-500/10 p-2.5 text-center md:p-3">
                <p className="text-xl font-bold text-yellow-500 md:text-2xl">
                  {eisenhower.delegate.length}
                </p>
                <p className="text-xs text-muted-foreground">Delegar</p>
              </div>
              <div className="rounded-lg bg-gray-500/10 p-2.5 text-center md:p-3">
                <p className="text-xl font-bold text-gray-500 md:text-2xl">
                  {eisenhower.eliminate.length}
                </p>
                <p className="text-xs text-muted-foreground">Eliminar</p>
              </div>
            </div>
          </div>

          {/* Upcoming Reminders */}
          <div className="rounded-xl border border-border bg-card p-4 md:p-5">
            <div className="mb-3 flex items-center gap-2 md:mb-4">
              <Bell className="h-4 w-4 text-muted-foreground md:h-5 md:w-5" />
              <h2 className="text-base font-semibold text-foreground md:text-lg">
                Recordatorios
              </h2>
            </div>
            <div className="space-y-2">
              {upcomingReminders.length > 0 ? (
                upcomingReminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className="rounded-lg bg-accent p-2.5 md:p-3"
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
          <div className="rounded-xl border border-border bg-card p-4 md:p-5">
            <div className="mb-3 flex items-center gap-2 md:mb-4">
              <Calendar className="h-4 w-4 text-muted-foreground md:h-5 md:w-5" />
              <h2 className="text-base font-semibold text-foreground md:text-lg">
                Hoy
              </h2>
            </div>
            <div className="space-y-2">
              {todaySchedules.length > 0 ? (
                todaySchedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="flex items-center gap-2 rounded-lg bg-accent p-2.5 md:gap-3 md:p-3"
                  >
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(schedule.start_time), 'HH:mm')}
                    </div>
                    <div className="h-6 w-0.5 bg-primary md:h-8" />
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
