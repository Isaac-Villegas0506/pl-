'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { ChevronLeft, Bookmark, Minus, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import CompletadoModal from '@/components/lector/CompletadoModal'
import { registrarActividadHoyAction } from '../../../perfil/actions'

const PDFViewer = dynamic(() => import('./PDFViewer'), { ssr: false })

interface LectorPDFContentProps {
  pdfUrl: string
  lecturaId: string
  lecturaTitulo: string
  asignacionId: string | null
  totalPreguntas: number
  paginaInicial: number
  estudianteId: string
}

export default function LectorPDFContent({
  pdfUrl,
  lecturaId,
  lecturaTitulo,
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
  const [containerWidth, setContainerWidth] = useState(380)
  const [fontSize, setFontSize] = useState(16)
  const [modoOscuro, setModoOscuro] = useState(true)
  const [mostrarAjustes, setMostrarAjustes] = useState(false)
  const [showCompletado, setShowCompletado] = useState(false)

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

  // Measure container width
  useEffect(() => {
    function handleResize() {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
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

  // Touch swipe handlers
  function handleTouchStart(e: React.TouchEvent) {
    touchStartRef.current = e.touches[0].clientX
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartRef.current === null) return
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

  async function handleBack() {
    await guardarInmediato()
    router.push(`/lectura/${lecturaId}`)
  }

  const bgColor = modoOscuro ? '#1A1A2E' : '#F8F9FA'
  const textColor = modoOscuro ? '#FFFFFF' : '#0F172A'
  const headerBg = modoOscuro ? '#1A1A2E' : '#FFFFFF'
  const porcentaje = numPages ? Math.round((paginaActual / numPages) * 100) : 0

  return (
    <div style={{
      minHeight: '100vh',
      background: bgColor,
      display: 'flex',
      flexDirection: 'column',
      paddingTop: '56px',
      paddingBottom: '56px',
    }}>
      {/* HEADER FIJO */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: '56px',
        background: headerBg,
        borderBottom: modoOscuro ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E5E7EB',
        display: 'flex', alignItems: 'center',
        padding: '0 16px', gap: '12px',
      }}>
        <button onClick={handleBack} className="cursor-pointer shrink-0">
          <ChevronLeft size={24} style={{ color: textColor }} />
        </button>
        <span className="flex-1 text-center text-sm font-medium truncate"
          style={{ color: textColor }}>
          {lecturaTitulo.length > 20 ? lecturaTitulo.slice(0, 20) + '...' : lecturaTitulo}
        </span>
        <button
          onClick={() => setMostrarAjustes(!mostrarAjustes)}
          className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer text-sm font-bold shrink-0"
          style={{ backgroundColor: modoOscuro ? 'rgba(255,255,255,0.1)' : '#F1F5F9', color: textColor }}>
          A
        </button>
        <button className="cursor-pointer shrink-0">
          <Bookmark size={20} style={{ color: textColor }} />
        </button>
      </div>

      {/* SETTINGS PANEL */}
      {mostrarAjustes && (
        <div className="px-4 py-4 space-y-4" style={{ backgroundColor: modoOscuro ? '#2D2D44' : '#F1F5F9' }}>
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
              className={`px-4 py-2 rounded-full text-sm cursor-pointer ${!modoOscuro ? 'bg-[#2563EB] text-white' : 'bg-white/10 text-white/70'}`}>
              ☀ Claro
            </button>
            <button onClick={() => { setModoOscuro(true); localStorage.setItem('pl_modoOscuro', 'true') }}
              className={`px-4 py-2 rounded-full text-sm cursor-pointer ${modoOscuro ? 'bg-[#2563EB] text-white' : 'bg-white/10 text-white/70'}`}>
              🌙 Oscuro
            </button>
          </div>
        </div>
      )}

      {/* ÁREA DEL PDF */}
      <div
        ref={containerRef}
        style={{ flex: 1, overflow: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <PDFViewer
          pdfUrl={`/api/pdf-proxy?url=${encodeURIComponent(pdfUrl)}`}
          paginaActual={paginaActual}
          width={containerWidth}
          onLoadSuccess={(pages) => setNumPages(pages)}
        />
      </div>

      {/* FOOTER FIJO */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
        height: '56px',
        background: headerBg,
        borderTop: modoOscuro ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E5E7EB',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '8px 20px',
        gap: '4px',
      }}>
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => handlePageChange(paginaActual - 1)}
            disabled={paginaActual <= 1}
            className="text-sm cursor-pointer disabled:opacity-30"
            style={{ color: '#94A3B8' }}>
            ← Anterior
          </button>
          <span className="text-sm" style={{ color: '#94A3B8' }}>
            Pág. {paginaActual} de {numPages ?? '...'}
          </span>
          <button
            onClick={() => handlePageChange(paginaActual + 1)}
            disabled={!numPages || paginaActual >= numPages}
            className="text-sm cursor-pointer disabled:opacity-30"
            style={{ color: '#94A3B8' }}>
            Siguiente →
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-[3px] rounded-full" style={{ backgroundColor: modoOscuro ? 'rgba(255,255,255,0.1)' : '#E2E8F0' }}>
            <div className="h-full rounded-full bg-[#2563EB] transition-all duration-300"
              style={{ width: `${porcentaje}%` }} />
          </div>
          <span className="text-sm shrink-0" style={{ color: '#94A3B8' }}>{porcentaje}%</span>
        </div>
      </div>

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
