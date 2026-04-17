'use client'

import { useState, useMemo } from 'react'
import { useTasks, useSchedules, useReminders } from '@/hooks/use-tasks'
import { TaskDialog } from '@/components/task-dialog'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Bell,
  CheckCircle,
} from 'lucide-react'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isToday,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

export default function CalendarPage() {
  const { tasks, isLoading: tasksLoading } = useTasks()
  const { schedules, isLoading: schedulesLoading } = useSchedules()
  const { reminders, isLoading: remindersLoading } = useReminders()

  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const isLoading = tasksLoading || schedulesLoading || remindersLoading

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const calendarStart = startOfWeek(monthStart)
    const calendarEnd = endOfWeek(monthEnd)

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  }, [currentDate])

  const getEventsForDay = (day: Date) => {
    const dayTasks = tasks.filter(
      (task) => task.due_date && isSameDay(new Date(task.due_date), day)
    )
    const daySchedules = schedules.filter((schedule) =>
      isSameDay(new Date(schedule.start_time), day)
    )
    const dayReminders = reminders.filter((reminder) =>
      isSameDay(new Date(reminder.reminder_date), day)
    )

    return { tasks: dayTasks, schedules: daySchedules, reminders: dayReminders }
  }

  const selectedDayEvents = selectedDate ? getEventsForDay(selectedDate) : null

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-3">
            <CalendarIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Calendario</h1>
            <p className="text-muted-foreground">
              Visualiza tus tareas, cronogramas y recordatorios
            </p>
          </div>
        </div>

        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Tarea
        </Button>
      </div>

      <div className="flex flex-1 gap-6">
        {/* Calendar */}
        <div className="flex-1 rounded-xl border border-border bg-card p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">
              {format(currentDate, 'MMMM yyyy', { locale: es })}
            </h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
              >
                Hoy
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Weekday Headers */}
          <div className="mb-2 grid grid-cols-7 gap-1">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="py-2 text-center text-sm font-medium text-muted-foreground"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day) => {
              const events = getEventsForDay(day)
              const hasEvents =
                events.tasks.length > 0 ||
                events.schedules.length > 0 ||
                events.reminders.length > 0
              const isSelected = selectedDate && isSameDay(day, selectedDate)

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    'relative flex h-24 flex-col items-center rounded-lg border p-1 transition-colors',
                    !isSameMonth(day, currentDate)
                      ? 'border-transparent text-muted-foreground/50'
                      : 'border-border text-foreground hover:bg-accent',
                    isToday(day) && 'border-primary',
                    isSelected && 'bg-primary/10 border-primary'
                  )}
                >
                  <span
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-full text-sm',
                      isToday(day) && 'bg-primary text-primary-foreground'
                    )}
                  >
                    {format(day, 'd')}
                  </span>

                  {hasEvents && (
                    <div className="mt-1 flex flex-wrap justify-center gap-0.5">
                      {events.tasks.length > 0 && (
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                      )}
                      {events.schedules.length > 0 && (
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      )}
                      {events.reminders.length > 0 && (
                        <div className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                      )}
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-blue-500" />
              <span className="text-muted-foreground">Tareas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span className="text-muted-foreground">Cronogramas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <span className="text-muted-foreground">Recordatorios</span>
            </div>
          </div>
        </div>

        {/* Day Details */}
        <div className="w-80 rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 text-lg font-semibold text-foreground">
            {selectedDate
              ? format(selectedDate, "d 'de' MMMM", { locale: es })
              : 'Selecciona un día'}
          </h3>

          {selectedDayEvents ? (
            <div className="space-y-4">
              {/* Tasks */}
              {selectedDayEvents.tasks.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-500">
                    <CheckCircle className="h-4 w-4" />
                    Tareas ({selectedDayEvents.tasks.length})
                  </div>
                  <div className="space-y-2">
                    {selectedDayEvents.tasks.map((task) => (
                      <div
                        key={task.id}
                        className="rounded-lg bg-blue-500/10 p-3"
                      >
                        <p className="text-sm font-medium text-foreground">
                          {task.title}
                        </p>
                        {task.due_date && (
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(task.due_date), 'HH:mm')}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Schedules */}
              {selectedDayEvents.schedules.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium text-green-500">
                    <Clock className="h-4 w-4" />
                    Cronogramas ({selectedDayEvents.schedules.length})
                  </div>
                  <div className="space-y-2">
                    {selectedDayEvents.schedules.map((schedule) => (
                      <div
                        key={schedule.id}
                        className="rounded-lg bg-green-500/10 p-3"
                      >
                        <p className="text-sm font-medium text-foreground">
                          {schedule.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(schedule.start_time), 'HH:mm')} -{' '}
                          {format(new Date(schedule.end_time), 'HH:mm')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reminders */}
              {selectedDayEvents.reminders.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium text-yellow-500">
                    <Bell className="h-4 w-4" />
                    Recordatorios ({selectedDayEvents.reminders.length})
                  </div>
                  <div className="space-y-2">
                    {selectedDayEvents.reminders.map((reminder) => (
                      <div
                        key={reminder.id}
                        className="rounded-lg bg-yellow-500/10 p-3"
                      >
                        <p className="text-sm font-medium text-foreground">
                          {reminder.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(reminder.reminder_date), 'HH:mm')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedDayEvents.tasks.length === 0 &&
                selectedDayEvents.schedules.length === 0 &&
                selectedDayEvents.reminders.length === 0 && (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    Sin eventos para este día
                  </p>
                )}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Selecciona un día para ver los detalles
            </p>
          )}
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
