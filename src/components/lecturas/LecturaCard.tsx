'use client'

import Image from 'next/image'
import { BookOpen, BookmarkPlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import ProgressBar from '@/components/ui/ProgressBar'
import type { LecturaConRelaciones } from '@/types/app.types'

interface LecturaCardProps {
  lectura: LecturaConRelaciones
  onPress?: () => void
  variant?: 'vertical' | 'horizontal'
  showProgress?: boolean
  progreso?: number
}

const COVER_GRADIENTS = [
  'linear-gradient(135deg, #667EEA, #764BA2)', // 0-1
  'linear-gradient(135deg, #F093FB, #F5576C)', // 2-3
  'linear-gradient(135deg, #4FACFE, #00F2FE)', // 4-5
  'linear-gradient(135deg, #43E97B, #38F9D7)', // 6-7
  'linear-gradient(135deg, #FA709A, #FEE140)', // 8-9
  'linear-gradient(135deg, #A18CD1, #FBC2EB)', // a-f
]

function getGradient(id: string): string {
  const last = id.slice(-1).toLowerCase()
  if (['0', '1'].includes(last)) return COVER_GRADIENTS[0]
  if (['2', '3'].includes(last)) return COVER_GRADIENTS[1]
  if (['4', '5'].includes(last)) return COVER_GRADIENTS[2]
  if (['6', '7'].includes(last)) return COVER_GRADIENTS[3]
  if (['8', '9'].includes(last)) return COVER_GRADIENTS[4]
  return COVER_GRADIENTS[5]
}

function getMateriaVariant(nombre: string): 'primary' | 'orange' | 'purple' | 'teal' | 'success' | 'error' | 'default' {
  const map: Record<string, 'primary' | 'orange' | 'purple' | 'teal' | 'success' | 'error'> = {
    'Matemática': 'primary',
    'Historia': 'orange',
    'Literatura': 'purple',
    'Biología': 'teal',
    'Ciencias': 'success',
    'Química': 'success',
    'Física': 'error',
  }
  return map[nombre] ?? 'default'
}

function PortadaPlaceholder({ id, className }: { id: string; className?: string }) {
  return (
    <div
      className={cn('flex items-center justify-center', className)}
      style={{ background: getGradient(id) }}
    >
      <BookOpen size={28} className="text-white drop-shadow-sm" />
    </div>
  )
}

export default function LecturaCard({
  lectura,
  onPress,
  variant = 'vertical',
  showProgress = false,
  progreso = 0,
}: LecturaCardProps) {
  if (variant === 'horizontal') {
    return (
      <div
        onClick={onPress}
        className={cn(
          'flex gap-3 p-3 bg-white rounded-[18px]',
          'shadow-[0_2px_8px_rgba(0,0,0,0.06),_0_0_0_1px_rgba(0,0,0,0.02)]',
          'transition-all duration-150',
          onPress && 'cursor-pointer active:scale-[0.98]'
        )}
      >
        {lectura.portada_url ? (
          <div className="relative w-[68px] h-[88px] rounded-[12px] overflow-hidden shrink-0 shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
            <Image src={lectura.portada_url} alt={lectura.titulo} fill className="object-cover" />
          </div>
        ) : (
          <PortadaPlaceholder id={lectura.id} className="w-[68px] h-[88px] rounded-[12px] shrink-0 shadow-[0_4px_12px_rgba(0,0,0,0.12)]" />
        )}

        <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
          <div>
            {lectura.materias && (
              <Badge variant={getMateriaVariant(lectura.materias.nombre)} size="sm">
                {lectura.materias.nombre}
              </Badge>
            )}
            <p className="text-[14px] font-bold text-[#111827] line-clamp-2 mt-1 leading-[1.3]">
              {lectura.titulo}
            </p>
            <p className="text-[12px] text-[#6B7280] font-medium mt-0.5 line-clamp-1">{lectura.autor}</p>
          </div>
          {showProgress && (
            <div className="mt-2">
              <ProgressBar value={progreso} size="sm" />
              <p className="text-[11px] text-[#9CA3AF] mt-0.5">{progreso}% completado</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Vertical variant
  return (
    <div
      onClick={onPress}
      className={cn(
        'w-[148px] shrink-0',
        'transition-transform duration-150',
        onPress && 'cursor-pointer active:scale-[0.95]'
      )}
    >
      <div className="relative w-full h-[196px] rounded-[16px] overflow-hidden shadow-[0_8px_20px_rgba(0,0,0,0.15)]">
        {lectura.portada_url ? (
          <Image src={lectura.portada_url} alt={lectura.titulo} fill className="object-cover" />
        ) : (
          <PortadaPlaceholder id={lectura.id} className="w-full h-full" />
        )}
        <button
          className="absolute top-2 right-2 rounded-full p-1.5 cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.12)] transition-transform active:scale-90"
          style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <BookmarkPlus size={14} className="text-[#374151]" />
        </button>
      </div>
      {lectura.materias && (
        <div className="mt-2">
          <Badge variant={getMateriaVariant(lectura.materias.nombre)} size="sm">
            {lectura.materias.nombre}
          </Badge>
        </div>
      )}
      <p className="text-[14px] font-bold text-[#111827] mt-1 line-clamp-2 leading-[1.3]">
        {lectura.titulo}
      </p>
      <p className="text-[12px] text-[#9CA3AF] font-medium mt-0.5 line-clamp-1">{lectura.autor}</p>
    </div>
  )
}
