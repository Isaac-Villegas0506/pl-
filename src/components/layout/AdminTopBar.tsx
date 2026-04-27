'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import type { ReactNode } from 'react'

interface AdminTopBarProps {
  title: string
  subtitle?: string
  showBack?: boolean
  onBack?: () => void
  rightContent?: ReactNode
}

export default function AdminTopBar({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightContent,
}: AdminTopBarProps) {
  const router = useRouter()
  const height = subtitle ? '68px' : '60px'

  function handleBack() {
    if (onBack) onBack()
    else router.back()
  }

  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 40,
      background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      height, padding: '0 16px',
      display: 'flex', alignItems: 'center',
      gap: '10px',
    }}>
      {showBack && (
        <button
          onClick={handleBack}
          style={{
            flexShrink: 0,
            width: '36px', height: '36px',
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <ChevronLeft size={20} color="white" strokeWidth={2.5} />
        </button>
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <h1 style={{
          fontSize: '17px', fontWeight: 800,
          color: 'white', lineHeight: 1.2,
        }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{
            fontSize: '12px', color: 'rgba(255,255,255,0.5)',
            marginTop: '2px', overflow: 'hidden',
            textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {subtitle}
          </p>
        )}
      </div>

      {rightContent && (
        <div style={{ flexShrink: 0 }}>
          {rightContent}
        </div>
      )}
    </div>
  )
}
