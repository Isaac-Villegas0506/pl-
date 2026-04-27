'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  ChevronLeft, HelpCircle, CheckCircle2, AlertCircle, PlayCircle,
} from 'lucide-react'
import { obtenerGradientePortada } from '@/lib/utils'
import { crearIntentoAction } from './actions'
import type { AsignacionConLectura } from './types'

interface IntroduccionContentProps {
  asignacion: AsignacionConLectura
  totalPreguntas: number
  puntajeTotal: number
  tiempoEstimado: number
  asignacionId: string
  estudianteId: string
}

export default function IntroduccionContent({
  asignacion,
  totalPreguntas,
  puntajeTotal,
  tiempoEstimado,
  asignacionId,
  estudianteId,
}: IntroduccionContentProps) {
  const router = useRouter()
  const [isStarting, setIsStarting] = useState(false)

  async function handleComenzar() {
    if (isStarting) return
    setIsStarting(true)
    const result = await crearIntentoAction(asignacionId, estudianteId)
    if (result.success) {
      router.push(`/evaluacion/${asignacionId}/pregunta/1`)
    } else {
      setIsStarting(false)
    }
  }

  const gradient = obtenerGradientePortada(asignacion.lectura_id)

  return (
    <div style={{ minHeight: '100vh', background: '#F5F3FF' }}>

      {/* HERO / PORTADA */}
      <div style={{
        position: 'relative', width: '100%', height: '220px',
        overflow: 'hidden', background: gradient,
      }}>
        {asignacion.portada_url && (
          <Image
            src={asignacion.portada_url}
            alt={asignacion.titulo}
            fill
            style={{ objectFit: 'cover', zIndex: 1 }}
            priority
          />
        )}

        {/* Gradiente oscuro inferior */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: '140px', zIndex: 2,
          background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.6) 100%)',
        }} />

        {/* Botón regresar */}
        <button
          onClick={() => router.back()}
          style={{
            position: 'absolute', top: '16px', left: '16px', zIndex: 10,
            width: '38px', height: '38px',
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: 'none', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
          }}
        >
          <ChevronLeft size={20} color="#111827" strokeWidth={2.5} />
        </button>

        {/* Título y autor sobre el gradiente */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '0 20px 20px', zIndex: 3,
        }}>
          <p style={{
            fontFamily: 'var(--font-playfair, serif)',
            fontSize: '20px', fontWeight: 700,
            color: 'white', lineHeight: '1.25',
            marginBottom: '4px',
          }}>
            {asignacion.titulo}
          </p>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>
            {asignacion.autor}
          </p>
        </div>
      </div>

      {/* CARD DE INFORMACIÓN */}
      <div style={{
        background: 'white',
        borderRadius: '24px 24px 0 0',
        marginTop: '-20px',
        padding: '28px 20px calc(144px + env(safe-area-inset-bottom, 0px))',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
        position: 'relative', zIndex: 4,
        minHeight: 'calc(100vh - 200px)',
      }}>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>

          {/* Fila título */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <HelpCircle size={20} color="#4F46E5" strokeWidth={2} />
            <span style={{ fontSize: '16px', fontWeight: 800, color: '#111827' }}>
              Evaluación de comprensión
            </span>
          </div>

          {/* Stats */}
          <div style={{
            display: 'flex', alignItems: 'center',
            background: '#F8F7FF', borderRadius: '16px',
            padding: '20px', marginTop: '20px',
          }}>
            {[
              { valor: String(totalPreguntas), label: 'Preguntas' },
              { valor: String(puntajeTotal), label: 'Puntos' },
              { valor: `${tiempoEstimado} min`, label: 'Tiempo est.' },
            ].map((stat, i) => (
              <div key={stat.label} style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: '4px',
              }}>
                {i > 0 && (
                  <div style={{
                    position: 'absolute',
                    width: '1px', height: '36px',
                    background: '#E5E7EB',
                    transform: `translateX(-${(3 - i) * 33}%)`,
                  }} />
                )}
                <span style={{ fontSize: '24px', fontWeight: 800, color: '#4F46E5' }}>
                  {stat.valor}
                </span>
                <span style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 500 }}>
                  {stat.label}
                </span>
              </div>
            ))}
          </div>

          {/* ¿Qué evalúa? */}
          <p style={{ fontSize: '14px', fontWeight: 700, color: '#374151', marginTop: '24px' }}>
            ¿Qué evalúa?
          </p>
          {[
            'Comprensión del texto y sus ideas principales',
            'Análisis de personajes y situaciones',
            'Vocabulario y expresión escrita',
          ].map((item) => (
            <div key={item} style={{
              display: 'flex', alignItems: 'flex-start', gap: '10px',
              padding: '8px 0',
            }}>
              <CheckCircle2 size={16} color="#10B981" strokeWidth={2.5} style={{ flexShrink: 0, marginTop: '1px' }} />
              <span style={{ fontSize: '13px', color: '#6B7280', lineHeight: '1.5' }}>
                {item}
              </span>
            </div>
          ))}

          {/* Reglas importantes */}
          <p style={{ fontSize: '14px', fontWeight: 700, color: '#374151', marginTop: '16px' }}>
            Reglas importantes
          </p>
          {[
            'Responde con cuidado, solo tienes un intento',
            'Las preguntas abiertas serán revisadas por tu profesor',
            'No puedes retroceder a preguntas anteriores',
          ].map((item) => (
            <div key={item} style={{
              display: 'flex', alignItems: 'flex-start', gap: '10px',
              padding: '8px 0',
            }}>
              <AlertCircle size={16} color="#F59E0B" strokeWidth={2.5} style={{ flexShrink: 0, marginTop: '1px' }} />
              <span style={{ fontSize: '13px', color: '#6B7280', lineHeight: '1.5' }}>
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* BOTÓN FIJO */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 51,
        background: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid #F1F5F9',
        padding: '16px 20px',
        paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
      }}>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <button
            onClick={handleComenzar}
            disabled={isStarting}
            style={{
              width: '100%', height: '54px',
              background: isStarting ? '#9CA3AF' : 'linear-gradient(135deg, #4F46E5, #6D28D9)',
              color: 'white', border: 'none',
              borderRadius: '14px',
              fontSize: '16px', fontWeight: 800,
              cursor: isStarting ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              boxShadow: isStarting ? 'none' : '0 4px 14px rgba(79,70,229,0.35)',
              transition: 'all 0.2s',
              fontFamily: 'inherit',
            }}
          >
            <PlayCircle size={20} strokeWidth={2} />
            {isStarting ? 'Iniciando...' : 'Comenzar evaluación'}
          </button>
        </div>
      </div>
    </div>
  )
}
