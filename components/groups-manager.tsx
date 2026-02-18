'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, X } from 'lucide-react'
import type { Group } from '@/lib/types'

const GROUP_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
  '#8b5cf6', '#ec4899', '#06b6d4', '#f97316',
]

interface GroupsManagerProps {
  onGroupSelect?: (groupId: string | null) => void
  selectedGroupId?: string | null
}

export default function GroupsManager({
  onGroupSelect,
  selectedGroupId,
}: GroupsManagerProps) {
  const [groups, setGroups] = useState<Group[]>([])
  const [newGroupName, setNewGroupName] = useState('')
  const [selectedColor, setSelectedColor] = useState(GROUP_COLORS[0])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchGroups = useCallback(async () => {
    try {
      const res = await fetch('/api/groups')
      if (!res.ok) throw new Error('Failed to fetch groups')
      const data = await res.json()
      setGroups(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load groups')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchGroups()
  }, [fetchGroups])

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return
    setIsCreating(true)
    setError(null)

    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newGroupName.trim(),
          color: selectedColor,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create group')
      }

      const newGroup = await res.json()
      setGroups([...groups, newGroup])
      setNewGroupName('')
      setSelectedColor(GROUP_COLORS[0])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create group')
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Delete this group?')) return

    try {
      const res = await fetch(`/api/groups/${groupId}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete group')
      setGroups(groups.filter((g) => g.id !== groupId))
      if (selectedGroupId === groupId) {
        onGroupSelect?.(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete group')
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-base">Grupos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <Input
            placeholder="Novo grupo..."
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateGroup()}
            className="text-sm"
          />
          <div className="flex gap-1">
            {GROUP_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`h-9 w-9 rounded-md border-2 transition-all ${
                  selectedColor === color
                    ? 'border-gray-800 scale-110'
                    : 'border-gray-200'
                }`}
                style={{ backgroundColor: color }}
                aria-label={`Select color ${color}`}
              />
            ))}
          </div>
          <Button
            onClick={handleCreateGroup}
            disabled={isCreating || !newGroupName.trim()}
            size="sm"
            className="shrink-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {isLoading ? (
          <div className="text-sm text-muted-foreground">Carregando...</div>
        ) : groups.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            Nenhum grupo criado
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onGroupSelect?.(null)}
              className={`px-3 py-1.5 rounded-full text-sm transition-all border-2 ${
                selectedGroupId === null
                  ? 'bg-gray-200 border-gray-400'
                  : 'bg-gray-100 border-gray-200 hover:border-gray-300'
              }`}
            >
              Todos
            </button>
            {groups.map((group) => (
              <div
                key={group.id}
                className="flex items-center gap-1 bg-gray-100 border border-gray-200 rounded-full px-3 py-1.5 group/item hover:bg-gray-200 transition-colors"
              >
                <button
                  onClick={() => onGroupSelect?.(group.id)}
                  className={`text-sm transition-all ${
                    selectedGroupId === group.id
                      ? 'font-semibold'
                      : 'font-normal'
                  }`}
                  style={{
                    color: group.color,
                  }}
                >
                  {group.name}
                </button>
                <button
                  onClick={() => handleDeleteGroup(group.id)}
                  className="opacity-0 group-hover/item:opacity-100 transition-opacity"
                  aria-label="Delete group"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
