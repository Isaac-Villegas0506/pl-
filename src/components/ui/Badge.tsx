import { cn } from '@/lib/utils'

interface BadgeProps {
  variant?: 'primary' | 'orange' | 'purple' | 'teal' | 'success' | 'error' | 'default' | 'rose' | 'sky' | 'amber' | 'emerald' | 'violet'
  size?: 'sm' | 'md'
  children: React.ReactNode
  className?: string
}

const variantConfig: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  primary:  { bg: '#EEF2FF', text: '#4F46E5', border: '#C7D2FE', dot: '#4F46E5' },
  orange:   { bg: '#FFF7ED', text: '#C2410C', border: '#FED7AA', dot: '#F97316' },
  purple:   { bg: '#F5F3FF', text: '#7C3AED', border: '#DDD6FE', dot: '#8B5CF6' },
  violet:   { bg: '#F5F3FF', text: '#7C3AED', border: '#DDD6FE', dot: '#8B5CF6' },
  teal:     { bg: '#F0FDFA', text: '#0F766E', border: '#99F6E4', dot: '#14B8A6' },
  success:  { bg: '#ECFDF5', text: '#065F46', border: '#A7F3D0', dot: '#10B981' },
  emerald:  { bg: '#ECFDF5', text: '#065F46', border: '#A7F3D0', dot: '#10B981' },
  error:    { bg: '#FFF1F2', text: '#BE123C', border: '#FECDD3', dot: '#F43F5E' },
  rose:     { bg: '#FFF1F2', text: '#BE123C', border: '#FECDD3', dot: '#F43F5E' },
  sky:      { bg: '#F0F9FF', text: '#0369A1', border: '#BAE6FD', dot: '#0EA5E9' },
  amber:    { bg: '#FFFBEB', text: '#92400E', border: '#FDE68A', dot: '#F59E0B' },
  default:  { bg: '#F3F4F6', text: '#4B5563', border: '#E5E7EB', dot: '#9CA3AF' },
}

export default function Badge({ variant = 'default', size = 'sm', children, className }: BadgeProps) {
  const config = variantConfig[variant] ?? variantConfig.default

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-semibold rounded-[6px]',
        size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1',
        className
      )}
      style={{
        backgroundColor: config.bg,
        color: config.text,
        border: `1px solid ${config.border}`,
      }}
    >
      <span
        className="inline-block w-[5px] h-[5px] rounded-full shrink-0"
        style={{ backgroundColor: config.dot }}
      />
      {children}
    </span>
  )
}
