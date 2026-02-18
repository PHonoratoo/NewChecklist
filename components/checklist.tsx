"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, X, Plus, Trash2 } from "lucide-react"
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js"

type Task = {
  id: string
  title: string
  status: number // 0 = nenhum, 1 = concluido, 2 = rejeitado
  user_id: string
  created_at: string
}

export default function Checklist({ userId }: { userId: string }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTaskText, setNewTaskText] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [latency, setLatency] = useState<number | null>(null)

  const supabase = useMemo(() => createClient(), [])

  // Medir latência periodicamente
  useEffect(() => {
    const measureLatency = async () => {
      try {
        const startTime = performance.now()
        
        // Faz um query vazio (muito rápido) para medir latência
        await supabase
          .from("tasks")
          .select("count", { count: "exact" })
          .limit(1)
        
        const endTime = performance.now()
        const latencyMs = Math.round(endTime - startTime)
        setLatency(latencyMs)
      } catch (err) {
        console.error("Erro ao medir latência:", err)
      }
    }

    // Medir latência a cada 5 segundos
    const interval = setInterval(measureLatency, 5000)
    
    // Medir uma vez ao montar
    measureLatency()

    return () => clearInterval(interval)
  }, [supabase])

  // Fetch initial tasks
  useEffect(() => {
    async function fetchTasks() {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true })

      if (error) {
        setError("Nao foi possivel carregar as tarefas.")
        console.error(error)
      } else {
        setTasks(data ?? [])
      }
      setIsLoading(false)
    }

    if (userId) {
      fetchTasks()
    }
  }, [supabase, userId])

  // Subscribe to Realtime changes
  useEffect(() => {
    if (!userId) {
      console.log("userId não disponível para realtime")
      return
    }

    console.log("Conectando ao Realtime para userId:", userId)

    const channel = supabase
      .channel(`tasks-realtime-${userId}`)
      .on(
        "postgres_changes",
        { 
          event: "*", 
          schema: "public", 
          table: "tasks"
        },
        (payload: RealtimePostgresChangesPayload<Task>) => {
          console.log("Evento Realtime recebido:", payload)
          
          if (payload.eventType === "INSERT") {
            const newTask = payload.new as Task
            console.log("Tarefa inserida:", newTask)
            setTasks((prev) => {
              const exists = prev.some((t) => t.id === newTask.id)
              return exists ? prev : [...prev, newTask]
            })
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new as Task
            console.log("Tarefa atualizada:", updated)
            setTasks((prev) =>
              prev.map((t) => (t.id === updated.id ? updated : t))
            )
          } else if (payload.eventType === "DELETE") {
            const deleted = payload.old as Partial<Task>
            console.log("Tarefa deletada:", deleted)
            setTasks((prev) => prev.filter((t) => t.id !== deleted.id))
          }
        }
      )
      .subscribe((status) => {
        console.log("Status da subscrição Realtime:", status)
      })

    return () => {
      console.log("Desconectando do canal Realtime")
      supabase.removeChannel(channel)
    }
  }, [supabase, userId])

  const addTask = useCallback(async () => {
    if (newTaskText.trim() === "") return
    setError(null)

    console.log("Adicionando tarefa...")
    const { data, error } = await supabase.from("tasks").insert({
      title: newTaskText.trim(),
      status: 0,
      user_id: userId,
    }).select()

    if (error) {
      console.error("ERRO ao adicionar:", error)
      setError("Nao foi possivel adicionar a tarefa.")
      return
    }

    console.log("Tarefa adicionada com sucesso:", data)
    
    // Refetch manual para atualizar UI (enquanto Realtime não funciona para INSERT)
    const { data: updatedTasks } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
    
    if (updatedTasks) {
      setTasks(updatedTasks)
    }
    
    setNewTaskText("")
  }, [newTaskText, userId, supabase])

  const toggleStatus = useCallback(
    async (id: string, desiredStatus: number) => {
      const task = tasks.find((t) => t.id === id)
      if (!task) return

      const updatedStatus = task.status === desiredStatus ? 0 : desiredStatus
      setError(null)

      console.log("Atualizando tarefa:", id, "para status:", updatedStatus)
      const { error } = await supabase
        .from("tasks")
        .update({ status: updatedStatus })
        .eq("id", id)

      if (error) {
        console.error("ERRO ao atualizar:", error)
        setError("Nao foi possivel atualizar a tarefa.")
      } else {
        console.log("Tarefa atualizada com sucesso")
        
        // Atualizar localmente de imediato (enquanto Realtime não funciona para UPDATE)
        setTasks((prev) =>
          prev.map((t) =>
            t.id === id ? { ...t, status: updatedStatus } : t
          )
        )
      }
    },
    [tasks, supabase]
  )

  const removeTask = useCallback(
    async (id: string) => {
      setError(null)

      const { error } = await supabase.from("tasks").delete().eq("id", id)

      if (error) {
        console.error(error)
        setError("Nao foi possivel remover a tarefa.")
      }
    },
    [supabase]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") addTask()
    },
    [addTask]
  )

  const completedCount = tasks.filter((t) => t.status === 1).length

  return (
    <Card className="shadow-sm border">
      <CardHeader className="border-b pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Minhas Tarefas</CardTitle>
          <div className="flex items-center gap-4">
            {tasks.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {completedCount}/{tasks.length} concluidas
              </span>
            )}
            {latency !== null && (
              <span className={`text-xs px-2 py-1 rounded-full font-mono ${
                latency < 50 ? 'bg-green-100 text-green-700' :
                latency < 100 ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                ⚡ {latency}ms
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-5">
        <div className="flex gap-2 mb-5">
          <Input
            placeholder="Escreva sua nova tarefa..."
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="focus-visible:ring-2 focus-visible:ring-primary"
          />
          <Button
            onClick={addTask}
            disabled={newTaskText.trim() === ""}
            className="shrink-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="sr-only sm:not-sr-only">Adicionar</span>
          </Button>
        </div>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 mb-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-pulse text-muted-foreground text-sm">
              Carregando tarefas...
            </div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-sm rounded-md border border-dashed">
            Nenhuma tarefa adicionada ainda.
          </div>
        ) : (
          <ul className="flex flex-col gap-2" role="list">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="flex items-center gap-2 p-3 rounded-md border bg-card transition-colors hover:bg-accent/50"
              >
                <span
                  className={`flex-1 break-words text-sm ${
                    task.status === 1
                      ? "line-through text-muted-foreground"
                      : ""
                  }`}
                >
                  {task.title}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => toggleStatus(task.id, 1)}
                    className={`flex items-center justify-center h-8 w-8 rounded-md border text-sm transition-colors ${
                      task.status === 1
                        ? "bg-primary border-primary text-primary-foreground"
                        : "bg-card hover:bg-primary/10 hover:border-primary/40"
                    }`}
                    aria-label="Marcar como concluido"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => toggleStatus(task.id, 2)}
                    className={`flex items-center justify-center h-8 w-8 rounded-md border text-sm transition-colors ${
                      task.status === 2
                        ? "bg-destructive border-destructive text-primary-foreground"
                        : "bg-card hover:bg-destructive/10 hover:border-destructive/40"
                    }`}
                    aria-label="Marcar como rejeitado"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTask(task.id)}
                    className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                    aria-label="Remover tarefa"
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
  )
}
