import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddingStyles: Record<string, string> = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
}

export default function Card({
  children,
  className,
  onClick,
  hover = false,
  padding = 'md',
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-[20px] overflow-hidden',
        'shadow-[0_2px_8px_rgba(0,0,0,0.06),_0_0_0_1px_rgba(0,0,0,0.02)]',
        paddingStyles[padding],
        hover && [
          'transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]',
          'hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)] hover:-translate-y-[1px]',
        ],
        onClick && 'cursor-pointer active:scale-[0.98] transition-transform duration-150',
        className
      )}
    >
      {children}
    </div>
  )
}
