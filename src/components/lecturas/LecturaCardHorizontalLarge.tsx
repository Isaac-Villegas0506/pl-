'use client'

import Image from 'next/image'
import { BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import ProgressBar from '@/components/ui/ProgressBar'
import type { LecturaConRelaciones } from '@/types/app.types'

interface LecturaCardHorizontalLargeProps {
  lectura: LecturaConRelaciones
  progreso: number
  capitulo?: number
  onPress?: () => void
}

const COVER_GRADIENTS = [
  'linear-gradient(135deg, #667EEA, #764BA2)',
  'linear-gradient(135deg, #F093FB, #F5576C)',
  'linear-gradient(135deg, #4FACFE, #00F2FE)',
  'linear-gradient(135deg, #43E97B, #38F9D7)',
  'linear-gradient(135deg, #FA709A, #FEE140)',
  'linear-gradient(135deg, #A18CD1, #FBC2EB)',
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

const CATEGORIA_COLORS: Record<string, string> = {
  'Literatura':  '#7C3AED',
  'Ciencias':    '#059669',
  'Historia':    '#C2410C',
  'Matemática':  '#4F46E5',
  'Filosofía':   '#0369A1',
}

export default function LecturaCardHorizontalLarge({
  lectura,
  progreso,
  capitulo,
  onPress,
}: LecturaCardHorizontalLargeProps) {
  const catColor = lectura.categorias
    ? (CATEGORIA_COLORS[lectura.categorias.nombre] ?? '#F97316')
    : '#F97316'

  return (
    <div
      onClick={onPress}
      className={cn(
        'flex gap-3 p-3.5 bg-white rounded-[20px]',
        'shadow-[0_4px_16px_rgba(0,0,0,0.08)]',
        'transition-all duration-150',
        onPress && 'cursor-pointer active:scale-[0.98]'
      )}
    >
      {/* Cover */}
      {lectura.portada_url ? (
        <div className="relative w-[88px] h-[108px] rounded-[14px] overflow-hidden shrink-0 shadow-[0_6px_16px_rgba(0,0,0,0.15)]">
          <Image
            src={lectura.portada_url}
            alt={lectura.titulo}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div
          className="w-[88px] h-[108px] rounded-[14px] shrink-0 flex items-center justify-center shadow-[0_6px_16px_rgba(0,0,0,0.15)]"
          style={{ background: getGradient(lectura.id) }}
        >
          <BookOpen size={32} className="text-white drop-shadow-sm" />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col min-w-0 py-0.5">
        {lectura.categorias && (
          <span
            className="text-[10px] font-extrabold uppercase tracking-[0.08em]"
            style={{ color: catColor }}
          >
            {lectura.categorias.nombre}
          </span>
        )}
        <p
          className="text-[17px] font-bold text-[#111827] mt-0.5 line-clamp-2 leading-[1.25]"
          style={{ fontFamily: 'var(--font-playfair)' }}
        >
          {lectura.titulo}
        </p>
        <p className="text-[13px] text-[#6B7280] font-medium mt-0.5 line-clamp-1">
          {lectura.autor}
        </p>
        <div className="mt-2">
          <ProgressBar value={progreso} color="primary" size="sm" />
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[11px] text-[#9CA3AF]">{progreso}% completado</span>
          {capitulo !== undefined && (
            <span className="text-[11px] text-[#9CA3AF]">Cap. {capitulo}</span>
          )}
        </div>
      </div>
    </div>
  )
}
