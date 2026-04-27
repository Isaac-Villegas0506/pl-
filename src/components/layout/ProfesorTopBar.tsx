'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import type { ReactNode } from 'react'

interface ProfesorTopBarProps {
  title: string
  subtitle?: string
  showBack?: boolean
  onBack?: () => void
  rightContent?: ReactNode
}

export default function ProfesorTopBar({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightContent,
}: ProfesorTopBarProps) {
  const router = useRouter()
  const height = subtitle ? '68px' : '60px'

  function handleBack() {
    if (onBack) onBack()
    else router.back()
  }

  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 40,
      background: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(229,231,235,0.5)',
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
            background: '#F5F3FF', border: 'none',
            borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <ChevronLeft size={20} color="#111827" strokeWidth={2.5} />
        </button>
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <h1 style={{
          fontSize: '17px', fontWeight: 800,
          color: '#111827', lineHeight: 1.2,
        }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{
            fontSize: '12px', color: '#9CA3AF',
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
