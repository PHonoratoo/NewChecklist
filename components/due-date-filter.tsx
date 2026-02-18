'use client'

import { Button } from '@/components/ui/button'
import { Calendar } from 'lucide-react'

type DateFilter = 'all' | 'overdue' | 'today' | 'week' | 'month'

interface DueDateFilterProps {
  selectedFilter: DateFilter
  onFilterChange: (filter: DateFilter) => void
}

export default function DueDateFilter({
  selectedFilter,
  onFilterChange,
}: DueDateFilterProps) {
  const filters: { value: DateFilter; label: string }[] = [
    { value: 'all', label: 'Todas' },
    { value: 'overdue', label: 'Atrasadas' },
    { value: 'today', label: 'Hoje' },
    { value: 'week', label: 'Esta Semana' },
    { value: 'month', label: 'Este Mês' },
  ]

  return (
    <div className="space-y-2 p-4 border rounded-lg bg-muted/50">
      <div className="flex items-center gap-2 mb-2">
        <Calendar className="h-4 w-4" />
        <h3 className="text-sm font-semibold">Datas de Vencimento</h3>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {filters.map((filter) => (
          <Button
            key={filter.value}
            variant={selectedFilter === filter.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFilterChange(filter.value)}
            className="text-xs justify-start"
          >
            {filter.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
