'use client'

import { useState } from 'react'
import { useTasks } from '@/hooks/use-tasks'
import { TaskCard } from '@/components/task-card'
import { TaskDialog } from '@/components/task-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Plus, Lightbulb, Search, Sparkles } from 'lucide-react'

export default function BrainstormPage() {
  const { tasks, isLoading, addTask, updateTask } = useTasks()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [quickIdea, setQuickIdea] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const brainstormTasks = tasks.filter((t) => t.category === 'brainstorm')
  const unclassifiedIdeas = brainstormTasks.filter(
    (t) => !t.is_important && !t.is_urgent && !t.rating
  )
  const classifiedIdeas = brainstormTasks.filter(
    (t) => t.is_important || t.is_urgent || t.rating
  )

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!quickIdea.trim()) return

    setIsAdding(true)
    try {
      await addTask({
        title: quickIdea,
        description: null,
        is_important: false,
        is_urgent: false,
        status: 'pending',
        rating: null,
        due_date: null,
        assignee_id: null,
        is_personal: true,
        category: 'brainstorm',
      })
      setQuickIdea('')
    } catch (error) {
      console.error('Error adding idea:', error)
    } finally {
      setIsAdding(false)
    }
  }

  const handleConvertToTask = async (taskId: string) => {
    await updateTask(taskId, { category: 'task' })
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
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-yellow-500/10 p-2 md:p-3">
            <Lightbulb className="h-5 w-5 text-yellow-500 md:h-6 md:w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground md:text-2xl">Brainstorming</h1>
            <p className="text-sm text-muted-foreground">
              Captura tus ideas rápidamente
            </p>
          </div>
        </div>
      </div>

      {/* Quick Add */}
      <div className="mb-6 rounded-xl border border-border bg-card p-4 md:mb-8 md:p-6">
        <div className="mb-3 flex items-center gap-2 md:mb-4">
          <Sparkles className="h-4 w-4 text-yellow-500 md:h-5 md:w-5" />
          <h2 className="text-base font-semibold text-foreground md:text-lg">
            Captura Rápida
          </h2>
        </div>
        <form onSubmit={handleQuickAdd} className="flex flex-col gap-3 sm:flex-row">
          <Input
            value={quickIdea}
            onChange={(e) => setQuickIdea(e.target.value)}
            placeholder="Escribe una nueva idea..."
            className="flex-1"
          />
          <Button type="submit" disabled={isAdding || !quickIdea.trim()} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            {isAdding ? 'Agregando...' : 'Agregar'}
          </Button>
        </form>
        <p className="mt-2 text-xs text-muted-foreground md:text-sm">
          Presiona Enter para agregar rápidamente.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Unclassified Ideas */}
        <div className="rounded-xl border border-border bg-card p-4 md:p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground md:text-lg">
              Sin Clasificar ({unclassifiedIdeas.length})
            </h2>
          </div>
          <div className="space-y-3 max-h-[50vh] overflow-y-auto md:max-h-[60vh]">
            {unclassifiedIdeas.length > 0 ? (
              unclassifiedIdeas.map((task) => (
                <div key={task.id} className="space-y-2">
                  <TaskCard task={task} compact />
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleConvertToTask(task.id)}
                  >
                    Convertir a Tarea
                  </Button>
                </div>
              ))
            ) : (
              <div className="py-8 text-center md:py-12">
                <Lightbulb className="mx-auto h-10 w-10 text-muted-foreground/50 md:h-12 md:w-12" />
                <p className="mt-4 text-sm text-muted-foreground">
                  No hay ideas sin clasificar
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Classified Ideas */}
        <div className="rounded-xl border border-border bg-card p-4 md:p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground md:text-lg">
              Clasificadas ({classifiedIdeas.length})
            </h2>
            <Button variant="outline" size="sm" onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Nueva Idea</span>
              <span className="sm:hidden">Nueva</span>
            </Button>
          </div>
          <div className="space-y-3 max-h-[50vh] overflow-y-auto md:max-h-[60vh]">
            {classifiedIdeas.length > 0 ? (
              classifiedIdeas.map((task) => (
                <div key={task.id} className="space-y-2">
                  <TaskCard task={task} compact />
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleConvertToTask(task.id)}
                  >
                    Convertir a Tarea
                  </Button>
                </div>
              ))
            ) : (
              <div className="py-8 text-center md:py-12">
                <Search className="mx-auto h-10 w-10 text-muted-foreground/50 md:h-12 md:w-12" />
                <p className="mt-4 text-sm text-muted-foreground">
                  Clasifica tus ideas para verlas aquí
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <TaskDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        mode="create"
        defaultCategory="brainstorm"
      />
    </div>
  )
}
