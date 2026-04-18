'use client'

import { useState } from 'react'
import { useSchedules, useTasks } from '@/hooks/use-tasks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Clock, Trash2, Edit, Calendar, Repeat } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { RecurrenceType } from '@/lib/types'

export default function SchedulesPage() {
  const { schedules, isLoading, addSchedule, updateSchedule, deleteSchedule } = useSchedules()
  const { tasks } = useTasks()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    task_id: null as string | null,
    start_time: '',
    end_time: '',
    recurrence: 'none' as RecurrenceType,
  })

  const resetForm = () => {
    setFormData({
      title: '',
      task_id: null,
      start_time: '',
      end_time: '',
      recurrence: 'none',
    })
    setEditingSchedule(null)
  }

  const handleOpenCreate = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (schedule: (typeof schedules)[0]) => {
    setFormData({
      title: schedule.title,
      task_id: schedule.task_id,
      start_time: schedule.start_time.slice(0, 16),
      end_time: schedule.end_time.slice(0, 16),
      recurrence: schedule.recurrence,
    })
    setEditingSchedule(schedule.id)
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.start_time || !formData.end_time) return

    setIsSubmitting(true)
    try {
      const scheduleData = {
        title: formData.title,
        task_id: formData.task_id,
        start_time: new Date(formData.start_time).toISOString(),
        end_time: new Date(formData.end_time).toISOString(),
        recurrence: formData.recurrence,
      }

      if (editingSchedule) {
        await updateSchedule(editingSchedule, scheduleData)
      } else {
        await addSchedule(scheduleData)
      }
      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error('Error saving schedule:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este cronograma?')) {
      await deleteSchedule(id)
    }
  }

  const getRecurrenceLabel = (recurrence: RecurrenceType) => {
    switch (recurrence) {
      case 'daily':
        return 'Diario'
      case 'weekly':
        return 'Semanal'
      case 'monthly':
        return 'Mensual'
      default:
        return 'Sin repetición'
    }
  }

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
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-green-500/10 p-2 md:p-3">
            <Clock className="h-5 w-5 text-green-500 md:h-6 md:w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground md:text-2xl">Cronogramas</h1>
            <p className="text-sm text-muted-foreground">
              Programa actividades con horarios
            </p>
          </div>
        </div>

        <Button onClick={handleOpenCreate} className="w-full md:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Cronograma
        </Button>
      </div>

      {/* Schedules List */}
      <div className="grid gap-3 md:gap-4">
        {schedules.length > 0 ? (
          schedules.map((schedule) => (
            <div
              key={schedule.id}
              className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between md:p-5"
            >
              <div className="flex items-start gap-3 sm:items-center sm:gap-4">
                <div className="rounded-lg bg-green-500/10 p-2 md:p-3">
                  <Calendar className="h-4 w-4 text-green-500 md:h-5 md:w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-foreground md:text-base">{schedule.title}</h3>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground md:gap-4 md:text-sm">
                    <span>
                      {format(new Date(schedule.start_time), "d MMM yyyy, HH:mm", {
                        locale: es,
                      })}{' '}
                      -{' '}
                      {format(new Date(schedule.end_time), 'HH:mm', { locale: es })}
                    </span>
                    {schedule.recurrence !== 'none' && (
                      <span className="flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-xs">
                        <Repeat className="h-3 w-3" />
                        {getRecurrenceLabel(schedule.recurrence)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleOpenEdit(schedule)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => handleDelete(schedule.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-12 text-center md:py-16">
            <Clock className="mx-auto h-12 w-12 text-muted-foreground/50 md:h-16 md:w-16" />
            <h3 className="mt-4 text-base font-medium text-foreground md:text-lg">
              Sin cronogramas
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Crea tu primer cronograma
            </p>
            <Button className="mt-4" onClick={handleOpenCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Crear Cronograma
            </Button>
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingSchedule ? 'Editar Cronograma' : 'Nuevo Cronograma'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Nombre del cronograma..."
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="start_time">Inicio</Label>
                <Input
                  id="start_time"
                  type="datetime-local"
                  value={formData.start_time}
                  onChange={(e) =>
                    setFormData({ ...formData, start_time: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_time">Fin</Label>
                <Input
                  id="end_time"
                  type="datetime-local"
                  value={formData.end_time}
                  onChange={(e) =>
                    setFormData({ ...formData, end_time: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recurrence">Repetición</Label>
              <Select
                value={formData.recurrence}
                onValueChange={(value: RecurrenceType) =>
                  setFormData({ ...formData, recurrence: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin repetición</SelectItem>
                  <SelectItem value="daily">Diario</SelectItem>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="monthly">Mensual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="task">Vincular a Tarea (opcional)</Label>
              <Select
                value={formData.task_id || 'none'}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    task_id: value === 'none' ? null : value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una tarea..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin vincular</SelectItem>
                  {tasks.map((task) => (
                    <SelectItem key={task.id} value={task.id}>
                      {task.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                {isSubmitting
                  ? 'Guardando...'
                  : editingSchedule
                  ? 'Guardar Cambios'
                  : 'Crear Cronograma'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
