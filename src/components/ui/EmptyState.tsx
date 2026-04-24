'use client'

import Button from './Button'
import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      {Icon && (
        <div
          className="w-20 h-20 rounded-[20px] flex items-center justify-center mb-4"
          style={{ background: 'linear-gradient(135deg, #EEF2FF, #F5F3FF)' }}
        >
          <Icon size={36} className="text-[#A5B4FC]" />
        </div>
      )}
      <h3 className="text-[16px] font-bold text-[#111827]">{title}</h3>
      {description && (
        <p className="text-sm text-[#9CA3AF] mt-1.5 max-w-xs leading-relaxed">{description}</p>
      )}
      {action && (
        <div className="mt-5">
          <Button variant="secondary" size="md" onClick={action.onClick}>
            {action.label}
          </Button>
        </div>
      )}
    </div>
  )
}
