'use client'

import { useState, useMemo } from 'react'
import { useTasks } from '@/hooks/use-tasks'
import { TaskCard } from '@/components/task-card'
import { TaskDialog } from '@/components/task-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Search, ListTodo, Star, Filter } from 'lucide-react'
import type { TaskStatus } from '@/lib/types'

export default function TasksPage() {
  const { tasks, isLoading } = useTasks()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all')
  const [ratingFilter, setRatingFilter] = useState<string>('all')
  const [importanceFilter, setImportanceFilter] = useState<string>('all')

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => task.category === 'task')
      .filter((task) => {
        if (statusFilter !== 'all' && task.status !== statusFilter) return false
        if (ratingFilter !== 'all' && task.rating !== parseInt(ratingFilter)) return false
        if (importanceFilter === 'important' && !task.is_important) return false
        if (importanceFilter === 'urgent' && !task.is_urgent) return false
        if (importanceFilter === 'both' && !(task.is_important && task.is_urgent)) return false
        if (searchQuery) {
          const query = searchQuery.toLowerCase()
          return (
            task.title.toLowerCase().includes(query) ||
            task.description?.toLowerCase().includes(query)
          )
        }
        return true
      })
  }, [tasks, statusFilter, ratingFilter, importanceFilter, searchQuery])

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
          <div className="rounded-xl bg-blue-500/10 p-3">
            <ListTodo className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Lista de Tareas</h1>
            <p className="text-muted-foreground">
              {filteredTasks.length} tareas encontradas
            </p>
          </div>
        </div>

        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Tarea
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Filtros:</span>
        </div>

        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar tareas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as TaskStatus | 'all')}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendiente</SelectItem>
            <SelectItem value="in_progress">En Progreso</SelectItem>
            <SelectItem value="completed">Completada</SelectItem>
            <SelectItem value="archived">Archivada</SelectItem>
          </SelectContent>
        </Select>

        <Select value={ratingFilter} onValueChange={setRatingFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Calificación" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="5">5 Estrellas</SelectItem>
            <SelectItem value="4">4 Estrellas</SelectItem>
            <SelectItem value="3">3 Estrellas</SelectItem>
            <SelectItem value="2">2 Estrellas</SelectItem>
            <SelectItem value="1">1 Estrella</SelectItem>
          </SelectContent>
        </Select>

        <Select value={importanceFilter} onValueChange={setImportanceFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Prioridad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="important">Solo Importantes</SelectItem>
            <SelectItem value="urgent">Solo Urgentes</SelectItem>
            <SelectItem value="both">Importantes y Urgentes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Task List */}
      <div className="grid grid-cols-2 gap-4">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => <TaskCard key={task.id} task={task} />)
        ) : (
          <div className="col-span-2 py-16 text-center">
            <ListTodo className="mx-auto h-16 w-16 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium text-foreground">
              No se encontraron tareas
            </h3>
            <p className="mt-2 text-muted-foreground">
              {searchQuery || statusFilter !== 'all' || ratingFilter !== 'all'
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Crea tu primera tarea para comenzar'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Button className="mt-4" onClick={() => setIsCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Crear Tarea
              </Button>
            )}
          </div>
        )}
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
