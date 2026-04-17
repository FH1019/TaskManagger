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
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-yellow-500/10 p-3">
            <Lightbulb className="h-6 w-6 text-yellow-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Brainstorming</h1>
            <p className="text-muted-foreground">
              Captura tus ideas rápidamente y clasifícalas después
            </p>
          </div>
        </div>
      </div>

      {/* Quick Add */}
      <div className="mb-8 rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-yellow-500" />
          <h2 className="text-lg font-semibold text-foreground">
            Captura Rápida
          </h2>
        </div>
        <form onSubmit={handleQuickAdd} className="flex gap-3">
          <Input
            value={quickIdea}
            onChange={(e) => setQuickIdea(e.target.value)}
            placeholder="Escribe una nueva idea..."
            className="flex-1"
          />
          <Button type="submit" disabled={isAdding || !quickIdea.trim()}>
            <Plus className="mr-2 h-4 w-4" />
            {isAdding ? 'Agregando...' : 'Agregar Idea'}
          </Button>
        </form>
        <p className="mt-2 text-sm text-muted-foreground">
          Presiona Enter para agregar rápidamente. Puedes clasificar la idea después.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Unclassified Ideas */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Sin Clasificar ({unclassifiedIdeas.length})
            </h2>
          </div>
          <div className="space-y-3">
            {unclassifiedIdeas.length > 0 ? (
              unclassifiedIdeas.map((task) => (
                <div key={task.id} className="space-y-2">
                  <TaskCard task={task} />
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
              <div className="py-12 text-center">
                <Lightbulb className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">
                  No hay ideas sin clasificar
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Classified Ideas */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Clasificadas ({classifiedIdeas.length})
            </h2>
            <Button variant="outline" size="sm" onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Idea
            </Button>
          </div>
          <div className="space-y-3">
            {classifiedIdeas.length > 0 ? (
              classifiedIdeas.map((task) => (
                <div key={task.id} className="space-y-2">
                  <TaskCard task={task} />
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
              <div className="py-12 text-center">
                <Search className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">
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
