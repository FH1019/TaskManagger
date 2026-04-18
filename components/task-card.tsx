'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import type { Task } from '@/lib/types'
import { useTasks } from '@/hooks/use-tasks'
import {
  Star,
  Clock,
  AlertTriangle,
  Trash2,
  Edit,
  CheckCircle,
  Circle,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TaskDialog } from '@/components/task-dialog'

interface TaskCardProps {
  task: Task
  compact?: boolean
}

export function TaskCard({ task, compact = false }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const { updateTask, deleteTask } = useTasks()

  const handleToggleComplete = async () => {
    await updateTask(task.id, {
      status: task.status === 'completed' ? 'pending' : 'completed',
    })
  }

  const handleDelete = async () => {
    if (confirm('¿Estás seguro de eliminar esta tarea?')) {
      await deleteTask(task.id)
    }
  }

  const getRatingStars = (rating: number | null) => {
    if (!rating) return null
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          'h-3 w-3',
          i < rating ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'
        )}
      />
    ))
  }

  if (compact) {
    return (
      <>
        <div
          className={cn(
            'group flex items-center gap-2 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-accent',
            task.status === 'completed' && 'opacity-60'
          )}
        >
          <button onClick={handleToggleComplete} className="shrink-0">
            {task.status === 'completed' ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground" />
            )}
          </button>

          <div className="min-w-0 flex-1">
            <p
              className={cn(
                'truncate text-sm font-medium text-foreground',
                task.status === 'completed' && 'line-through'
              )}
            >
              {task.title}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            {task.is_urgent && (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            )}
            {task.is_important && <Star className="h-4 w-4 text-yellow-500" />}
          </div>

          <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <TaskDialog
          open={isEditing}
          onOpenChange={setIsEditing}
          task={task}
          mode="edit"
        />
      </>
    )
  }

  return (
    <>
      <div
        className={cn(
          'group rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-lg',
          task.status === 'completed' && 'opacity-60'
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <button
              onClick={handleToggleComplete}
              className="mt-0.5 shrink-0"
            >
              {task.status === 'completed' ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground hover:text-primary" />
              )}
            </button>

            <div className="min-w-0">
              <h3
                className={cn(
                  'text-base font-medium text-foreground',
                  task.status === 'completed' && 'line-through'
                )}
              >
                {task.title}
              </h3>
              {task.description && (
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {task.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          {task.is_important && (
            <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/10 px-2 py-0.5 text-xs font-medium text-yellow-500">
              <Star className="h-3 w-3" />
              Importante
            </span>
          )}
          {task.is_urgent && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-500">
              <AlertTriangle className="h-3 w-3" />
              Urgente
            </span>
          )}
          {task.due_date && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {format(new Date(task.due_date), 'dd MMM yyyy', { locale: es })}
            </span>
          )}
          {task.assignee && (
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: `${task.assignee.color}20`,
                color: task.assignee.color,
              }}
            >
              <User className="h-3 w-3" />
              {task.assignee.name}
            </span>
          )}
          {task.rating && (
            <div className="flex items-center gap-0.5">
              {getRatingStars(task.rating)}
            </div>
          )}
        </div>
      </div>

      <TaskDialog
        open={isEditing}
        onOpenChange={setIsEditing}
        task={task}
        mode="edit"
      />
    </>
  )
}
