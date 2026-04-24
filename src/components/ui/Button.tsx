'use client'

import { cn } from '@/lib/utils'

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
  disabled?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  className?: string
  children: React.ReactNode
}

const variantStyles: Record<string, string> = {
  primary: [
    'text-white font-bold border-none',
    'shadow-[0_4px_14px_rgba(79,70,229,0.35)]',
    'hover:brightness-110 hover:shadow-[0_6px_20px_rgba(79,70,229,0.45)]',
    'active:scale-[0.97] active:shadow-[0_2px_8px_rgba(79,70,229,0.25)]',
  ].join(' '),
  secondary: [
    'bg-[#EEF2FF] text-[#4F46E5] font-bold border-none',
    'hover:bg-[#E0E7FF]',
    'active:scale-[0.97]',
  ].join(' '),
  ghost: [
    'bg-transparent text-[#6B7280] border-none',
    'hover:bg-[#F5F3FF] hover:text-[#4F46E5]',
    'active:scale-[0.97]',
  ].join(' '),
  danger: [
    'text-white font-bold border-none',
    'shadow-[0_4px_14px_rgba(244,63,94,0.35)]',
    'hover:brightness-110',
    'active:scale-[0.97]',
  ].join(' '),
  outline: [
    'bg-white text-[#374151] font-semibold',
    'border-[1.5px] border-[#E5E7EB]',
    'hover:border-[#4F46E5] hover:text-[#4F46E5] hover:bg-[#F5F3FF]',
    'active:scale-[0.97]',
  ].join(' '),
}

const sizeStyles: Record<string, string> = {
  sm: 'h-9 px-4 text-sm gap-1.5',
  md: 'h-12 px-5 text-sm gap-2',
  lg: 'h-14 px-6 text-base gap-2',
}

const gradientStyles: Record<string, string> = {
  primary: 'background: linear-gradient(135deg, #4F46E5, #6D28D9)',
  danger:  'background: linear-gradient(135deg, #F43F5E, #E11D48)',
}

function LoadingSpinner({ size }: { size: 'sm' | 'md' | 'lg' }) {
  const px = size === 'lg' ? 20 : size === 'md' ? 18 : 16
  return (
    <svg className="animate-spin" width={px} height={px} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
      <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
    </svg>
  )
}

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled = false,
  onClick,
  type = 'button',
  className,
  children,
}: ButtonProps) {
  const isDisabled = disabled || isLoading
  const needsGradient = variant === 'primary' || variant === 'danger'

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      style={needsGradient ? {
        background: variant === 'primary'
          ? 'linear-gradient(135deg, #4F46E5, #6D28D9)'
          : 'linear-gradient(135deg, #F43F5E, #E11D48)'
      } : undefined}
      className={cn(
        'inline-flex items-center justify-center rounded-[14px]',
        'transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]',
        'outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#4F46E5]',
        'tracking-[0.01em] cursor-pointer',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        isDisabled && 'opacity-60 cursor-not-allowed pointer-events-none',
        className
      )}
    >
      {isLoading ? <LoadingSpinner size={size} /> : leftIcon}
      {children}
      {!isLoading && rightIcon}
    </button>
  )
}
