'use client'

import Image from 'next/image'
import { BookOpen, BookmarkPlus } from 'lucide-react'
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

export default function LecturaCard({
  lectura,
  onPress,
  variant = 'vertical',
  showProgress = false,
  progreso = 0,
}: LecturaCardProps) {
  const gradient = getGradient(lectura.id)

  if (variant === 'horizontal') {
    return (
      <div
        onClick={onPress}
        style={{
          display: 'flex',
          gap: '12px',
          background: 'white',
          borderRadius: '18px',
          padding: '14px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.02)',
          cursor: onPress ? 'pointer' : 'default',
          transition: 'transform 0.15s',
          marginBottom: '10px',
        }}
      >
        {/* IMAGEN */}
        <div style={{
          width: '68px',
          height: '88px',
          borderRadius: '12px',
          overflow: 'hidden',
          flexShrink: 0,
          boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
          background: gradient,
          position: 'relative',
        }}>
          {lectura.portada_url
            ? <Image src={lectura.portada_url} alt={lectura.titulo} fill style={{ objectFit: 'cover' }} />
            : <div style={{
                width: '100%', height: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <BookOpen size={24} color="rgba(255,255,255,0.8)" strokeWidth={1.2} />
              </div>
          }
        </div>

        {/* CONTENIDO */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minWidth: 0,
        }}>
          {lectura.materias && (
            <Badge variant={getMateriaVariant(lectura.materias.nombre)} size="sm">
              {lectura.materias.nombre}
            </Badge>
          )}
          <p style={{
            fontSize: '14px', fontWeight: 700, color: '#111827',
            marginTop: '6px', lineHeight: '1.3',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {lectura.titulo}
          </p>
          <p style={{
            fontSize: '12px', color: '#6B7280',
            marginTop: '4px', fontWeight: 500,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {lectura.autor}
          </p>
          {showProgress && (
            <div style={{ marginTop: '8px' }}>
              <ProgressBar value={progreso} size="sm" />
              <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '4px' }}>
                {progreso}% completado
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Variante vertical
  return (
    <div
      onClick={onPress}
      style={{
        width: '148px',
        flexShrink: 0,
        cursor: onPress ? 'pointer' : 'default',
        transition: 'transform 0.15s',
      }}
    >
      {/* IMAGEN */}
      <div style={{
        width: '100%',
        height: '196px',
        borderRadius: '16px',
        overflow: 'hidden',
        position: 'relative',
        boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
        background: gradient,
      }}>
        {lectura.portada_url ? (
          <Image src={lectura.portada_url} alt={lectura.titulo} fill style={{ objectFit: 'cover' }} />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <BookOpen size={40} color="rgba(255,255,255,0.8)" strokeWidth={1.2} />
          </div>
        )}
        {/* BOTÓN BOOKMARK */}
        <button
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute', top: '8px', right: '8px',
            width: '30px', height: '30px',
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(8px)',
            border: 'none', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          }}
        >
          <BookmarkPlus size={14} color="#374151" />
        </button>
      </div>

      {/* INFO */}
      {lectura.materias && (
        <div style={{ marginTop: '10px' }}>
          <Badge variant={getMateriaVariant(lectura.materias.nombre)} size="sm">
            {lectura.materias.nombre}
          </Badge>
        </div>
      )}
      <p style={{
        fontSize: '13px', fontWeight: 700, color: '#111827',
        marginTop: '6px', lineHeight: '1.3',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>
        {lectura.titulo}
      </p>
      <p style={{
        fontSize: '12px', color: '#9CA3AF', fontWeight: 500,
        marginTop: '3px',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {lectura.autor}
      </p>
    </div>
  )
}
