import Image from 'next/image'
import { cn } from '@/lib/utils'
import { getIniciales } from '@/lib/utils'

interface AvatarProps {
  nombre: string
  apellido: string
  avatarUrl?: string | null
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeMap: Record<string, { px: number; text: string }> = {
  xs: { px: 24, text: 'text-xs' },
  sm: { px: 32, text: 'text-sm' },
  md: { px: 40, text: 'text-base' },
  lg: { px: 56, text: 'text-lg' },
  xl: { px: 80, text: 'text-2xl' },
}

export default function Avatar({
  nombre,
  apellido,
  avatarUrl,
  size = 'md',
  className,
}: AvatarProps) {
  const { px, text } = sizeMap[size]
  const iniciales = getIniciales(nombre, apellido)

  if (avatarUrl) {
    return (
      <div
        className={cn('relative rounded-full overflow-hidden shrink-0', className)}
        style={{ width: px, height: px }}
      >
        <Image
          src={avatarUrl}
          alt={`${nombre} ${apellido}`}
          width={px}
          height={px}
          className="object-cover w-full h-full"
        />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center shrink-0 font-semibold text-white',
        text,
        className
      )}
      style={{
        width: px,
        height: px,
        background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
      }}
    >
      {iniciales}
    </div>
  )
}
