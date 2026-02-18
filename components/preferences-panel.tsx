'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings, X } from 'lucide-react'
import { COLOR_PRESETS, FONT_FAMILIES } from '@/lib/types'

interface PreferencesPanelProps {
  onClose?: () => void
}

interface Preferences {
  primary_color: string
  secondary_color: string
  accent_color: string
  font_family: string
  border_radius: number
  dark_mode: boolean
}

export default function PreferencesPanel({ onClose }: PreferencesPanelProps) {
  const [preferences, setPreferences] = useState<Preferences>({
    primary_color: '#0ea5e9',
    secondary_color: '#06b6d4',
    accent_color: '#0891b2',
    font_family: 'geist',
    border_radius: 8,
    dark_mode: false,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const res = await fetch('/api/preferences')
        if (res.ok) {
          const data = await res.json()
          setPreferences(data)
        }
      } catch (err) {
        console.error('Failed to fetch preferences:', err)
      }
    }

    fetchPreferences()
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const res = await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      })

      if (!res.ok) {
        throw new Error('Failed to save preferences')
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)

      // Apply theme to document
      applyTheme(preferences)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setIsSaving(false)
    }
  }

  const applyTheme = (prefs: Preferences) => {
    const root = document.documentElement
    root.style.setProperty('--primary', prefs.primary_color)
    root.style.setProperty('--secondary', prefs.secondary_color)
    root.style.setProperty('--accent', prefs.accent_color)
    root.style.setProperty('--radius', `${prefs.border_radius / 16}rem`)

    if (prefs.dark_mode) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }

  const handleApplyPreset = (preset: (typeof COLOR_PRESETS)[0]) => {
    setPreferences({
      ...preferences,
      primary_color: preset.primary,
      secondary_color: preset.secondary,
      accent_color: preset.accent,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in">
      <Card className="w-full max-w-md animate-in slide-in-from-bottom">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <CardTitle>Preferências</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-6 w-6"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Color Presets */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Temas de Cores</label>
            <div className="grid grid-cols-2 gap-2">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => handleApplyPreset(preset)}
                  className="p-3 border-2 rounded-md hover:border-gray-400 transition-all flex items-center gap-2"
                >
                  <div className="flex gap-1">
                    <div
                      className="h-4 w-4 rounded"
                      style={{ backgroundColor: preset.primary }}
                    />
                    <div
                      className="h-4 w-4 rounded"
                      style={{ backgroundColor: preset.secondary }}
                    />
                  </div>
                  <span className="text-xs font-medium">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Primary Color */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Cor Principal</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={preferences.primary_color}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    primary_color: e.target.value,
                  })
                }
                className="h-10 w-16 rounded border cursor-pointer"
              />
              <input
                type="text"
                value={preferences.primary_color}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    primary_color: e.target.value,
                  })
                }
                className="flex-1 px-2 py-1 text-xs border rounded font-mono"
              />
            </div>
          </div>

          {/* Secondary Color */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Cor Secundária</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={preferences.secondary_color}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    secondary_color: e.target.value,
                  })
                }
                className="h-10 w-16 rounded border cursor-pointer"
              />
              <input
                type="text"
                value={preferences.secondary_color}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    secondary_color: e.target.value,
                  })
                }
                className="flex-1 px-2 py-1 text-xs border rounded font-mono"
              />
            </div>
          </div>

          {/* Accent Color */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Cor de Destaque</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={preferences.accent_color}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    accent_color: e.target.value,
                  })
                }
                className="h-10 w-16 rounded border cursor-pointer"
              />
              <input
                type="text"
                value={preferences.accent_color}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    accent_color: e.target.value,
                  })
                }
                className="flex-1 px-2 py-1 text-xs border rounded font-mono"
              />
            </div>
          </div>

          {/* Font Family */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Fonte</label>
            <select
              value={preferences.font_family}
              onChange={(e) =>
                setPreferences({
                  ...preferences,
                  font_family: e.target.value,
                })
              }
              className="w-full px-2 py-2 text-sm border rounded-md bg-white"
            >
              {FONT_FAMILIES.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.label}
                </option>
              ))}
            </select>
          </div>

          {/* Border Radius */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Raio das Bordas</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="32"
                value={preferences.border_radius}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    border_radius: parseInt(e.target.value),
                  })
                }
                className="flex-1"
              />
              <span className="text-xs font-mono w-8 text-right">
                {preferences.border_radius}px
              </span>
            </div>
          </div>

          {/* Dark Mode */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Modo Escuro</label>
            <button
              onClick={() =>
                setPreferences({
                  ...preferences,
                  dark_mode: !preferences.dark_mode,
                })
              }
              className={`relative h-6 w-11 rounded-full transition-colors ${
                preferences.dark_mode ? 'bg-primary' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                  preferences.dark_mode ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Messages */}
          {error && (
            <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}
          {success && (
            <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
              Preferências salvas com sucesso!
            </div>
          )}

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full"
            size="sm"
          >
            {isSaving ? 'Salvando...' : 'Salvar Preferências'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
