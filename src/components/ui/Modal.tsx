'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  showCloseButton?: boolean
}

const sizeStyles: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
}: ModalProps) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 animate-fade-in"
        style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={cn(
          'relative w-full bg-white p-6 animate-slide-up z-10',
          'rounded-t-[28px] sm:rounded-[24px]',
          sizeStyles[size],
          'sm:mx-4'
        )}
        style={{ boxShadow: '0 -8px 40px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.03)' }}
      >
        {/* Drag handle (mobile) */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-[#E5E7EB] sm:hidden" />

        {(title || showCloseButton) && (
          <div className="flex items-center justify-between mb-5">
            {title && (
              <h2
                className="text-[17px] font-extrabold text-[#111827]"
                style={{ fontFamily: 'var(--font-nunito)' }}
              >
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="ml-auto p-1.5 rounded-[10px] bg-[#F5F3FF] hover:bg-[#EEF2FF] transition-colors text-[#9CA3AF] hover:text-[#4F46E5] cursor-pointer active:scale-90"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
