'use client'

import { useState } from 'react'
import { useTasks } from '@/hooks/use-tasks'
import { TaskCard } from '@/components/task-card'
import { TaskDialog } from '@/components/task-dialog'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Plus, Star, AlertTriangle, Clock, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuadrantProps {
  title: string
  description: string
  tasks: ReturnType<typeof useTasks>['tasks']
  color: string
  bgColor: string
  icon: React.ReactNode
}

function Quadrant({ title, description, tasks, color, bgColor, icon }: QuadrantProps) {
  return (
    <div className={cn('rounded-xl border border-border p-3 md:p-4', bgColor)}>
      <div className="mb-3 flex items-center gap-2 md:mb-4">
        {icon}
        <div>
          <h3 className={cn('text-sm font-semibold md:text-base', color)}>{title}</h3>
          <p className="hidden text-xs text-muted-foreground sm:block">{description}</p>
        </div>
      </div>
      <div className="space-y-2 max-h-[200px] overflow-y-auto md:max-h-[calc(100vh-320px)]">
        {tasks.length > 0 ? (
          tasks.map((task) => <TaskCard key={task.id} task={task} compact />)
        ) : (
          <p className="py-4 text-center text-xs text-muted-foreground md:py-8 md:text-sm">
            Sin tareas
          </p>
        )}
      </div>
    </div>
  )
}

export default function EisenhowerPage() {
  const { isLoading, getEisenhowerTasks } = useTasks()
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const eisenhower = getEisenhowerTasks()

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col p-4 md:p-6">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-4 md:mb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground md:text-2xl">Matriz Eisenhower</h1>
          <p className="text-sm text-muted-foreground">
            Prioriza tus tareas según importancia y urgencia
          </p>
        </div>

        <Button onClick={() => setIsCreateOpen(true)} className="w-full md:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Nueva Tarea
        </Button>
      </div>

      {/* Mobile: Column labels on top */}
      <div className="mb-2 hidden grid-cols-2 gap-4 text-center md:grid">
        <span className="text-sm font-medium text-foreground">Urgente</span>
        <span className="text-sm font-medium text-foreground">No Urgente</span>
      </div>

      {/* Matrix Grid - Stacked on mobile, 2x2 on desktop */}
      <div className="flex-1 space-y-4 md:grid md:grid-cols-2 md:grid-rows-2 md:gap-4 md:space-y-0">
        {/* Q1: Important & Urgent - Do First */}
        <div className="md:row-start-1">
          <div className="mb-1 text-center text-xs font-medium text-muted-foreground md:hidden">
            Importante + Urgente
          </div>
          <Quadrant
            title="Hacer Primero"
            description="Importante y Urgente"
            tasks={eisenhower.doFirst}
            color="text-red-500"
            bgColor="bg-red-500/5"
            icon={<AlertTriangle className="h-4 w-4 text-red-500 md:h-5 md:w-5" />}
          />
        </div>

        {/* Q2: Important & Not Urgent - Schedule */}
        <div className="md:row-start-1">
          <div className="mb-1 text-center text-xs font-medium text-muted-foreground md:hidden">
            Importante + No Urgente
          </div>
          <Quadrant
            title="Programar"
            description="Importante pero No Urgente"
            tasks={eisenhower.schedule}
            color="text-blue-500"
            bgColor="bg-blue-500/5"
            icon={<Clock className="h-4 w-4 text-blue-500 md:h-5 md:w-5" />}
          />
        </div>

        {/* Q3: Not Important & Urgent - Delegate */}
        <div className="md:row-start-2">
          <div className="mb-1 text-center text-xs font-medium text-muted-foreground md:hidden">
            No Importante + Urgente
          </div>
          <Quadrant
            title="Delegar"
            description="Urgente pero No Importante"
            tasks={eisenhower.delegate}
            color="text-yellow-500"
            bgColor="bg-yellow-500/5"
            icon={<Star className="h-4 w-4 text-yellow-500 md:h-5 md:w-5" />}
          />
        </div>

        {/* Q4: Not Important & Not Urgent - Eliminate */}
        <div className="md:row-start-2">
          <div className="mb-1 text-center text-xs font-medium text-muted-foreground md:hidden">
            No Importante + No Urgente
          </div>
          <Quadrant
            title="Eliminar"
            description="Ni Importante ni Urgente"
            tasks={eisenhower.eliminate}
            color="text-gray-500"
            bgColor="bg-gray-500/5"
            icon={<Trash2 className="h-4 w-4 text-gray-500 md:h-5 md:w-5" />}
          />
        </div>
      </div>

      <TaskDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        mode="create"
        defaultCategory="task"
      />
    </div>
  )
}
