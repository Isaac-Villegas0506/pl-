import { cn } from '@/lib/utils'

interface PageWrapperProps {
  children: React.ReactNode
  className?: string
  noPadding?: boolean
}

export default function PageWrapper({
  children,
  className,
  noPadding = false,
}: PageWrapperProps) {
  return (
    <div
      className={cn(
        'max-w-md mx-auto min-h-screen bg-[#F0F4F8]',
        !noPadding && 'px-4 py-4',
        className
      )}
    >
      {children}
    </div>
  )
}
