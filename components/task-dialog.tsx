'use client'

import { useState, useEffect } from 'react'
import { useTasks, usePeople } from '@/hooks/use-tasks'
import type { Task, TaskCategory, TaskStatus } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: Task
  mode: 'create' | 'edit'
  defaultCategory?: TaskCategory
}

export function TaskDialog({
  open,
  onOpenChange,
  task,
  mode,
  defaultCategory = 'task',
}: TaskDialogProps) {
  const { addTask, updateTask } = useTasks()
  const { people } = usePeople()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    is_important: false,
    is_urgent: false,
    status: 'pending' as TaskStatus,
    rating: null as number | null,
    due_date: '',
    assignee_id: null as string | null,
    is_personal: true,
    category: defaultCategory as TaskCategory,
  })

  useEffect(() => {
    if (task && mode === 'edit') {
      setFormData({
        title: task.title,
        description: task.description || '',
        is_important: task.is_important,
        is_urgent: task.is_urgent,
        status: task.status,
        rating: task.rating,
        due_date: task.due_date ? task.due_date.slice(0, 16) : '',
        assignee_id: task.assignee_id,
        is_personal: task.is_personal,
        category: task.category,
      })
    } else {
      setFormData({
        title: '',
        description: '',
        is_important: false,
        is_urgent: false,
        status: 'pending',
        rating: null,
        due_date: '',
        assignee_id: null,
        is_personal: true,
        category: defaultCategory,
      })
    }
  }, [task, mode, defaultCategory, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    setIsSubmitting(true)
    try {
      const taskData = {
        ...formData,
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
      }

      if (mode === 'edit' && task) {
        await updateTask(task.id, taskData)
      } else {
        await addTask(taskData)
      }
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving task:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRatingClick = (value: number) => {
    setFormData((prev) => ({
      ...prev,
      rating: prev.rating === value ? null : value,
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? 'Editar Tarea' : 'Nueva Tarea'}
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
              placeholder="Escribe el título de la tarea..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe la tarea..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Select
                value={formData.category}
                onValueChange={(value: TaskCategory) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="task">Tarea</SelectItem>
                  <SelectItem value="brainstorm">Idea</SelectItem>
                  <SelectItem value="note">Nota</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select
                value={formData.status}
                onValueChange={(value: TaskStatus) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="in_progress">En Progreso</SelectItem>
                  <SelectItem value="completed">Completada</SelectItem>
                  <SelectItem value="archived">Archivada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="due_date">Fecha Límite</Label>
              <Input
                id="due_date"
                type="datetime-local"
                value={formData.due_date}
                onChange={(e) =>
                  setFormData({ ...formData, due_date: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignee">Asignar a</Label>
              <Select
                value={formData.assignee_id || 'personal'}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    assignee_id: value === 'personal' ? null : value,
                    is_personal: value === 'personal',
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Solo para mí</SelectItem>
                  {people.map((person) => (
                    <SelectItem key={person.id} value={person.id}>
                      {person.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Checkbox
                id="is_important"
                checked={formData.is_important}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_important: !!checked })
                }
              />
              <Label htmlFor="is_important" className="cursor-pointer">
                Importante
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="is_urgent"
                checked={formData.is_urgent}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_urgent: !!checked })
                }
              />
              <Label htmlFor="is_urgent" className="cursor-pointer">
                Urgente
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Calificación</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleRatingClick(value)}
                  className="p-1"
                >
                  <Star
                    className={cn(
                      'h-6 w-6 transition-colors',
                      formData.rating && value <= formData.rating
                        ? 'fill-yellow-500 text-yellow-500'
                        : 'text-muted-foreground hover:text-yellow-500'
                    )}
                  />
                </button>
              ))}
              {formData.rating && (
                <span className="ml-2 text-sm text-muted-foreground">
                  {formData.rating}/5
                </span>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'Guardando...'
                : mode === 'edit'
                ? 'Guardar Cambios'
                : 'Crear Tarea'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
