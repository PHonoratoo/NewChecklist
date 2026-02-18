'use client'

import { Button } from '@/components/ui/button'
import { TASK_CATEGORIES } from '@/lib/types'
import { X } from 'lucide-react'

interface CategoryFilterProps {
  selectedCategories: string[]
  onCategoriesChange: (categories: string[]) => void
}

export default function CategoryFilter({
  selectedCategories,
  onCategoriesChange,
}: CategoryFilterProps) {
  const handleToggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      onCategoriesChange(
        selectedCategories.filter((c) => c !== category)
      )
    } else {
      onCategoriesChange([...selectedCategories, category])
    }
  }

  const handleClearAll = () => {
    onCategoriesChange([])
  }

  return (
    <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Categorias</h3>
        {selectedCategories.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Limpar
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {TASK_CATEGORIES.map((category) => (
          <Button
            key={category.value}
            variant={
              selectedCategories.includes(category.value)
                ? 'default'
                : 'outline'
            }
            size="sm"
            onClick={() => handleToggleCategory(category.value)}
            className="text-xs"
          >
            {category.label}
            {selectedCategories.includes(category.value) && (
              <X className="ml-1 h-3 w-3" />
            )}
          </Button>
        ))}
      </div>

      {selectedCategories.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {selectedCategories.length} categoria{selectedCategories.length !== 1 ? 's' : ''} selecionada{selectedCategories.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
}
