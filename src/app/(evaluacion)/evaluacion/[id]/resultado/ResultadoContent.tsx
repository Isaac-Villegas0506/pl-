'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChevronLeft, Trophy, Star, BookOpen,
  CheckCircle2, AlertCircle, XCircle, Clock,
  Home, BookMarked,
} from 'lucide-react'
import type { RespuestaDetalle } from '../types'

interface ResultadoContentProps {
  nota: number
  correctas: number
  totalPreguntas: number
  porcentaje: number
  hayPreguntasAbiertas: boolean
  respuestasDetalle: RespuestaDetalle[]
  asignacionId: string
}

export default function ResultadoContent({
  nota,
  correctas,
  totalPreguntas,
  porcentaje,
  hayPreguntasAbiertas,
  respuestasDetalle,
  asignacionId,
}: ResultadoContentProps) {
  const router = useRouter()
  const [notaAnimada, setNotaAnimada] = useState(0)
  const [seccion, setSeccion] = useState<'resumen' | 'detalle'>('resumen')

  // Animación de conteo de nota
  useEffect(() => {
    let current = 0
    const step = 0.5
    const interval = setInterval(() => {
      current = Math.min(current + step, nota)
      setNotaAnimada(Math.round(current * 10) / 10)
      if (current >= nota) clearInterval(interval)
    }, 50)
    return () => clearInterval(interval)
  }, [nota])

  const heroGradient =
    nota >= 16
      ? 'linear-gradient(135deg, #10B981, #059669)'
      : nota >= 11
        ? 'linear-gradient(135deg, #4F46E5, #6D28D9)'
        : 'linear-gradient(135deg, #F59E0B, #D97706)'

  const HeroIcon = nota >= 16 ? Trophy : nota >= 11 ? Star : BookOpen
  const aprobado = nota >= 11

  return (
    <div style={{ minHeight: '100vh', background: '#F5F3FF' }}>

      {/* HERO DE RESULTADO */}
      <div style={{
        position: 'relative',
        width: '100%', height: '200px',
        background: heroGradient,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '4px',
      }}>
        {/* Botón regresar */}
        <button
          onClick={() => router.push('/inicio')}
          style={{
            position: 'absolute', top: '16px', left: '16px',
            width: '38px', height: '38px',
            background: 'rgba(255,255,255,0.2)',
            border: 'none', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        >
          <ChevronLeft size={20} color="white" strokeWidth={2.5} />
        </button>

        <HeroIcon size={52} color="white" strokeWidth={1.5} />

        <p style={{
          fontFamily: 'var(--font-playfair, serif)',
          fontSize: '48px', fontWeight: 800,
          color: 'white', lineHeight: 1,
          marginTop: '8px',
        }}>
          {notaAnimada.toFixed(1)}/20
        </p>

        <p style={{
          fontSize: '11px', fontWeight: 700,
          letterSpacing: '0.15em',
          color: 'rgba(255,255,255,0.8)',
          textTransform: 'uppercase',
        }}>
          Nota Final
        </p>
      </div>

      {/* CARD BLANCA */}
      <div style={{
        background: 'white',
        borderRadius: '24px 24px 0 0',
        marginTop: '-20px',
        padding: '24px 20px 120px',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
        position: 'relative', zIndex: 3,
        minHeight: 'calc(100vh - 180px)',
      }}>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>

          {/* Tabs */}
          <div style={{
            display: 'flex', gap: '8px',
            background: '#F3F4F6', borderRadius: '12px', padding: '4px',
            marginBottom: '20px',
          }}>
            {(['resumen', 'detalle'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setSeccion(tab)}
                style={{
                  flex: 1, height: '36px', border: 'none',
                  borderRadius: '9px',
                  background: seccion === tab ? 'white' : 'transparent',
                  color: seccion === tab ? '#111827' : '#6B7280',
                  fontSize: '13px', fontWeight: seccion === tab ? 700 : 500,
                  cursor: 'pointer',
                  boxShadow: seccion === tab ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.2s',
                  fontFamily: 'inherit',
                }}
              >
                {tab === 'resumen' ? 'Resumen' : 'Revisión'}
              </button>
            ))}
          </div>

          {seccion === 'resumen' && (
            <>
              <p style={{ fontSize: '18px', fontWeight: 800, color: '#111827' }}>
                Tu rendimiento
              </p>

              {/* Stats */}
              <div style={{
                display: 'flex', alignItems: 'stretch',
                background: '#F8F7FF', borderRadius: '16px',
                padding: '20px', marginTop: '16px', gap: '0',
              }}>
                {[
                  { valor: `${correctas}/${totalPreguntas}`, label: 'Correctas', color: '#10B981' },
                  { valor: `${Math.round(porcentaje)}%`, label: 'Precisión', color: '#4F46E5' },
                  {
                    valor: hayPreguntasAbiertas ? 'Pendiente' : `${nota.toFixed(1)}/20`,
                    label: 'Calificación',
                    color: aprobado ? '#10B981' : '#F59E0B',
                  },
                ].map((stat, i) => (
                  <div key={stat.label} style={{
                    flex: 1, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: '4px',
                    borderLeft: i > 0 ? '1px solid #E5E7EB' : 'none',
                    padding: i > 0 ? '0 0 0 16px' : '0 16px 0 0',
                  }}>
                    <span style={{ fontSize: '20px', fontWeight: 800, color: stat.color }}>
                      {stat.valor}
                    </span>
                    <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 500 }}>
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Chip aprobado/reprobado */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                height: '32px', padding: '0 14px',
                borderRadius: '99px',
                background: aprobado ? '#D1FAE5' : '#FEF3C7',
                marginTop: '12px',
              }}>
                {aprobado
                  ? <CheckCircle2 size={14} color="#065F46" strokeWidth={2.5} />
                  : <AlertCircle size={14} color="#92400E" strokeWidth={2.5} />
                }
                <span style={{
                  fontSize: '13px', fontWeight: 700,
                  color: aprobado ? '#065F46' : '#92400E',
                }}>
                  {aprobado ? '¡Aprobado!' : 'Por mejorar'}
                </span>
              </div>

              {hayPreguntasAbiertas && (
                <div style={{
                  marginTop: '16px',
                  background: '#FFFBEB',
                  border: '1.5px solid #FCD34D',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  display: 'flex', gap: '10px', alignItems: 'flex-start',
                }}>
                  <Clock size={16} color="#F59E0B" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <p style={{ fontSize: '13px', color: '#92400E', lineHeight: '1.5' }}>
                    Tu nota puede cambiar cuando tu profesor revise las preguntas abiertas.
                  </p>
                </div>
              )}
            </>
          )}

          {seccion === 'detalle' && (
            <>
              <p style={{ fontSize: '16px', fontWeight: 800, color: '#111827', marginBottom: '16px' }}>
                Revisión de respuestas
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {respuestasDetalle.map((r, i) => (
                  <RespuestaCard key={r.pregunta_id} respuesta={r} numero={i + 1} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* BOTONES FINALES */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid #F1F5F9',
        padding: '12px 20px',
        paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
      }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={() => router.push('/inicio')}
            style={{
              width: '100%', height: '50px',
              background: 'white',
              border: '1.5px solid #E5E7EB',
              borderRadius: '14px',
              fontSize: '15px', fontWeight: 700,
              color: '#374151', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              fontFamily: 'inherit',
            }}
          >
            <Home size={18} strokeWidth={2} /> Volver al inicio
          </button>
          <button
            onClick={() => router.push('/mis-libros')}
            style={{
              width: '100%', height: '50px',
              background: 'linear-gradient(135deg, #4F46E5, #6D28D9)',
              border: 'none', borderRadius: '14px',
              fontSize: '15px', fontWeight: 700,
              color: 'white', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              boxShadow: '0 4px 14px rgba(79,70,229,0.35)',
              fontFamily: 'inherit',
            }}
          >
            <BookMarked size={18} strokeWidth={2} /> Ver mis libros
          </button>
        </div>
      </div>
    </div>
  )
}

function RespuestaCard({ respuesta, numero }: { respuesta: RespuestaDetalle; numero: number }) {
  const esAbierta = respuesta.tipo === 'abierta'
  const correcta = respuesta.es_correcta === true
  const incorrecta = respuesta.es_correcta === false

  if (esAbierta) {
    return (
      <div style={{
        background: '#FFFBEB', border: '1.5px solid #FCD34D',
        borderRadius: '16px', padding: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={20} color="#F59E0B" strokeWidth={2} />
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#F59E0B' }}>
              Pendiente de revisión
            </span>
          </div>
        </div>
        <p style={{ fontSize: '13px', color: '#374151', marginTop: '8px', fontWeight: 600 }}>
          {respuesta.enunciado}
        </p>
        {respuesta.texto_respuesta_estudiante && (
          <div style={{ marginTop: '8px' }}>
            <span style={{ fontSize: '11px', color: '#9CA3AF', display: 'block', marginBottom: '4px' }}>
              Tu respuesta:
            </span>
            <div style={{
              background: 'rgba(245,158,11,0.08)', borderRadius: '8px',
              padding: '8px 12px', fontSize: '13px', color: '#374151', lineHeight: '1.5',
            }}>
              {respuesta.texto_respuesta_estudiante}
            </div>
          </div>
        )}
        <p style={{ fontSize: '12px', color: '#92400E', marginTop: '10px' }}>
          Tu profesor revisará esta respuesta
        </p>
      </div>
    )
  }

  if (correcta) {
    return (
      <div style={{
        background: '#F0FDF4', border: '1.5px solid #86EFAC',
        borderRadius: '16px', padding: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={20} color="#10B981" strokeWidth={2} />
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#10B981' }}>Correcta</span>
          </div>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#10B981' }}>
            +{respuesta.puntaje_obtenido} pts
          </span>
        </div>
        <p style={{ fontSize: '13px', color: '#374151', marginTop: '8px', fontWeight: 600 }}>
          {respuesta.enunciado}
        </p>
        {respuesta.texto_opcion_estudiante && (
          <div style={{ marginTop: '8px' }}>
            <span style={{ fontSize: '11px', color: '#9CA3AF', display: 'block', marginBottom: '4px' }}>Tu respuesta:</span>
            <div style={{
              background: 'rgba(16,185,129,0.08)', borderRadius: '8px',
              padding: '6px 10px', fontSize: '13px', color: '#374151',
            }}>
              {respuesta.texto_opcion_estudiante}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{
      background: '#FFF1F2', border: '1.5px solid #FDA4AF',
      borderRadius: '16px', padding: '16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <XCircle size={20} color="#F43F5E" strokeWidth={2} />
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#F43F5E' }}>Incorrecta</span>
        </div>
        <span style={{ fontSize: '13px', color: '#9CA3AF' }}>0 pts</span>
      </div>
      <p style={{ fontSize: '13px', color: '#374151', marginTop: '8px', fontWeight: 600 }}>
        {respuesta.enunciado}
      </p>
      {respuesta.texto_opcion_estudiante && (
        <div style={{ marginTop: '8px' }}>
          <span style={{ fontSize: '11px', color: '#9CA3AF', display: 'block', marginBottom: '4px' }}>Tu respuesta:</span>
          <div style={{
            background: 'rgba(244,63,94,0.06)', borderRadius: '8px',
            padding: '6px 10px', fontSize: '13px', color: '#991B1B',
          }}>
            {respuesta.texto_opcion_estudiante}
          </div>
        </div>
      )}
      {respuesta.texto_opcion_correcta && (
        <div style={{ marginTop: '8px' }}>
          <span style={{ fontSize: '11px', color: '#10B981', display: 'block', marginBottom: '4px' }}>Respuesta correcta:</span>
          <div style={{
            background: 'rgba(16,185,129,0.08)', borderRadius: '8px',
            padding: '6px 10px', fontSize: '13px', color: '#065F46',
          }}>
            {respuesta.texto_opcion_correcta}
          </div>
        </div>
      )}
    </div>
  )
}
