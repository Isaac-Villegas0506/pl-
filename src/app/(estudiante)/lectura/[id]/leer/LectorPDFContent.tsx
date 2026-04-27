'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { 
  ChevronLeft, Bookmark, Minus, Plus, Sun, Moon, ChevronRight,
  Search, ZoomIn, ZoomOut, AlertCircle 
} from 'lucide-react'

const PDFViewer = dynamic(() => import('./PDFViewer'), { ssr: false })
import { createClient } from '@/lib/supabase/client'
import CompletadoModal from '@/components/lector/CompletadoModal'
import { registrarActividadHoyAction } from '../../../perfil/actions'

function SpinnerCarga() {
  return (
    <div style={{
      width: '100%', minHeight: '300px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        width: '32px', height: '32px', borderRadius: '50%',
        border: '3px solid rgba(255,255,255,0.1)',
        borderTopColor: '#4F46E5',
        animation: 'spin 0.8s linear infinite',
      }} />
    </div>
  )
}

function ErrorCarga() {
  return (
    <div style={{
      width: '100%', minHeight: '300px',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '12px',
    }}>
      <AlertCircle size={32} color="#F43F5E" strokeWidth={1.5} />
      <p style={{
        fontSize: '14px', color: 'rgba(255,255,255,0.6)',
        fontWeight: '600', textAlign: 'center',
      }}>
        No se pudo cargar el PDF
      </p>
    </div>
  )
}

interface LectorPDFContentProps {
  pdfUrl: string
  lecturaId: string
  lecturaTitulo: string
  lecturaAutor: string // FIX 3
  asignacionId: string | null
  totalPreguntas: number
  paginaInicial: number
  estudianteId: string
}

export default function LectorPDFContent({
  pdfUrl,
  lecturaId,
  lecturaTitulo,
  lecturaAutor, // FIX 3
  asignacionId,
  totalPreguntas,
  paginaInicial,
  estudianteId,
}: LectorPDFContentProps) {
  const router = useRouter()
  const supabaseRef = useRef(createClient())
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [numPages, setNumPages] = useState<number | null>(null)
  const [paginaActual, setPaginaActual] = useState(Math.max(1, paginaInicial))
  const [containerWidth, setContainerWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 390
  )
  const [fontSize, setFontSize] = useState(16)
  const [modoOscuro, setModoOscuro] = useState(true)
  const [mostrarAjustes, setMostrarAjustes] = useState(false)
  const [showCompletado, setShowCompletado] = useState(false)

  // ZOOM & PAN
  const [zoom, setZoom] = useState(100)
  const [zoomPanelAbierto, setZoomPanelAbierto] = useState(false)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [arrastrando, setArrastrando] = useState(false)
  const [origenArrastre, setOrigenArrastre] = useState({ x: 0, y: 0 })
  const [offsetInicio, setOffsetInicio] = useState({ x: 0, y: 0 })

  const touchStartRef = useRef<number | null>(null)
  const hasSavedRef = useRef(false)

  // Read preferences from localStorage
  useEffect(() => {
    const savedFont = localStorage.getItem('pl_fontSize')
    const savedModo = localStorage.getItem('pl_modoOscuro')
    if (savedFont) setFontSize(parseInt(savedFont, 10))
    if (savedModo) setModoOscuro(savedModo !== 'false')
  }, [])

  useEffect(() => {
    if (estudianteId) {
      registrarActividadHoyAction(estudianteId).catch(console.error)
    }
  }, [estudianteId])

  // Measure container with ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return

    const observer = new ResizeObserver((entries) => {
      const ancho = entries[0]?.contentRect.width
      if (ancho && ancho > 0) setContainerWidth(ancho)
    })

    observer.observe(containerRef.current)

    // Medición inmediata
    const anchoInicial = containerRef.current.clientWidth
    if (anchoInicial > 0) setContainerWidth(anchoInicial)

    return () => observer.disconnect()
  }, [])

  // Save progress with debounce
  const guardarProgreso = useCallback(
    (pagina: number, terminado: boolean) => {
      if (!numPages) return

      const porcentaje = Math.round((pagina / numPages) * 100)

      const doSave = async () => {
        await (supabaseRef.current as any)
          .from('progreso_lectura')
          .upsert(
            {
              estudiante_id: estudianteId,
              lectura_id: lecturaId,
              pagina_actual: pagina,
              paginas_total: numPages,
              porcentaje,
              terminado,
            },
            { onConflict: 'estudiante_id,lectura_id' }
          )

        if (terminado) {
          await (supabaseRef.current as any)
            .from('historial_lectura')
            .upsert(
              {
                estudiante_id: estudianteId,
                lectura_id: lecturaId,
                fecha_fin: new Date().toISOString(),
              },
              { onConflict: 'estudiante_id,lectura_id' }
            )
        }
      }

      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(doSave, 2000)
    },
    [numPages, estudianteId, lecturaId]
  )

  // Save immediately (no debounce)
  const guardarInmediato = useCallback(async () => {
    if (!numPages || hasSavedRef.current) return
    hasSavedRef.current = true
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)

    const porcentaje = Math.round((paginaActual / numPages) * 100)
    await (supabaseRef.current as any)
      .from('progreso_lectura')
      .upsert(
        {
          estudiante_id: estudianteId,
          lectura_id: lecturaId,
          pagina_actual: paginaActual,
          paginas_total: numPages,
          porcentaje,
          terminado: paginaActual === numPages,
        },
        { onConflict: 'estudiante_id,lectura_id' }
      )
  }, [numPages, paginaActual, estudianteId, lecturaId])

  // Cleanup: save on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [])

  function handlePageChange(newPage: number) {
    if (!numPages || newPage < 1 || newPage > numPages) return
    setPaginaActual(newPage)
    hasSavedRef.current = false
    guardarProgreso(newPage, newPage === numPages)

    if (newPage === numPages) {
      setTimeout(() => setShowCompletado(true), 500)
    }
  }

  // Touch swipe handlers (DISABLED if zoomed in to allow panning)
  function handleTouchStart(e: React.TouchEvent) {
    if (zoom > 100) return
    touchStartRef.current = e.touches[0].clientX
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (zoom > 100 || touchStartRef.current === null) return
    const diff = touchStartRef.current - e.changedTouches[0].clientX
    touchStartRef.current = null

    if (Math.abs(diff) > 50) {
      if (diff > 0) handlePageChange(paginaActual + 1) // swipe left → next
      else handlePageChange(paginaActual - 1) // swipe right → prev
    }
  }

  function handleFontSize(delta: number) {
    const newSize = Math.max(14, Math.min(22, fontSize + delta))
    setFontSize(newSize)
    localStorage.setItem('pl_fontSize', String(newSize))
  }

  function toggleModo() {
    setModoOscuro(!modoOscuro)
    localStorage.setItem('pl_modoOscuro', String(!modoOscuro))
  }

  // ZOOM & PAN FUNCTIONS
  const subirZoom = () => setZoom(prev => Math.min(prev + 5, 300))
  const bajarZoom = () => {
    setZoom(prev => {
      const nuevo = Math.max(prev - 5, 50)
      if (nuevo <= 100) setOffset({ x: 0, y: 0 })
      return nuevo
    })
  }
  const resetZoom = () => {
    setZoom(100)
    setOffset({ x: 0, y: 0 })
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    if (zoom <= 100) return
    setArrastrando(true)
    setOrigenArrastre({ x: e.clientX, y: e.clientY })
    setOffsetInicio({ ...offset })
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!arrastrando || zoom <= 100) return
    const dx = e.clientX - origenArrastre.x
    const dy = e.clientY - origenArrastre.y
    setOffset({
      x: offsetInicio.x + dx,
      y: offsetInicio.y + dy,
    })
  }

  const handlePointerUp = () => setArrastrando(false)

  async function handleBack() {
    await guardarInmediato()
    router.push(`/lectura/${lecturaId}`)
  }

  const bgColor = modoOscuro ? '#1A1A2E' : '#F8F9FA'
  const textColor = modoOscuro ? '#FFFFFF' : '#0F172A'
  const headerBg = modoOscuro ? '#1A1A2E' : '#FFFFFF'
  const porcentaje = numPages ? Math.round((paginaActual / numPages) * 100) : 0
  const anchoPDF = Math.floor((containerWidth * zoom) / 100)

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 200,
      background: bgColor,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* HEADER FIJO */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: '60px',
        background: 'linear-gradient(135deg, #0F0C29, #302B63)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center',
        padding: '0 16px', gap: '12px',
        boxShadow: '0 2px 16px rgba(0,0,0,0.3)',
      }}>
        {/* Botón atrás */}
        <button
          onClick={handleBack}
          style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'rgba(255,255,255,0.1)',
            border: 'none', cursor: 'pointer', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <ChevronLeft size={20} color="white" strokeWidth={2.5} />
        </button>

        {/* Título */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: '15px', fontWeight: '700', color: 'white',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            margin: 0,
          }}>
            {lecturaTitulo}
          </p>
          <p style={{ 
            fontSize: '11px', color: 'rgba(255,255,255,0.45)',
            fontWeight: '500', marginTop: '1px', margin: 0,
          }}>
            {lecturaAutor}
          </p>
        </div>

        {/* Botón ajustes */}
        <button
          onClick={() => setMostrarAjustes(!mostrarAjustes)}
          style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'rgba(255,255,255,0.1)',
            border: 'none', cursor: 'pointer', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: '14px', fontWeight: 'bold'
          }}
        >
          A
        </button>

        {/* Botón bookmark */}
        <button style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: 'rgba(255,255,255,0.1)',
          border: 'none', cursor: 'pointer', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Bookmark size={18} color="white" strokeWidth={2} />
        </button>
      </div>

      {/* SETTINGS PANEL */}
      {mostrarAjustes && (
        <div className="px-4 py-4 space-y-4" style={{ 
          position: 'fixed', top: '60px', left: 0, right: 0, zIndex: 90,
          backgroundColor: modoOscuro ? '#2D2D44' : '#F1F5F9',
          borderBottom: '1px solid rgba(0,0,0,0.1)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          animation: 'slideDown 0.2s ease'
        }}>
          <div className="flex items-center justify-center gap-4">
            <button onClick={() => handleFontSize(-2)} className="cursor-pointer w-8 h-8 rounded-full flex items-center justify-center bg-white/10">
              <Minus size={16} style={{ color: textColor }} />
            </button>
            <div className="flex gap-1.5">
              {[14, 16, 18, 20, 22].map((s) => (
                <div key={s} className={`w-2.5 h-2.5 rounded-full ${fontSize >= s ? 'bg-[#2563EB]' : 'bg-white/20'}`} />
              ))}
            </div>
            <button onClick={() => handleFontSize(2)} className="cursor-pointer w-8 h-8 rounded-full flex items-center justify-center bg-white/10">
              <Plus size={16} style={{ color: textColor }} />
            </button>
          </div>
          <div className="flex gap-2 justify-center">
            <button onClick={() => { setModoOscuro(false); localStorage.setItem('pl_modoOscuro', 'false') }}
              className={`px-4 py-2 rounded-full text-sm cursor-pointer flex items-center gap-2 ${!modoOscuro ? 'bg-[#2563EB] text-white' : 'bg-white/10 text-white/70'}`}>
              <Sun size={14} /> Claro
            </button>
            <button onClick={() => { setModoOscuro(true); localStorage.setItem('pl_modoOscuro', 'true') }}
              className={`px-4 py-2 rounded-full text-sm cursor-pointer flex items-center gap-2 ${modoOscuro ? 'bg-[#2563EB] text-white' : 'bg-white/10 text-white/70'}`}>
              <Moon size={14} /> Oscuro
            </button>
          </div>
        </div>
      )}

      {/* ÁREA DEL PDF */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{ 
          flex: 1, 
          width: '100%',
          overflow: zoom > 100 ? 'hidden' : 'auto', 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'flex-start',
          cursor: zoom > 100 ? (arrastrando ? 'grabbing' : 'grab') : 'default',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          paddingTop: '68px', // To avoid header overlap
          paddingBottom: '64px', // To avoid footer overlap
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div style={{
          transform: `translate(${offset.x}px, ${offset.y}px)`,
          transition: arrastrando ? 'none' : 'transform 0.15s ease',
          transformOrigin: 'top center',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
        }}>
          <PDFViewer
            pdfUrl={`/api/pdf-proxy?url=${encodeURIComponent(pdfUrl)}`}
            paginaActual={paginaActual}
            width={anchoPDF}
            onLoadSuccess={(pages) => setNumPages(pages)}
            loading={<SpinnerCarga />}
            error={<ErrorCarga />}
          />
        </div>
      </div>

      {/* FOOTER PREMIUM — FLOATING DOCK */}
      <div style={{
        position: 'fixed',
        bottom: '16px',
        left: '16px',
        right: '16px',
        zIndex: 100,
        background: modoOscuro ? 'rgba(30, 30, 50, 0.92)' : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: '24px',
        padding: '12px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        border: modoOscuro ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.05)',
      }}>
        {/* Fila superior: Paginación */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={() => handlePageChange(paginaActual - 1)}
            disabled={paginaActual <= 1}
            style={{
              padding: '8px 12px',
              borderRadius: '12px',
              border: 'none',
              background: 'rgba(255,255,255,0.05)',
              color: paginaActual <= 1 ? 'rgba(148,163,184,0.3)' : '#94A3B8',
              cursor: paginaActual <= 1 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: '700',
            }}
          >
            <ChevronLeft size={16} /> Anterior
          </button>

          <div style={{ textAlign: 'center' }}>
            <p style={{
              fontSize: '14px',
              fontWeight: '800',
              color: textColor,
              margin: 0,
            }}>
              Pág. {paginaActual} <span style={{ color: '#94A3B8', fontWeight: '400' }}>de</span> {numPages ?? '...'}
            </p>
          </div>

          <button
            onClick={() => handlePageChange(paginaActual + 1)}
            disabled={!numPages || paginaActual >= numPages}
            style={{
              padding: '8px 12px',
              borderRadius: '12px',
              border: 'none',
              background: 'rgba(255,255,255,0.05)',
              color: (!numPages || paginaActual >= numPages) ? 'rgba(148,163,184,0.3)' : '#94A3B8',
              cursor: (!numPages || paginaActual >= numPages) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: '700',
            }}
          >
            Siguiente <ChevronRight size={16} />
          </button>
        </div>

        {/* Fila inferior: Barra de progreso */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            flex: 1,
            height: '6px',
            background: modoOscuro ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            borderRadius: '10px',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${porcentaje}%`,
              background: 'linear-gradient(90deg, #4F46E5, #818CF8)',
              borderRadius: '10px',
              transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: '0 0 10px rgba(79,70,229,0.4)',
            }} />
          </div>
          <span style={{
            fontSize: '12px',
            fontWeight: '800',
            color: '#4F46E5',
            minWidth: '35px',
          }}>
            {porcentaje}%
          </span>
        </div>
      </div>

      {/* Botón lupa (siempre visible) */}
      <button
        onClick={() => setZoomPanelAbierto(prev => !prev)}
        style={{
          position: 'absolute',
          bottom: '120px',
          right: '16px',
          width: '44px',
          height: '44px',
          borderRadius: '13px',
          background: zoomPanelAbierto
            ? 'linear-gradient(135deg, #4F46E5, #6D28D9)'
            : 'rgba(255,255,255,0.12)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          transition: 'all 0.2s',
          zIndex: 110,
        }}
      >
        <Search size={20} color="white" strokeWidth={2} />
      </button>

      {/* Panel de controles de zoom */}
      {zoomPanelAbierto && (
        <div style={{
          position: 'absolute',
          bottom: '172px',
          right: '16px',
          background: 'rgba(15,12,41,0.95)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: '18px',
          padding: '14px',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
          zIndex: 110,
          animation: 'slideUp 0.2s ease',
          minWidth: '72px',
        }}>

          {/* Botón + */}
          <button
            onClick={subirZoom}
            disabled={zoom >= 300}
            style={{
              width: '44px', height: '44px', borderRadius: '12px',
              background: zoom >= 300
                ? 'rgba(255,255,255,0.05)'
                : 'rgba(255,255,255,0.12)',
              border: 'none', cursor: zoom >= 300 ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
            }}
          >
            <ZoomIn size={20} color={zoom >= 300 ? 'rgba(255,255,255,0.3)' : 'white'} strokeWidth={2} />
          </button>

          {/* Porcentaje actual */}
          <button
            onClick={resetZoom}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: '2px', padding: '4px',
            }}
          >
            <span style={{
              fontSize: '17px', fontWeight: '800', color: 'white',
              lineHeight: '1',
            }}>
              {zoom}
            </span>
            <span style={{
              fontSize: '10px', fontWeight: '600',
              color: 'rgba(255,255,255,0.45)',
              lineHeight: '1',
            }}>
              %
            </span>
            {zoom !== 100 && (
              <span style={{
                fontSize: '9px', color: '#818CF8',
                fontWeight: '600', marginTop: '2px',
              }}>
                reset
              </span>
            )}
          </button>

          {/* Botón − */}
          <button
            onClick={bajarZoom}
            disabled={zoom <= 50}
            style={{
              width: '44px', height: '44px', borderRadius: '12px',
              background: zoom <= 50
                ? 'rgba(255,255,255,0.05)'
                : 'rgba(255,255,255,0.12)',
              border: 'none', cursor: zoom <= 50 ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
            }}
          >
            <ZoomOut size={20} color={zoom <= 50 ? 'rgba(255,255,255,0.3)' : 'white'} strokeWidth={2} />
          </button>

        </div>
      )}

      {/* COMPLETADO MODAL */}
      <CompletadoModal
        isOpen={showCompletado}
        titulo={lecturaTitulo}
        tienePreguntas={totalPreguntas > 0}
        asignacionId={asignacionId}
        onEvaluar={() => asignacionId && router.push(`/evaluacion/${asignacionId}`)}
        onVolver={() => router.push('/inicio')}
      />
    </div>
  )
}
