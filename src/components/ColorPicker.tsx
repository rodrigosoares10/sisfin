'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  label?: string
}

const PRESET_COLORS = [
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#EF4444', // Red
  '#F59E0B', // Amber
  '#10B981', // Green
  '#14B8A6', // Teal
  '#6366F1', // Indigo
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#A855F7', // Purple
]

export default function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  const [customColor, setCustomColor] = useState(value)

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value
    setCustomColor(newColor)
    onChange(newColor)
  }

  return (
    <div className="space-y-3">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}

      {/* Preset Colors */}
      <div className="grid grid-cols-6 gap-2">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => {
              setCustomColor(color)
              onChange(color)
            }}
            className={cn(
              'w-10 h-10 rounded-lg border-2 transition-all duration-200',
              value === color
                ? 'border-gray-900 scale-110'
                : 'border-transparent hover:scale-105'
            )}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>

      {/* Custom Color Input */}
      <div className="flex items-center gap-3">
        <label className="text-sm text-gray-600">Cor personalizada:</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={customColor}
            onChange={handleCustomColorChange}
            className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
          />
          <input
            type="text"
            value={customColor}
            onChange={(e) => {
              const newColor = e.target.value
              if (/^#[0-9A-F]{6}$/i.test(newColor)) {
                setCustomColor(newColor)
                onChange(newColor)
              }
            }}
            placeholder="#000000"
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono uppercase"
            maxLength={7}
          />
        </div>
      </div>
    </div>
  )
}
