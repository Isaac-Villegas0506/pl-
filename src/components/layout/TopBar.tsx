'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TopBarProps {
  title: string
  showBack?: boolean
  onBack?: () => void
  rightContent?: React.ReactNode
  transparent?: boolean
}

export default function TopBar({
  title,
  showBack = false,
  onBack,
  rightContent,
  transparent = false,
}: TopBarProps) {
  const router = useRouter()

  function handleBack() {
    if (onBack) onBack()
    else router.back()
  }

  return (
    <header
      className={cn('sticky top-0 z-40 h-14')}
      style={
        transparent
          ? { background: 'transparent' }
          : {
              background: 'rgba(255,255,255,0.92)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              borderBottom: '1px solid rgba(229,231,235,0.5)',
            }
      }
    >
      <div className="max-w-md mx-auto flex items-center h-full gap-3 px-4">
        {showBack && (
          <button
            onClick={handleBack}
            className={cn(
              'cursor-pointer rounded-[12px] p-2',
              'bg-[#F5F3FF] active:scale-90 transition-transform duration-100',
              'shadow-[0_1px_3px_rgba(0,0,0,0.06)]'
            )}
          >
            <ChevronLeft size={20} className="text-[#4F46E5]" />
          </button>
        )}
        <h1
          className={cn(
            'flex-1 text-[17px] font-extrabold text-[#111827]',
            !showBack && !rightContent ? 'text-center' : '',
            showBack ? 'text-center -mr-[44px]' : ''
          )}
          style={{ fontFamily: 'var(--font-nunito)' }}
        >
          {title}
        </h1>
        {rightContent && <div className="shrink-0">{rightContent}</div>}
      </div>
    </header>
  )
}
