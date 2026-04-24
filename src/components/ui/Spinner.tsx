import { cn } from '@/lib/utils'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'white' | 'muted'
  className?: string
}

const sizeMap: Record<string, number> = { sm: 16, md: 24, lg: 36 }

const colorMap: Record<string, string> = {
  primary: '#4F46E5',
  white:   '#FFFFFF',
  muted:   '#9CA3AF',
}

export default function Spinner({ size = 'md', color = 'primary', className }: SpinnerProps) {
  const px = sizeMap[size]
  const strokeColor = colorMap[color]

  return (
    <svg className={cn('animate-spin', className)} width={px} height={px} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke={strokeColor} strokeWidth={2.5} strokeOpacity={0.2} />
      <path
        d="M22 12a10 10 0 01-10 10"
        stroke={strokeColor}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
    </svg>
  )
}
