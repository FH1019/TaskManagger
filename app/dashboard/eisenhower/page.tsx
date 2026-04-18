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
    <div className={cn('rounded-xl border border-border p-4', bgColor)}>
      <div className="mb-4 flex items-center gap-2">
        {icon}
        <div>
          <h3 className={cn('font-semibold', color)}>{title}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="space-y-2 max-h-[calc(100vh-320px)] overflow-y-auto">
        {tasks.length > 0 ? (
          tasks.map((task) => <TaskCard key={task.id} task={task} compact />)
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Sin tareas en este cuadrante
          </p>
        )}
      </div>
    </div>
  )
}

export default function EisenhowerPage() {
  const { tasks, isLoading, getEisenhowerTasks } = useTasks()
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
    <div className="flex h-full flex-col p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Matriz Eisenhower</h1>
          <p className="text-muted-foreground">
            Prioriza tus tareas según su importancia y urgencia
          </p>
        </div>

        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Tarea
        </Button>
      </div>

      {/* Matrix Labels */}
      <div className="mb-2 flex">
        <div className="w-24" />
        <div className="flex-1 text-center">
          <span className="text-sm font-medium text-foreground">Urgente</span>
        </div>
        <div className="flex-1 text-center">
          <span className="text-sm font-medium text-foreground">No Urgente</span>
        </div>
      </div>

      <div className="flex flex-1 gap-4">
        {/* Row Label */}
        <div className="flex w-24 flex-col justify-center">
          <div className="h-1/2 flex items-center justify-center">
            <span className="text-sm font-medium text-foreground -rotate-90 whitespace-nowrap">
              Importante
            </span>
          </div>
          <div className="h-1/2 flex items-center justify-center">
            <span className="text-sm font-medium text-foreground -rotate-90 whitespace-nowrap">
              No Importante
            </span>
          </div>
        </div>

        {/* Matrix Grid */}
        <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-4">
          {/* Q1: Important & Urgent - Do First */}
          <Quadrant
            title="Hacer Primero"
            description="Importante y Urgente"
            tasks={eisenhower.doFirst}
            color="text-red-500"
            bgColor="bg-red-500/5"
            icon={<AlertTriangle className="h-5 w-5 text-red-500" />}
          />

          {/* Q2: Important & Not Urgent - Schedule */}
          <Quadrant
            title="Programar"
            description="Importante pero No Urgente"
            tasks={eisenhower.schedule}
            color="text-blue-500"
            bgColor="bg-blue-500/5"
            icon={<Clock className="h-5 w-5 text-blue-500" />}
          />

          {/* Q3: Not Important & Urgent - Delegate */}
          <Quadrant
            title="Delegar"
            description="Urgente pero No Importante"
            tasks={eisenhower.delegate}
            color="text-yellow-500"
            bgColor="bg-yellow-500/5"
            icon={<Star className="h-5 w-5 text-yellow-500" />}
          />

          {/* Q4: Not Important & Not Urgent - Eliminate */}
          <Quadrant
            title="Eliminar"
            description="Ni Importante ni Urgente"
            tasks={eisenhower.eliminate}
            color="text-gray-500"
            bgColor="bg-gray-500/5"
            icon={<Trash2 className="h-5 w-5 text-gray-500" />}
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
