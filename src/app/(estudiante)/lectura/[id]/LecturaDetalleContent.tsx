'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  ChevronLeft, Bookmark, BookOpen, User, GraduationCap,
  FileText, Calendar, HelpCircle, Download, Clock,
} from 'lucide-react'
import { Badge, ProgressBar, Button } from '@/components/ui'
import { formatFecha, obtenerGradientePortada } from '@/lib/utils'
import { toggleFavoritoAction } from './actions'
import type { LecturaDetalleCompleta, ProgresoLectura, AsignacionDetalle } from './types'

interface LecturaDetalleContentProps {
  lectura: LecturaDetalleCompleta
  progreso: ProgresoLectura | null
  asignacion: AsignacionDetalle | null
  totalPreguntas: number
  esFavorito: boolean
  usuarioId: string
}

export default function LecturaDetalleContent({
  lectura,
  progreso,
  asignacion,
  totalPreguntas,
  esFavorito,
  usuarioId,
}: LecturaDetalleContentProps) {
  const router = useRouter()
  const [favoritoLocal, setFavoritoLocal] = useState(esFavorito)
  const [isTogglingFav, setIsTogglingFav] = useState(false)
  const [descExpand, setDescExpand] = useState(false)

  async function handleToggleFavorito() {
    if (isTogglingFav) return
    setIsTogglingFav(true)
    setFavoritoLocal(!favoritoLocal)

    const result = await toggleFavoritoAction(lectura.id, usuarioId, favoritoLocal)
    setFavoritoLocal(result.esFavorito)
    setIsTogglingFav(false)
  }

  const yaEmpezo = progreso && progreso.porcentaje > 0
  const yaCompleto = progreso?.terminado === true
  const pdfUrl = lectura.archivos.find((a) => a.tipo === 'pdf')?.url

  const fechaLimiteProxima = asignacion?.fecha_limite
    ? (new Date(asignacion.fecha_limite).getTime() - Date.now()) / (1000 * 60 * 60 * 24) < 3
    : false

  return (
    <div style={{ minHeight: '100vh', background: '#F5F3FF' }}>

      {/* ===== HERO SECTION ===== */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '300px',
        overflow: 'hidden',
        background: obtenerGradientePortada(lectura.id),
      }}>
        {/* Imagen si existe */}
        {lectura.portada_url && (
          <Image
            src={lectura.portada_url}
            alt={lectura.titulo}
            fill
            style={{ objectFit: 'cover', zIndex: 1 }}
            priority
          />
        )}

        {/* Ícono de libro si NO hay portada */}
        {!lectura.portada_url && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: '12px',
          }}>
            <div style={{
              width: '80px', height: '80px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '20px', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <BookOpen size={40} color="rgba(255,255,255,0.9)" strokeWidth={1.2} />
            </div>
            <span style={{
              fontSize: '12px', fontWeight: 700,
              color: 'rgba(255,255,255,0.7)',
              letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>
              Sin portada
            </span>
          </div>
        )}

        {/* Gradiente inferior para suavizar transición a la card blanca */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: '140px', zIndex: 2,
          background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.35) 100%)',
        }} />

        {/* Botón REGRESAR */}
        <button
          onClick={() => router.back()}
          style={{
            position: 'absolute', top: '16px', left: '16px', zIndex: 10,
            width: '38px', height: '38px',
            background: 'rgba(255,255,255,0.88)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: 'none', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
            transition: 'transform 0.15s, background 0.15s',
          }}
        >
          <ChevronLeft size={20} color="#111827" strokeWidth={2.5} />
        </button>

        {/* Botón BOOKMARK */}
        <button
          onClick={handleToggleFavorito}
          style={{
            position: 'absolute', top: '16px', right: '16px', zIndex: 10,
            width: '38px', height: '38px',
            background: 'rgba(255,255,255,0.88)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: 'none', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
            transition: 'transform 0.15s',
          }}
        >
          <Bookmark
            size={20}
            color={favoritoLocal ? '#4F46E5' : '#374151'}
            fill={favoritoLocal ? '#4F46E5' : 'none'}
            strokeWidth={2}
            style={{
              transition: 'color 0.2s, fill 0.2s',
              transform: favoritoLocal ? 'scale(1.15)' : 'scale(1)',
            }}
          />
        </button>
      </div>

      {/* CONTENT CARD - REDISEÑADO FIX 2 */}
      <div style={{
        background: 'white',
        borderRadius: '28px 28px 0 0',
        marginTop: '-32px',
        padding: '20px 20px 120px',
        position: 'relative',
        zIndex: 3,
        minHeight: 'calc(100vh - 260px)',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
      }}>

        {/* Drag handle visual */}
        <div style={{
          width: '40px', height: '4px', borderRadius: '99px',
          background: '#E5E7EB', margin: '0 auto 20px',
        }} />

        {/* Badge de materia */}
        {lectura.materias && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            fontSize: '11px', fontWeight: '700', borderRadius: '7px',
            padding: '3px 10px', letterSpacing: '0.04em',
            textTransform: 'uppercase',
            background: '#EEF2FF', // Default/Primary color
            color: '#4F46E5',
          }}>
            <span style={{
              width: '5px', height: '5px', borderRadius: '50%',
              background: '#4F46E5', flexShrink: 0,
            }} />
            {lectura.materias.nombre}
          </span>
        )}

        {/* Título */}
        <h1 style={{
          fontFamily: 'var(--font-playfair, serif)',
          fontSize: '22px', fontWeight: '800', color: '#111827',
          lineHeight: '1.25', marginTop: '10px', marginBottom: '6px',
        }}>
          {lectura.titulo}
        </h1>

        {/* Autor con icono */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
          <User size={13} color="#9CA3AF" strokeWidth={2} />
          <span style={{ fontSize: '14px', color: '#6B7280', fontWeight: '500' }}>
            {lectura.autor}
          </span>
        </div>

        {/* Fila de metadata (grado, páginas, tiempo) */}
        <div style={{
          display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px',
        }}>
          {/* Chip: Grado */}
          {lectura.grados && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              background: '#F5F3FF', borderRadius: '99px',
              padding: '5px 12px',
            }}>
              <GraduationCap size={13} color="#4F46E5" strokeWidth={2} />
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#4F46E5' }}>
                {lectura.grados.nombre}
              </span>
            </div>
          )}
          {/* Chip: Páginas (si existe) */}
          {lectura.paginas_total && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              background: '#F0FDF4', borderRadius: '99px', padding: '5px 12px',
            }}>
              <FileText size={13} color="#10B981" strokeWidth={2} />
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#10B981' }}>
                {lectura.paginas_total} págs.
              </span>
            </div>
          )}
          {/* Chip: Tiempo estimado (si existe) */}
          {lectura.tiempo_lectura_min && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              background: '#FFF7ED', borderRadius: '99px', padding: '5px 12px',
            }}>
              <Clock size={13} color="#F59E0B" strokeWidth={2} />
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#F59E0B' }}>
                {lectura.tiempo_lectura_min} min.
              </span>
            </div>
          )}
        </div>

        {/* Separador */}
        <div style={{ height: '1px', background: '#F3F4F6', marginBottom: '20px' }} />

        {/* Descripción */}
        {lectura.descripcion && (
          <div style={{ marginBottom: '24px' }}>
            <p style={{
              fontSize: '13px', fontWeight: '700', color: '#374151',
              marginBottom: '8px', textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}>
              Descripción
            </p>
            <p style={{
              fontSize: '15px', color: '#6B7280',
              lineHeight: '1.7', fontWeight: '400',
            }}>
              {lectura.descripcion}
            </p>
          </div>
        )}

        {/* Assignment info (si existe) */}
        {asignacion && (
          <div style={{
            background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px',
            padding: '16px', marginTop: '24px',
          }}>
            <p style={{ fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '8px', textTransform: 'uppercase' }}>
              Asignación
            </p>
            {asignacion.instrucciones && (
              <p style={{ fontSize: '14px', color: '#475569', marginBottom: '8px' }}>{asignacion.instrucciones}</p>
            )}
            {asignacion.fecha_limite && (
              <p style={{ fontSize: '13px', color: fechaLimiteProxima ? '#EF4444' : '#94A3B8' }}>
                Fecha límite: {formatFecha(asignacion.fecha_limite)}
              </p>
            )}
          </div>
        )}

        {/* Questions info */}
        {totalPreguntas > 0 && (
          <div style={{
            marginTop: '16px', background: '#EFF6FF', border: '1px solid #BFDBFE',
            borderRadius: '16px', padding: '16px', display: 'flex', gap: '12px'
          }}>
            <HelpCircle size={18} color="#2563EB" style={{ marginTop: '2px' }} />
            <div>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#2563EB' }}>
                {totalPreguntas} {totalPreguntas === 1 ? 'pregunta' : 'preguntas'} de evaluación
              </p>
              <p style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
                Deberás responderlas al terminar la lectura
              </p>
            </div>
          </div>
        )}
      </div>

      {/* FIXED BOTTOM BAR */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        padding: '12px 20px',
        paddingBottom: 'calc(72px + env(safe-area-inset-bottom, 0px))',
        background: 'linear-gradient(to top, rgba(255,255,255,1) 70%, rgba(255,255,255,0))',
      }}>
        <div style={{ display: 'flex', gap: '10px', maxWidth: '480px', margin: '0 auto' }}>

          {/* BOTÓN PRINCIPAL — Continuar/Empezar/Evaluación */}
          <button
            onClick={() => {
              if (yaCompleto && totalPreguntas > 0 && asignacion) {
                router.push(`/evaluacion/${asignacion.id}`)
              } else {
                router.push(`/lectura/${lectura.id}/leer`)
              }
            }}
            style={{
              flex: 1,
              height: '52px',
              background: 'linear-gradient(135deg, #4F46E5, #6D28D9)',
              border: 'none',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(79,70,229,0.38)',
              fontFamily: 'inherit',
            }}
          >
            <BookOpen size={18} color="white" strokeWidth={2} />
            <span style={{
              fontSize: '15px',
              fontWeight: '700',
              color: 'white',
              letterSpacing: '0.01em',
            }}>
              {yaCompleto && totalPreguntas > 0 ? 'Ver evaluación' : (yaEmpezo ? 'Continuar' : 'Empezar')}
            </span>
          </button>

          {/* BOTÓN SECUNDARIO — Descargar */}
          {pdfUrl && (
            <button
              onClick={() => window.open(pdfUrl, '_blank')}
              style={{
                width: '52px',
                height: '52px',
                background: 'white',
                border: '1.5px solid #E5E7EB',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                fontFamily: 'inherit',
              }}
            >
              <Download size={18} color="#4F46E5" strokeWidth={2} />
            </button>
          )}

        </div>
      </div>
    </div>
  )
}
