'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  ChevronLeft, ChevronRight, CheckCircle,
} from 'lucide-react'
import ProgressBar from '@/components/ui/ProgressBar'
import { OpcionMultiple, VerdaderoFalso, RespuestaAbierta } from '@/components/evaluacion'
import { guardarRespuestaAction, finalizarIntentoAction } from '../../actions'
import type { PreguntaConOpciones } from '../../types'

interface PreguntaContentProps {
  pregunta: PreguntaConOpciones
  numeroPregunta: number
  totalPreguntas: number
  asignacionId: string
  intentoId: string
  estudianteId: string
  respuestaPrevia: string | null
}

export default function PreguntaContent({
  pregunta,
  numeroPregunta,
  totalPreguntas,
  asignacionId,
  intentoId,
  estudianteId,
  respuestaPrevia,
}: PreguntaContentProps) {
  const router = useRouter()
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState<string | null>(null)
  const [textoRespuesta, setTextoRespuesta] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const esUltima = numeroPregunta === totalPreguntas
  const esAbierta = pregunta.tipo === 'abierta'
  const readOnly = !!respuestaPrevia

  // Precargar respuesta previa
  useEffect(() => {
    if (respuestaPrevia) {
      if (esAbierta) {
        setTextoRespuesta(respuestaPrevia)
      } else {
        setRespuestaSeleccionada(respuestaPrevia)
      }
    }
  }, [respuestaPrevia, esAbierta])

  const tieneRespuesta = esAbierta
    ? textoRespuesta.trim().length > 0
    : !!respuestaSeleccionada

  const progresoBarValue = Math.round(((numeroPregunta - 1) / totalPreguntas) * 100)

  async function handleSiguiente() {
    if (!tieneRespuesta || isSubmitting || readOnly) return
    setIsSubmitting(true)

    await guardarRespuestaAction({
      intentoId,
      preguntaId: pregunta.id,
      opcionId: esAbierta ? undefined : (respuestaSeleccionada ?? undefined),
      textoRespuesta: esAbierta ? textoRespuesta : undefined,
      estudianteId,
    })

    if (esUltima) {
      await finalizarIntentoAction(intentoId, estudianteId)
      router.push(`/evaluacion/${asignacionId}/resultado`)
    } else {
      router.push(`/evaluacion/${asignacionId}/pregunta/${numeroPregunta + 1}`)
    }
  }

  // Encontrar opción verdadero/falso
  const opcionVerdadero = pregunta.opciones.find(
    (o) => o.texto.toLowerCase().includes('verdadero') || o.es_correcta !== undefined && o.orden === 0
  )
  const opcionFalso = pregunta.opciones.find(
    (o) => o.texto.toLowerCase().includes('falso') || o.orden === 1
  )

  const btnHabilitado = tieneRespuesta && !isSubmitting && !readOnly

  return (
    <div style={{ minHeight: '100vh', background: '#F5F3FF' }}>

      {/* HEADER STICKY */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: 'white',
        borderBottom: '1px solid #F1F5F9',
        height: '56px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center',
        padding: '0 16px',
      }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#6B7280' }}>
          Pregunta {numeroPregunta} de {totalPreguntas}
        </span>
      </div>

      {/* BARRA DE PROGRESO */}
      <div style={{
        position: 'sticky', top: '56px', zIndex: 39,
        background: 'white',
        padding: '8px 16px 12px',
        borderBottom: '1px solid #F5F3FF',
      }}>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <ProgressBar value={progresoBarValue} color="primary" size="md" />
        </div>
      </div>

      {/* ÁREA DE PREGUNTA */}
      <div
        key={numeroPregunta}
        style={{
          padding: '20px 20px 160px',
          maxWidth: '480px',
          margin: '0 auto',
          animation: 'slideUp 0.35s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        {/* Etiqueta número */}
        <span style={{
          display: 'inline-block',
          fontSize: '11px', fontWeight: 700, color: '#4F46E5',
          letterSpacing: '0.08em', textTransform: 'uppercase',
          background: '#EEF2FF', borderRadius: '6px',
          padding: '3px 10px',
        }}>
          Pregunta {numeroPregunta}
        </span>

        {/* Enunciado */}
        <p style={{
          fontFamily: 'var(--font-playfair, serif)',
          fontSize: '20px', fontWeight: 700,
          color: '#111827', lineHeight: '1.4',
          marginTop: '12px',
        }}>
          {pregunta.enunciado}
        </p>

        {/* Imagen opcional */}
        {pregunta.imagen_url && (
          <div style={{
            marginTop: '16px',
            borderRadius: '16px', overflow: 'hidden',
            maxHeight: '200px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.10)',
          }}>
            <Image
              src={pregunta.imagen_url}
              alt="Imagen de la pregunta"
              width={480}
              height={200}
              style={{ width: '100%', height: '200px', objectFit: 'cover' }}
            />
          </div>
        )}

        {/* OPCIONES según tipo */}
        {pregunta.tipo === 'opcion_multiple' && (
          <OpcionMultiple
            opciones={pregunta.opciones}
            seleccionada={respuestaSeleccionada}
            onSeleccionar={setRespuestaSeleccionada}
            readOnly={readOnly}
          />
        )}

        {pregunta.tipo === 'verdadero_falso' && opcionVerdadero && opcionFalso && (
          <VerdaderoFalso
            seleccionada={respuestaSeleccionada}
            opcionVerdaderoId={opcionVerdadero.id}
            opcionFalsoId={opcionFalso.id}
            onSeleccionar={setRespuestaSeleccionada}
            readOnly={readOnly}
          />
        )}

        {pregunta.tipo === 'abierta' && (
          <RespuestaAbierta
            valor={textoRespuesta}
            onChange={setTextoRespuesta}
            readOnly={readOnly}
          />
        )}

        {readOnly && (
          <p style={{
            marginTop: '16px',
            fontSize: '12px', color: '#9CA3AF',
            textAlign: 'center', fontStyle: 'italic',
          }}>
            Ya respondiste esta pregunta
          </p>
        )}
      </div>

      {/* BOTÓN FIJO */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid #F1F5F9',
        padding: '16px 20px',
        paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
      }}>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <button
            onClick={readOnly
              ? () => router.push(`/evaluacion/${asignacionId}/pregunta/${numeroPregunta + 1}`)
              : handleSiguiente
            }
            disabled={!readOnly && !btnHabilitado}
            style={{
              width: '100%', height: '54px',
              background: (btnHabilitado || readOnly)
                ? (esUltima && !readOnly ? 'linear-gradient(135deg, #10B981, #059669)' : 'linear-gradient(135deg, #4F46E5, #6D28D9)')
                : '#9CA3AF',
              color: 'white', border: 'none',
              borderRadius: '14px',
              fontSize: '16px', fontWeight: 800,
              cursor: (btnHabilitado || readOnly) ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              opacity: (!btnHabilitado && !readOnly) ? 0.4 : 1,
              boxShadow: (btnHabilitado || readOnly) ? '0 4px 14px rgba(79,70,229,0.35)' : 'none',
              transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
              fontFamily: 'inherit',
            }}
          >
            {isSubmitting ? (
              'Guardando...'
            ) : readOnly ? (
              <>
                Siguiente pregunta <ChevronRight size={20} strokeWidth={2.5} />
              </>
            ) : esUltima ? (
              <>
                <CheckCircle size={20} strokeWidth={2.5} /> Finalizar evaluación
              </>
            ) : (
              <>
                Siguiente pregunta <ChevronRight size={20} strokeWidth={2.5} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
