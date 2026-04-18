'use client'

import { useState } from 'react'
import { usePeople } from '@/hooks/use-tasks'
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
import { Plus, Users, Trash2, User, Mail } from 'lucide-react'

const COLORS = [
  '#3b82f6', // blue
  '#22c55e', // green
  '#eab308', // yellow
  '#ef4444', // red
  '#a855f7', // purple
  '#06b6d4', // cyan
  '#f97316', // orange
  '#ec4899', // pink
]

export default function PeoplePage() {
  const { people, isLoading, addPerson, deletePerson } = usePeople()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    color: COLORS[0],
  })

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    })
  }

  const handleOpenCreate = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    setIsSubmitting(true)
    try {
      await addPerson({
        name: formData.name,
        email: formData.email || null,
        color: formData.color,
      })
      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error('Error adding person:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta persona?')) {
      await deletePerson(id)
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
          <div className="rounded-xl bg-primary/10 p-2 md:p-3">
            <Users className="h-5 w-5 text-primary md:h-6 md:w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground md:text-2xl">Personas</h1>
            <p className="text-sm text-muted-foreground">
              Administra las personas para asignar tareas
            </p>
          </div>
        </div>

        <Button onClick={handleOpenCreate} className="w-full md:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Agregar Persona
        </Button>
      </div>

      {/* People Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {people.length > 0 ? (
          people.map((person) => (
            <div
              key={person.id}
              className="group relative rounded-xl border border-border bg-card p-4 md:p-5"
            >
              <button
                onClick={() => handleDelete(person.id)}
                className="absolute right-3 top-3 rounded-lg p-1.5 text-destructive opacity-100 transition-opacity hover:bg-destructive/10 sm:opacity-0 sm:group-hover:opacity-100"
              >
                <Trash2 className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-3 md:gap-4">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full text-base font-semibold text-white md:h-12 md:w-12 md:text-lg"
                  style={{ backgroundColor: person.color }}
                >
                  {person.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="truncate font-medium text-foreground">{person.name}</h3>
                  {person.email && (
                    <p className="flex items-center gap-1 truncate text-xs text-muted-foreground md:text-sm">
                      <Mail className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{person.email}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center md:py-16">
            <Users className="mx-auto h-12 w-12 text-muted-foreground/50 md:h-16 md:w-16" />
            <h3 className="mt-4 text-base font-medium text-foreground md:text-lg">
              Sin personas registradas
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Agrega personas para asignarles tareas
            </p>
            <Button className="mt-4" onClick={handleOpenCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar Persona
            </Button>
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Agregar Persona</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Nombre de la persona..."
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email (opcional)</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="correo@ejemplo.com"
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={`h-8 w-8 rounded-full transition-transform ${
                      formData.color === color ? 'scale-110 ring-2 ring-offset-2 ring-offset-background' : ''
                    }`}
                    style={{ backgroundColor: color, ringColor: color }}
                  />
                ))}
              </div>
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
                {isSubmitting ? 'Agregando...' : 'Agregar Persona'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
