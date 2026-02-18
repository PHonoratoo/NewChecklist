export type Task = {
  id: string
  title: string
  status: number // 0 = pending, 1 = completed, 2 = rejected
  user_id: string
  group_id?: string | null
  category?: string | null
  due_date?: string | null
  created_at: string
  updated_at?: string
}

export type Group = {
  id: string
  user_id: string
  name: string
  color: string
  created_at: string
  updated_at: string
}

export type UserPreferences = {
  id: string
  user_id: string
  primary_color: string
  secondary_color: string
  accent_color: string
  font_family: string
  border_radius: number
  dark_mode: boolean
  created_at: string
  updated_at: string
}

export const TASK_CATEGORIES = [
  { value: 'daily', label: 'Diária' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'monthly', label: 'Mensal' },
  { value: 'personal', label: 'Pessoal' },
  { value: 'work', label: 'Trabalho' },
  { value: 'shopping', label: 'Compras' },
  { value: 'other', label: 'Outro' },
]

export const COLOR_PRESETS = [
  { name: 'Ocean', primary: '#0ea5e9', secondary: '#06b6d4', accent: '#0891b2' },
  { name: 'Forest', primary: '#10b981', secondary: '#34d399', accent: '#6ee7b7' },
  { name: 'Sunset', primary: '#f97316', secondary: '#fb923c', accent: '#fdba74' },
  { name: 'Purple', primary: '#a855f7', secondary: '#d946ef', accent: '#f0abfc' },
  { name: 'Rose', primary: '#ec4899', secondary: '#f43f5e', accent: '#fb7185' },
]

export const FONT_FAMILIES = [
  { value: 'geist', label: 'Geist (Default)' },
  { value: 'inter', label: 'Inter' },
  { value: 'poppins', label: 'Poppins' },
  { value: 'playfair', label: 'Playfair Display' },
]
