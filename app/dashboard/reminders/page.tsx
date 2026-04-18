'use client'

import { useState } from 'react'
import { useReminders, useTasks } from '@/hooks/use-tasks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { Checkbox } from '@/components/ui/checkbox'
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
import { Plus, Bell, Trash2, Edit, CheckCircle, Clock } from 'lucide-react'
import { format, isPast, isFuture } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'

export default function RemindersPage() {
  const { reminders, isLoading, addReminder, updateReminder, deleteReminder } = useReminders()
  const { tasks } = useTasks()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingReminder, setEditingReminder] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all')

  const [formData, setFormData] = useState({
    title: '',
    task_id: null as string | null,
    reminder_date: '',
    is_completed: false,
  })

  const filteredReminders = reminders.filter((reminder) => {
    if (filter === 'pending') return !reminder.is_completed
    if (filter === 'completed') return reminder.is_completed
    return true
  })

  const resetForm = () => {
    setFormData({
      title: '',
      task_id: null,
      reminder_date: '',
      is_completed: false,
    })
    setEditingReminder(null)
  }

  const handleOpenCreate = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (reminder: (typeof reminders)[0]) => {
    setFormData({
      title: reminder.title,
      task_id: reminder.task_id,
      reminder_date: reminder.reminder_date.slice(0, 16),
      is_completed: reminder.is_completed,
    })
    setEditingReminder(reminder.id)
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.reminder_date) return

    setIsSubmitting(true)
    try {
      const reminderData = {
        title: formData.title,
        task_id: formData.task_id,
        reminder_date: new Date(formData.reminder_date).toISOString(),
        is_completed: formData.is_completed,
      }

      if (editingReminder) {
        await updateReminder(editingReminder, reminderData)
      } else {
        await addReminder(reminderData)
      }
      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error('Error saving reminder:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleComplete = async (id: string, currentStatus: boolean) => {
    await updateReminder(id, { is_completed: !currentStatus })
  }

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este recordatorio?')) {
      await deleteReminder(id)
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
          <div className="rounded-xl bg-yellow-500/10 p-3">
            <Bell className="h-6 w-6 text-yellow-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Recordatorios</h1>
            <p className="text-muted-foreground">
              No olvides ninguna fecha importante
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Select value={filter} onValueChange={(v: 'all' | 'pending' | 'completed') => setFilter(v)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendientes</SelectItem>
              <SelectItem value="completed">Completados</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Recordatorio
          </Button>
        </div>
      </div>

      {/* Reminders List */}
      <div className="grid gap-4">
        {filteredReminders.length > 0 ? (
          filteredReminders.map((reminder) => {
            const isOverdue = isPast(new Date(reminder.reminder_date)) && !reminder.is_completed
            const isUpcoming = isFuture(new Date(reminder.reminder_date))

            return (
              <div
                key={reminder.id}
                className={cn(
                  'group flex items-center justify-between rounded-xl border border-border bg-card p-5',
                  reminder.is_completed && 'opacity-60',
                  isOverdue && 'border-red-500/50'
                )}
              >
                <div className="flex items-center gap-4">
                  <Checkbox
                    checked={reminder.is_completed}
                    onCheckedChange={() =>
                      handleToggleComplete(reminder.id, reminder.is_completed)
                    }
                  />
                  <div className={cn(
                    'rounded-lg p-3',
                    isOverdue ? 'bg-red-500/10' : reminder.is_completed ? 'bg-green-500/10' : 'bg-yellow-500/10'
                  )}>
                    {reminder.is_completed ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : isOverdue ? (
                      <Bell className="h-5 w-5 text-red-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-500" />
                    )}
                  </div>
                  <div>
                    <h3
                      className={cn(
                        'font-medium text-foreground',
                        reminder.is_completed && 'line-through'
                      )}
                    >
                      {reminder.title}
                    </h3>
                    <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                      <span className={cn(isOverdue && 'text-red-500')}>
                        {format(new Date(reminder.reminder_date), "d MMM yyyy, HH:mm", {
                          locale: es,
                        })}
                      </span>
                      {isOverdue && (
                        <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-xs text-red-500">
                          Vencido
                        </span>
                      )}
                      {isUpcoming && !reminder.is_completed && (
                        <span className="rounded-full bg-yellow-500/10 px-2 py-0.5 text-xs text-yellow-500">
                          Próximo
                        </span>
                      )}
                      {reminder.task && (
                        <span className="text-xs text-primary">
                          Tarea: {reminder.task.title}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenEdit(reminder)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => handleDelete(reminder.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )
          })
        ) : (
          <div className="py-16 text-center">
            <Bell className="mx-auto h-16 w-16 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium text-foreground">
              Sin recordatorios
            </h3>
            <p className="mt-2 text-muted-foreground">
              Crea tu primer recordatorio para no olvidar fechas importantes
            </p>
            <Button className="mt-4" onClick={handleOpenCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Crear Recordatorio
            </Button>
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingReminder ? 'Editar Recordatorio' : 'Nuevo Recordatorio'}
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
                placeholder="Nombre del recordatorio..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminder_date">Fecha y Hora</Label>
              <Input
                id="reminder_date"
                type="datetime-local"
                value={formData.reminder_date}
                onChange={(e) =>
                  setFormData({ ...formData, reminder_date: e.target.value })
                }
                required
              />
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
                  : editingReminder
                  ? 'Guardar Cambios'
                  : 'Crear Recordatorio'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
