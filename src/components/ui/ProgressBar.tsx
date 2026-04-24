import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number
  color?: 'primary' | 'success' | 'warning'
  size?: 'sm' | 'md'
  showLabel?: boolean
  className?: string
}

const gradients: Record<string, string> = {
  primary: 'linear-gradient(90deg, #4F46E5, #7C3AED)',
  success: 'linear-gradient(90deg, #10B981, #059669)',
  warning: 'linear-gradient(90deg, #F59E0B, #D97706)',
}

const labelColors: Record<string, string> = {
  primary: '#4F46E5',
  success: '#059669',
  warning: '#D97706',
}

export default function ProgressBar({
  value,
  color = 'primary',
  size = 'md',
  showLabel = false,
  className,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value))

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-end mb-1">
          <span className="text-xs font-bold" style={{ color: labelColors[color] }}>
            {clamped}%
          </span>
        </div>
      )}
      <div
        className={cn(
          'w-full rounded-full overflow-hidden bg-[#E5E7EB]',
          size === 'sm' ? 'h-1.5' : 'h-2'
        )}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${clamped}%`,
            background: gradients[color],
            transition: 'width 0.8s cubic-bezier(0.16,1,0.3,1)',
          }}
        />
      </div>
    </div>
  )
}
