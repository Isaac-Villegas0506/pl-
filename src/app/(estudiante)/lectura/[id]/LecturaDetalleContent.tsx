'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  ChevronLeft, Bookmark, BookOpen, User, GraduationCap,
  FileText, Calendar, HelpCircle, Download,
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

      {/* CONTENT CARD */}
      <div style={{
        background: 'white',
        borderRadius: '24px 24px 0 0',
        marginTop: '-28px',
        padding: '24px 20px',
        paddingBottom: '120px',
        position: 'relative',
        zIndex: 3,
        minHeight: 'calc(100vh - 272px)',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
      }}>
        {/* Badge */}
        {lectura.materias && (
          <Badge variant="primary" size="sm">{lectura.materias.nombre}</Badge>
        )}

        {/* Title */}
        <h1 className="text-2xl font-bold text-[#0F172A] mt-2">{lectura.titulo}</h1>

        {/* Author */}
        <div className="flex items-center gap-1 mt-1">
          <User size={14} className="text-[#475569]" />
          <span className="text-base text-[#475569]">{lectura.autor}</span>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap gap-3 mt-3">
          {lectura.grados && (
            <div className="flex items-center gap-1 text-sm text-[#94A3B8]">
              <GraduationCap size={14} />
              <span>{lectura.grados.nombre}</span>
            </div>
          )}
          {lectura.paginas_total && (
            <div className="flex items-center gap-1 text-sm text-[#94A3B8]">
              <FileText size={14} />
              <span>{lectura.paginas_total} páginas</span>
            </div>
          )}
          {lectura.anio_publicacion && (
            <div className="flex items-center gap-1 text-sm text-[#94A3B8]">
              <Calendar size={14} />
              <span>{lectura.anio_publicacion}</span>
            </div>
          )}
        </div>

        <div className="border-t border-[#F1F5F9] my-4" />

        {/* Progress */}
        {progreso && progreso.porcentaje > 0 && (
          <>
            <p className="text-sm font-semibold text-[#0F172A]">Tu progreso</p>
            <div className="mt-2">
              <ProgressBar value={progreso.porcentaje} color="primary" size="md" showLabel />
            </div>
            <div className="flex items-center justify-between mt-1 mb-1">
              <span className="text-sm text-[#475569]">{progreso.porcentaje}% completado</span>
              {progreso.paginas_total && (
                <span className="text-sm text-[#94A3B8]">
                  Pág. {progreso.pagina_actual} de {progreso.paginas_total}
                </span>
              )}
            </div>
            <div className="border-t border-[#F1F5F9] my-4" />
          </>
        )}

        {/* Description */}
        {lectura.descripcion && (
          <>
            <p className="text-base font-semibold text-[#0F172A]">Descripción</p>
            <p className={`text-sm text-[#475569] leading-relaxed mt-1 ${!descExpand ? 'line-clamp-4' : ''}`}>
              {lectura.descripcion}
            </p>
            {lectura.descripcion.length > 200 && (
              <button
                onClick={() => setDescExpand(!descExpand)}
                className="text-sm font-medium text-[#2563EB] mt-1 cursor-pointer"
              >
                {descExpand ? 'Ver menos' : 'Ver más'}
              </button>
            )}
          </>
        )}

        {/* Assignment info */}
        {asignacion && (
          <>
            <div className="border-t border-[#F1F5F9] my-4" />
            <p className="text-base font-semibold text-[#0F172A]">Asignación</p>
            <div className="mt-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[12px] p-4 space-y-2">
              {asignacion.instrucciones && (
                <p className="text-sm text-[#475569]">{asignacion.instrucciones}</p>
              )}
              {asignacion.fecha_limite && (
                <p className={`text-sm ${fechaLimiteProxima ? 'text-[#EF4444] font-medium' : 'text-[#94A3B8]'}`}>
                  Fecha límite: {formatFecha(asignacion.fecha_limite)}
                </p>
              )}
              {asignacion.bimestre && (
                <p className="text-sm text-[#94A3B8]">Bimestre: {asignacion.bimestre.nombre}</p>
              )}
            </div>
          </>
        )}

        {/* Questions info */}
        {totalPreguntas > 0 && (
          <div className="mt-4 bg-[#EFF6FF] border border-[#BFDBFE] rounded-[12px] p-4 flex items-start gap-3">
            <HelpCircle size={18} className="text-[#2563EB] mt-0.5 shrink-0" />
            <div>
              <p className="text-sm text-[#2563EB] font-medium">
                Esta lectura tiene {totalPreguntas} {totalPreguntas === 1 ? 'pregunta' : 'preguntas'} de evaluación
              </p>
              <p className="text-xs text-[#475569] mt-0.5">
                Deberás responderlas al terminar la lectura
              </p>
            </div>
          </div>
        )}
      </div>

      {/* FIXED ACTION BUTTONS */}
      <div style={{
        position: 'fixed',
        bottom: '64px',
        left: 0, right: 0,
        zIndex: 50,
        background: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid #F1F5F9',
        padding: '12px 20px',
      }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>

            {yaCompleto ? (
              <div className="space-y-2">
                {totalPreguntas > 0 && asignacion && (
                  <Button variant="primary" fullWidth
                    onClick={() => router.push(`/evaluacion/${asignacion.id}`)}>
                    Ver evaluación
                  </Button>
                )}
                <Button variant="secondary" fullWidth
                  leftIcon={<BookOpen size={16} />}
                  onClick={() => router.push(`/lectura/${lectura.id}/leer`)}>
                  Leer de nuevo
                </Button>
              </div>
            ) : yaEmpezo ? (
              <div className="flex gap-3">
                <Button variant="primary" className="flex-1"
                  leftIcon={<BookOpen size={16} />}
                  onClick={() => router.push(`/lectura/${lectura.id}/leer`)}>
                  Continuar
                </Button>
                {pdfUrl && (
                  <Button variant="outline" className="flex-1"
                    leftIcon={<Download size={16} />}
                    onClick={() => window.open(pdfUrl, '_blank')}>
                    Descargar
                  </Button>
                )}
              </div>
            ) : (
              <Button variant="primary" fullWidth
                leftIcon={<BookOpen size={16} />}
                onClick={() => router.push(`/lectura/${lectura.id}/leer`)}>
                Leer ahora
              </Button>
            )}
        </div>
      </div>
    </div>
  )
}
