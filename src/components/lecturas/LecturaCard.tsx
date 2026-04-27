'use client'

import Image from 'next/image'
import { BookOpen, Bookmark } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import ProgressBar from '@/components/ui/ProgressBar'
import { obtenerGradientePortada } from '@/lib/utils'
import type { LecturaConRelaciones } from '@/types/app.types'

interface LecturaCardProps {
  lectura: LecturaConRelaciones
  onPress?: () => void
  variant?: 'vertical' | 'horizontal'
  showProgress?: boolean
  progreso?: number
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
  const gradient = obtenerGradientePortada(lectura.id)

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
  // Variante vertical unificada
  return (
    <div
      onClick={onPress}
      style={{
        width: '148px', // FIX 1B
        flexShrink: 0,
        background: 'white',
        borderRadius: '18px', // FIX 1B
        overflow: 'hidden',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        border: '1px solid rgba(0,0,0,0.03)',
        cursor: onPress ? 'pointer' : 'default',
        transition: 'transform 0.15s, box-shadow 0.15s',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* IMAGEN SUPERIOR */}
      <div style={{
        width: '100%',
        height: '172px', // FIX 1B
        flexShrink: 0, // FIX 1B
        position: 'relative',
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
          onClick={(e) => { e.stopPropagation(); /* lógica favoritos aquí */ }}
          style={{
            position: 'absolute', top: '8px', right: '8px',
            width: '32px', height: '32px',
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(8px)',
            border: 'none', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          }}
        >
          <Bookmark size={16} color="#374151" />
        </button>
      </div>

      {/* INFO INFERIOR */}
      <div style={{ 
        padding: '11px 13px', // FIX 1B
        height: '80px', // FIX 1B
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'space-between' // FIX 1B
      }}>
        {lectura.materias && (
          <div style={{ height: '20px' }}> {/* FIX 1B */}
            <Badge 
              variant={getMateriaVariant(lectura.materias.nombre)} 
              size="sm"
              style={{ fontSize: '10px' }} // FIX 1B
            >
              {lectura.materias.nombre}
            </Badge>
          </div>
        )}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <p style={{
            fontSize: '13px', // FIX 1B
            fontWeight: 700, 
            color: '#111827',
            lineHeight: '1.3', // FIX 1B
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {lectura.titulo}
          </p>
        </div>
        <p style={{
          fontSize: '11px', // FIX 1B
          color: '#9CA3AF', // FIX 1B
          fontWeight: 500,
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          whiteSpace: 'nowrap',
        }}>
          {lectura.autor}
        </p>
      </div>
    </div>
  )
}
