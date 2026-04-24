'use client'

import { useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface InputFieldProps {
  label: string
  type: 'text' | 'email' | 'password'
  placeholder: string
  value: string
  onChange: (value: string) => void
  icon?: LucideIcon
  rightIcon?: React.ReactNode
  error?: string
  disabled?: boolean
  className?: string
}

export default function InputField({
  label,
  type,
  placeholder,
  value,
  onChange,
  icon: Icon,
  rightIcon,
  error,
  disabled = false,
  className,
}: InputFieldProps) {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div className={cn('flex flex-col gap-1.5 w-full', className)}>
      <label className="text-sm font-semibold text-[#374151] tracking-[0.01em]">
        {label}
      </label>
      <div
        className={cn(
          'flex items-center gap-2.5 bg-white rounded-[14px] px-4 h-[54px]',
          'border-[1.5px] transition-all duration-200',
          'shadow-[0_1px_2px_rgba(0,0,0,0.04)]',
          error
            ? 'border-[#F43F5E] shadow-[0_0_0_3px_rgba(244,63,94,0.10)]'
            : isFocused
              ? 'border-[#4F46E5] shadow-[0_0_0_3px_rgba(79,70,229,0.12),_0_1px_2px_rgba(0,0,0,0.04)]'
              : 'border-[#E5E7EB]',
          disabled && 'opacity-60 cursor-not-allowed bg-[#F9FAFB]'
        )}
      >
        {Icon && (
          <Icon
            size={18}
            className={cn(
              'shrink-0 transition-colors duration-200',
              isFocused && !error ? 'text-[#4F46E5]' : 'text-[#9CA3AF]'
            )}
          />
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            'flex-1 bg-transparent border-none outline-none',
            'text-[15px] font-medium text-[#111827]',
            'placeholder:text-[#D1D5DB]',
            'disabled:cursor-not-allowed'
          )}
          style={{ fontFamily: 'var(--font-nunito)' }}
        />
        {rightIcon && <div className="shrink-0">{rightIcon}</div>}
      </div>
      {error && (
        <div className="flex items-center gap-1 mt-0.5">
          <AlertCircle size={14} className="text-[#F43F5E] shrink-0" />
          <p className="text-xs text-[#F43F5E] font-medium">{error}</p>
        </div>
      )}
    </div>
  )
}
