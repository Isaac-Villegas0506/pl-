'use client'

import Image from 'next/image'
import { BookOpen } from 'lucide-react'
import ProgressBar from '@/components/ui/ProgressBar'
import { obtenerGradientePortada } from '@/lib/utils'
import type { LecturaConRelaciones } from '@/types/app.types'

interface LecturaCardHorizontalLargeProps {
  lectura: LecturaConRelaciones
  progreso: number
  capitulo?: number
  onPress?: () => void
}

const coloresBadge: Record<string, { color: string; bg: string }> = {
  'Literatura':  { color: '#7C3AED', bg: '#F5F3FF' },
  'Fantasía':    { color: '#F97316', bg: '#FFF7ED' },
  'Ciencias':    { color: '#059669', bg: '#ECFDF5' },
  'Historia':    { color: '#D97706', bg: '#FEF3C7' },
  'Biología':    { color: '#0891B2', bg: '#ECFEFF' },
  'Matemática':  { color: '#4F46E5', bg: '#EEF2FF' },
  'Física':      { color: '#DC2626', bg: '#FEF2F2' },
  'Filosofía':   { color: '#0369A1', bg: '#F0F9FF' },
}

export default function LecturaCardHorizontalLarge({
  lectura,
  progreso,
  capitulo,
  onPress,
}: LecturaCardHorizontalLargeProps) {
  const catNombre = lectura.categorias?.nombre ?? lectura.materias?.nombre ?? ''
  const badge = coloresBadge[catNombre] ?? { color: '#4F46E5', bg: '#EEF2FF' }
  const gradient = obtenerGradientePortada(lectura.id)

  return (
    <div
      onClick={onPress}
      style={{
        display: 'flex', gap: '14px',
        background: 'white',
        borderRadius: '20px',
        padding: '14px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
        cursor: onPress ? 'pointer' : 'default',
        border: '1px solid rgba(0,0,0,0.03)',
        transition: 'transform 0.15s, box-shadow 0.15s',
        WebkitTapHighlightColor: 'transparent',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-1px)'
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.10)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'
      }}
    >
      {/* IMAGEN / PORTADA */}
      <div style={{
        width: '88px', height: '108px',
        borderRadius: '14px',
        overflow: 'hidden', flexShrink: 0,
        position: 'relative',
        background: gradient,
        boxShadow: '0 6px 16px rgba(0,0,0,0.18)',
      }}>
        {lectura.portada_url ? (
          <Image
            src={lectura.portada_url}
            alt={lectura.titulo}
            fill
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <BookOpen size={32} color="rgba(255,255,255,0.85)" strokeWidth={1.2} />
          </div>
        )}
      </div>

      {/* CONTENIDO DERECHO */}
      <div style={{
        flex: 1, minWidth: 0,
        display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '4px',
      }}>
        {/* BADGE CATEGORÍA */}
        {catNombre && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            fontSize: '10px', fontWeight: 800,
            letterSpacing: '0.06em', textTransform: 'uppercase',
            color: badge.color,
            background: badge.bg,
            borderRadius: '6px',
            padding: '3px 8px',
            alignSelf: 'flex-start',
          }}>
            <span style={{
              width: '5px', height: '5px',
              background: 'currentColor', borderRadius: '50%',
            }} />
            {catNombre}
          </span>
        )}

        {/* TÍTULO */}
        <p style={{
          fontFamily: 'var(--font-playfair, serif)',
          fontSize: '17px', fontWeight: 700,
          color: '#111827', lineHeight: '1.25',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          marginTop: '4px',
        }}>
          {lectura.titulo}
        </p>

        {/* AUTOR */}
        <p style={{
          fontSize: '13px', color: '#6B7280', fontWeight: 500,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {lectura.autor}
        </p>

        {/* BARRA DE PROGRESO */}
        <div style={{ marginTop: '6px' }}>
          <ProgressBar value={progreso} size="sm" color="primary" />
        </div>

        {/* FILA INFERIOR */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '2px',
        }}>
          <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 500 }}>
            {progreso}% completado
          </span>
          {capitulo !== undefined && (
            <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 500 }}>
              Cap. {capitulo}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
