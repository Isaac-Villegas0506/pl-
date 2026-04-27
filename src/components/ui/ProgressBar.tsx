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
    <div style={{ width: '100%' }}>
      {showLabel && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '4px' }}>
          <span style={{ fontSize: '12px', fontWeight: 'bold', color: labelColors[color] }}>
            {clamped}%
          </span>
        </div>
      )}
      <div
        style={{
          width: '100%',
          borderRadius: '9999px',
          overflow: 'hidden',
          background: '#E5E7EB',
          height: size === 'sm' ? '6px' : '8px',
        }}
      >
        <div
          style={{
            height: '100%',
            borderRadius: '9999px',
            width: `${clamped}%`,
            background: gradients[color],
            transition: 'width 0.8s cubic-bezier(0.16,1,0.3,1)',
          }}
        />
      </div>
    </div>
  )
}
