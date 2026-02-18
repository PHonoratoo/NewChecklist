'use client'

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useTransition,
} from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Check,
  X,
  Plus,
  Trash2,
  Filter,
  ChevronDown,
} from 'lucide-react'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import type { Task } from '@/lib/types'
import { TASK_CATEGORIES } from '@/lib/types'

interface ChecklistEnhancedProps {
  userId: string
  groupId?: string | null
}

type TaskStatus = 'all' | 'completed' | 'pending' | 'rejected'

export default function ChecklistEnhanced({
  userId,
  groupId,
}: ChecklistEnhancedProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTaskText, setNewTaskText] = useState('')
  const [newTaskCategory, setNewTaskCategory] = useState<string>('other')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [taskStatus, setTaskStatus] = useState<TaskStatus>('all')
  const [isCreating, setIsCreating] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const supabase = useMemo(() => createClient(), [])

  const fetchTasks = useCallback(async () => {
    try {
      let query = supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)

      if (groupId) {
        query = query.eq('group_id', groupId)
      }

      const { data, error: err } = await query.order('created_at', {
        ascending: true,
      })

      if (err) {
        setError('Não foi possível carregar as tarefas.')
        console.error(err)
      } else {
        setTasks(data ?? [])
      }
    } finally {
      setIsLoading(false)
    }
  }, [supabase, userId, groupId])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  // Subscribe to real-time changes
  useEffect(() => {
    const channel = supabase
      .channel(`tasks-${userId}-${groupId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
        },
        (payload: RealtimePostgresChangesPayload<Task>) => {
          if (payload.eventType === 'INSERT') {
            const newTask = payload.new as Task
            if (!groupId || newTask.group_id === groupId) {
              setTasks((prev) => {
                const exists = prev.some((t) => t.id === newTask.id)
                return exists ? prev : [...prev, newTask]
              })
            }
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as Task
            setTasks((prev) =>
              prev.map((t) => (t.id === updated.id ? updated : t))
            )
          } else if (payload.eventType === 'DELETE') {
            const deleted = payload.old as Partial<Task>
            setTasks((prev) => prev.filter((t) => t.id !== deleted.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, userId, groupId])

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (taskStatus === 'completed') return task.status === 1
      if (taskStatus === 'pending') return task.status === 0
      if (taskStatus === 'rejected') return task.status === 2
      return true
    })
  }, [tasks, taskStatus])

  const stats = useMemo(
    () => ({
      total: tasks.length,
      completed: tasks.filter((t) => t.status === 1).length,
      pending: tasks.filter((t) => t.status === 0).length,
      rejected: tasks.filter((t) => t.status === 2).length,
    }),
    [tasks]
  )

  const handleAddTask = useCallback(async () => {
    if (!newTaskText.trim()) return
    setIsCreating(async () => {
      setError(null)

      try {
        const { data, error: err } = await supabase
          .from('tasks')
          .insert({
            title: newTaskText.trim(),
            status: 0,
            user_id: userId,
            group_id: groupId || null,
            category: newTaskCategory,
            due_date: null,
          })
          .select()

        if (err) {
          setError('Não foi possível adicionar a tarefa.')
          console.error(err)
          return
        }

        if (data && data[0]) {
          setTasks((prev) => [...prev, data[0]])
        }
        setNewTaskText('')
        setNewTaskCategory('other')
      } catch (err) {
        setError('Erro ao criar tarefa.')
        console.error(err)
      }
    })
  }, [newTaskText, newTaskCategory, userId, groupId, supabase])

  const handleToggleStatus = useCallback(
    async (id: string, desiredStatus: number) => {
      const task = tasks.find((t) => t.id === id)
      if (!task) return

      const updatedStatus = task.status === desiredStatus ? 0 : desiredStatus
      setError(null)

      const { error: err } = await supabase
        .from('tasks')
        .update({ status: updatedStatus })
        .eq('id', id)

      if (err) {
        setError('Não foi possível atualizar a tarefa.')
        console.error(err)
      }
    },
    [tasks, supabase]
  )

  const handleRemoveTask = useCallback(
    async (id: string) => {
      setError(null)
      const { error: err } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)

      if (err) {
        setError('Não foi possível remover a tarefa.')
        console.error(err)
      }
    },
    [supabase]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleAddTask()
    },
    [handleAddTask]
  )

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="text-lg">Tarefas</CardTitle>
            <div className="flex items-center gap-2">
              {stats.total > 0 && (
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  {stats.completed}/{stats.total} concluídas
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-1.5"
              >
                <Filter className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only text-xs">Filtros</span>
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="flex gap-2 pt-2 border-t">
              {(['all', 'pending', 'completed', 'rejected'] as TaskStatus[]).map(
                (status) => (
                  <Button
                    key={status}
                    variant={taskStatus === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTaskStatus(status)}
                    className="text-xs"
                  >
                    {status === 'all' && 'Todas'}
                    {status === 'pending' && 'Pendentes'}
                    {status === 'completed' && 'Concluídas'}
                    {status === 'rejected' && 'Rejeitadas'}
                  </Button>
                )
              )}
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Adicione uma tarefa..."
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                onKeyDown={handleKeyDown}
                className="text-sm"
              />
              <select
                value={newTaskCategory}
                onChange={(e) => setNewTaskCategory(e.target.value)}
                className="px-2 py-1.5 text-xs border rounded-md bg-white"
              >
                {TASK_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              <Button
                onClick={handleAddTask}
                disabled={!newTaskText.trim()}
                size="sm"
                className="shrink-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 p-2 text-xs text-destructive">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-8 text-xs text-muted-foreground">
              Carregando...
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-8 text-xs text-muted-foreground bg-muted/50 rounded-md">
              {tasks.length === 0
                ? 'Nenhuma tarefa ainda'
                : 'Nenhuma tarefa com esse filtro'}
            </div>
          ) : (
            <ul className="space-y-2" role="list">
              {filteredTasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center gap-2 p-3 rounded-md border bg-card hover:bg-accent/50 transition-colors group"
                >
                  <span
                    className={`flex-1 break-words text-sm ${
                      task.status === 1
                        ? 'line-through text-muted-foreground'
                        : ''
                    }`}
                  >
                    {task.title}
                  </span>
                  {task.category && (
                    <span className="text-xs bg-muted px-2 py-1 rounded">
                      {TASK_CATEGORIES.find((c) => c.value === task.category)
                        ?.label || task.category}
                    </span>
                  )}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleStatus(task.id, 1)}
                      className={`flex items-center justify-center h-8 w-8 rounded-md border text-sm transition-colors ${
                        task.status === 1
                          ? 'bg-primary border-primary text-primary-foreground'
                          : 'bg-card hover:bg-primary/10 hover:border-primary/40'
                      }`}
                      aria-label="Mark completed"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(task.id, 2)}
                      className={`flex items-center justify-center h-8 w-8 rounded-md border text-sm transition-colors ${
                        task.status === 2
                          ? 'bg-destructive border-destructive text-primary-foreground'
                          : 'bg-card hover:bg-destructive/10 hover:border-destructive/40'
                      }`}
                      aria-label="Mark rejected"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveTask(task.id)}
                      className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Delete task"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
