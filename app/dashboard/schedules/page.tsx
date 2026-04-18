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
    <div className="p-6">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-green-500/10 p-3">
            <Clock className="h-6 w-6 text-green-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Cronogramas</h1>
            <p className="text-muted-foreground">
              Programa actividades con horarios específicos
            </p>
          </div>
        </div>

        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Cronograma
        </Button>
      </div>

      {/* Schedules List */}
      <div className="grid gap-4">
        {schedules.length > 0 ? (
          schedules.map((schedule) => (
            <div
              key={schedule.id}
              className="group flex items-center justify-between rounded-xl border border-border bg-card p-5"
            >
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-green-500/10 p-3">
                  <Calendar className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">{schedule.title}</h3>
                  <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
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
                    {schedule.task && (
                      <span className="text-xs text-primary">
                        Vinculado a: {schedule.task.title}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleOpenEdit(schedule)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  onClick={() => handleDelete(schedule.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-16 text-center">
            <Clock className="mx-auto h-16 w-16 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium text-foreground">
              Sin cronogramas
            </h3>
            <p className="mt-2 text-muted-foreground">
              Crea tu primer cronograma para programar actividades
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
        <DialogContent>
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

            <div className="grid grid-cols-2 gap-4">
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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
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
