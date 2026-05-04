'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  ChevronLeft, Bookmark, BookOpen, User, GraduationCap,
  FileText, HelpCircle, Download, Clock,
} from 'lucide-react'
import { obtenerGradientePortada, formatFecha } from '@/lib/utils'
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
      
      {/* ===== HEADER (Solo para botón volver y bookmark en Desktop) ===== */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '20px', display: 'flex', justifyContent: 'space-between',
        pointerEvents: 'none'
      }}>
        <button
          onClick={() => router.back()}
          style={{
            width: '44px', height: '44px',
            background: 'white', borderRadius: '14px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', pointerEvents: 'auto',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: 'none',
          }}
        >
          <ChevronLeft size={22} color="#111827" strokeWidth={2.5} />
        </button>

        <button
          onClick={handleToggleFavorito}
          style={{
            width: '44px', height: '44px',
            background: 'white', borderRadius: '14px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', pointerEvents: 'auto',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: 'none',
          }}
        >
          <Bookmark
            size={22}
            color={favoritoLocal ? '#4F46E5' : '#64748B'}
            fill={favoritoLocal ? '#4F46E5' : 'none'}
            strokeWidth={2}
          />
        </button>
      </div>

      <div className="estudiante-container" style={{ padding: '0 0 120px' }}>
        <div className="lectura-detalle-grid">
          {/* COLUMNA IZQUIERDA: PORTADA */}
          <div style={{ position: 'relative' }}>
            <div style={{
              width: '100%', height: '400px',
              borderRadius: '0 0 32px 32px',
              overflow: 'hidden',
              background: obtenerGradientePortada(lectura.id),
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
              position: 'relative'
            }} className="lectura-portada-hero">
              {lectura.portada_url ? (
                <Image
                  src={lectura.portada_url}
                  alt={lectura.titulo}
                  fill
                  style={{ objectFit: 'cover' }}
                  priority
                />
              ) : (
                <div style={{
                  height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'column', gap: '16px', color: 'rgba(255,255,255,0.8)'
                }}>
                  <BookOpen size={64} strokeWidth={1} />
                  <span style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '12px' }}>Sin Portada</span>
                </div>
              )}
            </div>
          </div>

          {/* COLUMNA DERECHA: INFO */}
          <div style={{ padding: '32px 24px' }}>
            {lectura.materias && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                fontSize: '12px', fontWeight: '800', borderRadius: '8px',
                padding: '4px 12px', background: '#EEF2FF', color: '#4F46E5',
                textTransform: 'uppercase', letterSpacing: '0.04em'
              }}>
                {lectura.materias.nombre}
              </span>
            )}

            <h1 style={{
              fontSize: '32px', fontWeight: '900', color: '#111827',
              lineHeight: '1.2', marginTop: '16px', marginBottom: '8px',
            }}>
              {lectura.titulo}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <User size={16} color="#94A3B8" />
              <span style={{ fontSize: '16px', color: '#64748B', fontWeight: 600 }}>{lectura.autor}</span>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '32px' }}>
              {lectura.grados && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#F1F5F9', borderRadius: '10px', padding: '6px 14px' }}>
                  <GraduationCap size={16} color="#475569" strokeWidth={2.5} />
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#475569' }}>{lectura.grados.nombre}</span>
                </div>
              )}
              {lectura.paginas_total && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#F0FDF4', borderRadius: '10px', padding: '6px 14px' }}>
                  <FileText size={16} color="#10B981" strokeWidth={2.5} />
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#10B981' }}>{lectura.paginas_total} páginas</span>
                </div>
              )}
              {lectura.tiempo_lectura_min && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#FFF7ED', borderRadius: '10px', padding: '6px 14px' }}>
                  <Clock size={16} color="#F59E0B" strokeWidth={2.5} />
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#F59E0B' }}>{lectura.tiempo_lectura_min} min</span>
                </div>
              )}
            </div>

            <div style={{ height: '1.5px', background: '#F1F5F9', marginBottom: '32px' }} />

            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#111827', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
                Sinopsis
              </h3>
              <p style={{ fontSize: '16px', color: '#475569', lineHeight: '1.7', fontWeight: 500 }}>
                {lectura.descripcion || 'Sin descripción disponible para esta lectura.'}
              </p>
            </div>

            {asignacion && (
              <div style={{
                background: '#F8FAFC', border: '2px solid #E2E8F0', borderRadius: '24px',
                padding: '24px', marginBottom: '24px',
              }}>
                <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#111827', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
                  Tu Misión
                </h3>
                {asignacion.instrucciones && (
                  <p style={{ fontSize: '15px', color: '#475569', marginBottom: '16px', lineHeight: '1.5', fontWeight: 500 }}>
                    {asignacion.instrucciones}
                  </p>
                )}
                {asignacion.fecha_limite && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={16} color={fechaLimiteProxima ? '#EF4444' : '#94A3B8'} />
                    <span style={{ fontSize: '14px', fontWeight: '700', color: fechaLimiteProxima ? '#EF4444' : '#64748B' }}>
                      Vence el {formatFecha(asignacion.fecha_limite)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {totalPreguntas > 0 && (
              <div style={{
                background: '#F0F9FF', border: '2px solid #BAE6FD',
                borderRadius: '24px', padding: '24px', display: 'flex', gap: '16px', alignItems: 'flex-start'
              }}>
                <HelpCircle size={24} color="#0284C7" strokeWidth={2.5} />
                <div>
                  <p style={{ fontSize: '16px', fontWeight: '800', color: '#0369A1' }}>
                    Evaluación de {totalPreguntas} {totalPreguntas === 1 ? 'pregunta' : 'preguntas'}
                  </p>
                  <p style={{ fontSize: '14px', color: '#075985', marginTop: '4px', fontWeight: 500 }}>
                    Recuerda prestar mucha atención a los detalles para obtener el mejor puntaje.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ACTION BAR */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 90,
        padding: '20px 0',
        paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
        background: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(20px)',
        borderTop: '1.5px solid #F1F5F9',
      }}>
        <div className="estudiante-container" style={{ padding: '0 20px', display: 'flex', gap: '12px' }}>
          <button
            onClick={() => {
              if (yaCompleto && totalPreguntas > 0 && asignacion) {
                router.push(`/evaluacion/${asignacion.id}`)
              } else {
                router.push(`/lectura/${lectura.id}/leer`)
              }
            }}
            style={{
              flex: 1, height: '56px',
              background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
              border: 'none', borderRadius: '16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              cursor: 'pointer', boxShadow: '0 8px 24px rgba(79,70,229,0.3)',
              color: 'white', fontSize: '16px', fontWeight: '800',
            }}
          >
            <BookOpen size={20} color="white" strokeWidth={2.5} />
            {yaCompleto && totalPreguntas > 0 ? 'Ver Resultados' : (yaEmpezo ? 'Continuar Lectura' : 'Empezar a Leer')}
          </button>

          {pdfUrl && (
            <button
              onClick={() => window.open(pdfUrl, '_blank')}
              style={{
                width: '56px', height: '56px',
                background: 'white', border: '2px solid #E2E8F0', borderRadius: '16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', flexShrink: 0,
              }}
              title="Descargar PDF"
            >
              <Download size={22} color="#4F46E5" strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
