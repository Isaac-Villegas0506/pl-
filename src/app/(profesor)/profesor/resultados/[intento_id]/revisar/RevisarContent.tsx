'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save } from 'lucide-react'
import ProfesorTopBar from '@/components/layout/ProfesorTopBar'
import { guardarRevisionAction } from './actions'
import type { IntentoConDatos, RespuestaAbiertaParaRevisar } from '../../../types'

interface Props {
  intento: IntentoConDatos
  respuestasAbiertas: RespuestaAbiertaParaRevisar[]
  estudianteNombre: string
  lecturaTitulo: string
}

export default function RevisarContent({
  intento,
  respuestasAbiertas,
  estudianteNombre,
  lecturaTitulo,
}: Props) {
  const router = useRouter()

  const [puntajes, setPuntajes] = useState<Record<string, number>>(() =>
    Object.fromEntries(respuestasAbiertas.map(r => [r.id, r.puntaje_obtenido]))
  )
  const [comentarios, setComentarios] = useState<Record<string, string>>(() =>
    Object.fromEntries(respuestasAbiertas.map(r => [r.id, '']))
  )
  const [isSaving, setIsSaving] = useState(false)
  const [savedNota, setSavedNota] = useState<number | null>(null)

  const todasAsignadas = respuestasAbiertas.every(r => puntajes[r.id] !== undefined)

  function setPuntaje(respuestaId: string, valor: number) {
    setPuntajes(prev => ({ ...prev, [respuestaId]: valor }))
  }

  function setComentario(respuestaId: string, texto: string) {
    setComentarios(prev => ({ ...prev, [respuestaId]: texto }))
  }

  async function handleGuardar() {
    if (!todasAsignadas || isSaving) return
    setIsSaving(true)

    const result = await guardarRevisionAction({
      intentoId: intento.id,
      revisiones: respuestasAbiertas.map(r => ({
        respuestaId: r.id,
        puntaje: puntajes[r.id] ?? 0,
        comentario: comentarios[r.id] ?? '',
      })),
    })

    if (result.success) {
      setSavedNota(result.nota ?? null)
      setTimeout(() => router.push('/profesor/resultados'), 1800)
    } else {
      setIsSaving(false)
    }
  }

  if (respuestasAbiertas.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: '#F5F3FF' }}>
        <ProfesorTopBar title="Revisión" showBack subtitle={lecturaTitulo} />
        <div style={{ padding: '32px 16px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: '#9CA3AF' }}>
            No hay preguntas abiertas pendientes de revisión.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F5F3FF' }}>
      <ProfesorTopBar title="Revisión" showBack subtitle={lecturaTitulo} />

      <div style={{ padding: '16px 16px 120px', maxWidth: '480px', margin: '0 auto' }}>

        {/* INFO DEL ESTUDIANTE */}
        <div style={{
          background: 'white', borderRadius: '16px', padding: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '16px',
          display: 'flex', alignItems: 'center', gap: '14px',
        }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #4F46E5, #6D28D9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'white' }}>
              {estudianteNombre.trim().split(' ').map(n => n[0]).slice(0, 2).join('')}
            </span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>
              {estudianteNombre}
            </p>
            {intento.fecha_completado && (
              <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>
                Entregado: {new Date(intento.fecha_completado).toLocaleDateString('es', {
                  day: '2-digit', month: 'long', year: 'numeric',
                })}
              </p>
            )}
          </div>
          {intento.nota_automatica !== null && (
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <p style={{ fontSize: '11px', color: '#9CA3AF' }}>Nota automática</p>
              <p style={{ fontSize: '20px', fontWeight: 800, color: '#4F46E5' }}>
                {intento.nota_automatica.toFixed(1)}
              </p>
            </div>
          )}
        </div>

        {/* RESPUESTAS ABIERTAS */}
        {respuestasAbiertas.map((respuesta) => {
          const puntajeSeleccionado = puntajes[respuesta.id] ?? 0
          const usarInput = respuesta.puntaje_maximo > 10

          return (
            <div key={respuesta.id} style={{
              background: 'white', borderRadius: '18px',
              padding: '18px', marginBottom: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}>
              {/* Etiqueta de pregunta */}
              <span style={{
                fontSize: '11px', fontWeight: 700, color: '#4F46E5',
                background: '#EEF2FF', borderRadius: '6px',
                padding: '3px 10px', letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}>
                Pregunta {respuesta.orden}
              </span>

              {/* Enunciado */}
              <p style={{
                fontSize: '16px', fontWeight: 700, color: '#111827',
                marginTop: '10px', lineHeight: '1.4',
                fontFamily: 'var(--font-playfair, Georgia, serif)',
              }}>
                {respuesta.enunciado}
              </p>

              {/* Respuesta del estudiante */}
              <div style={{
                background: '#F8F7FF', borderRadius: '12px',
                padding: '14px', marginTop: '14px',
              }}>
                <p style={{
                  fontSize: '11px', fontWeight: 700, color: '#6B7280',
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                  marginBottom: '8px',
                }}>
                  Respuesta del estudiante
                </p>
                <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>
                  {respuesta.texto_respuesta}
                </p>
              </div>

              {/* Puntaje */}
              <div style={{ marginTop: '16px' }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>
                  Puntaje asignado{' '}
                  <span style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 400 }}>
                    (máximo: {respuesta.puntaje_maximo} pts)
                  </span>
                </p>

                {usarInput ? (
                  <input
                    type="number"
                    min={0}
                    max={respuesta.puntaje_maximo}
                    value={puntajeSeleccionado}
                    onChange={e => {
                      const v = Math.max(0, Math.min(respuesta.puntaje_maximo, parseInt(e.target.value) || 0))
                      setPuntaje(respuesta.id, v)
                    }}
                    style={{
                      width: '100px', height: '48px',
                      border: '1.5px solid #4F46E5', borderRadius: '12px',
                      padding: '0 14px', fontSize: '18px', fontWeight: 700,
                      color: '#4F46E5', textAlign: 'center',
                      background: '#EEF2FF', outline: 'none',
                      fontFamily: 'inherit',
                    }}
                  />
                ) : (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {Array.from({ length: respuesta.puntaje_maximo + 1 }, (_, i) => i).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPuntaje(respuesta.id, p)}
                        style={{
                          width: '44px', height: '44px',
                          borderRadius: '12px', border: 'none',
                          fontSize: '15px', fontWeight: 700,
                          cursor: 'pointer',
                          background: puntajeSeleccionado === p
                            ? 'linear-gradient(135deg, #4F46E5, #6D28D9)'
                            : '#F3F4F6',
                          color: puntajeSeleccionado === p ? 'white' : '#6B7280',
                          boxShadow: puntajeSeleccionado === p
                            ? '0 4px 12px rgba(79,70,229,0.3)'
                            : 'none',
                          transition: 'all 0.15s',
                          fontFamily: 'inherit',
                        }}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Comentario del profesor */}
              <div style={{ marginTop: '14px' }}>
                <textarea
                  placeholder="Comentario para el estudiante (opcional)..."
                  value={comentarios[respuesta.id] ?? ''}
                  onChange={(e) => setComentario(respuesta.id, e.target.value)}
                  style={{
                    width: '100%', minHeight: '80px',
                    border: '1.5px solid #E5E7EB', borderRadius: '12px',
                    padding: '12px 14px', fontSize: '13px', color: '#374151',
                    fontFamily: 'inherit', lineHeight: '1.5',
                    background: 'white', outline: 'none', resize: 'vertical',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
          )
        })}

        {/* Mensaje de éxito */}
        {savedNota !== null && (
          <div style={{
            background: '#ECFDF5', borderRadius: '14px', padding: '16px',
            border: '1.5px solid #6EE7B7', textAlign: 'center', marginBottom: '16px',
          }}>
            <p style={{ fontSize: '15px', fontWeight: 800, color: '#065F46' }}>
              ✅ Nota final: {savedNota.toFixed(2)} / 20
            </p>
            <p style={{ fontSize: '12px', color: '#065F46', marginTop: '4px' }}>
              El estudiante ha sido notificado. Redirigiendo...
            </p>
          </div>
        )}
      </div>

      {/* BOTÓN FIJO */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid #F1F5F9',
        padding: '12px 16px',
        paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
      }}>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <button
            onClick={handleGuardar}
            disabled={!todasAsignadas || isSaving || savedNota !== null}
            style={{
              width: '100%', height: '54px', border: 'none',
              borderRadius: '14px',
              background: todasAsignadas && !isSaving && savedNota === null
                ? 'linear-gradient(135deg, #4F46E5, #6D28D9)'
                : '#E5E7EB',
              fontSize: '15px', fontWeight: 800,
              color: todasAsignadas && !isSaving && savedNota === null ? 'white' : '#9CA3AF',
              cursor: todasAsignadas && !isSaving && savedNota === null ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              boxShadow: todasAsignadas && !isSaving && savedNota === null
                ? '0 4px 14px rgba(79,70,229,0.35)'
                : 'none',
              transition: 'all 0.2s',
              fontFamily: 'inherit',
            }}
          >
            <Save size={18} />
            {isSaving ? 'Guardando...' : 'Guardar calificación'}
          </button>
          {!todasAsignadas && (
            <p style={{ fontSize: '12px', color: '#F59E0B', textAlign: 'center', marginTop: '8px', fontWeight: 600 }}>
              Asigna un puntaje a todas las preguntas para continuar
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
