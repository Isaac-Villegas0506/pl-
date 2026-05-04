'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import {
  ChevronLeft, Bookmark, Minus, Plus, Sun, Moon, ChevronRight,
  Search, ZoomIn, ZoomOut, AlertCircle, Trophy, Type, Contrast
} from 'lucide-react'

const PDFViewer = dynamic(() => import('./PDFViewer'), { ssr: false })
import { createClient } from '@/lib/supabase/client'
import { registrarActividadHoyAction } from '../../../perfil/actions'
import { toggleFavoritoAction } from '../actions'

function SpinnerCarga() {
  return (
    <div style={{ width: '100%', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '3px solid #E2E8F0', borderTopColor: '#4F46E5', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )
}

function ErrorCarga() {
  return (
    <div style={{ width: '100%', minHeight: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
      <AlertCircle size={32} color="#F43F5E" />
      <p style={{ fontSize: '14px', color: '#64748B', fontWeight: 600 }}>No se pudo cargar el PDF</p>
    </div>
  )
}

interface LectorPDFContentProps {
  pdfUrl: string
  lecturaId: string
  lecturaTitulo: string
  lecturaAutor: string
  portadaUrl: string | null
  asignacionId: string | null
  totalPreguntas: number
  paginaInicial: number
  estudianteId: string
  esFavoritoInicial: boolean
}

export default function LectorPDFContent({
  pdfUrl, lecturaId, lecturaTitulo, lecturaAutor, portadaUrl,
  asignacionId, totalPreguntas, paginaInicial, estudianteId, esFavoritoInicial,
}: LectorPDFContentProps) {
  const router = useRouter()
  const supabaseRef = useRef(createClient())
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [numPages, setNumPages] = useState<number | null>(null)
  const [paginaActual, setPaginaActual] = useState(Math.max(1, paginaInicial))
  const [containerWidth, setContainerWidth] = useState(390)
  const [modoOscuro, setModoOscuro] = useState(false)
  const [mostrarAjustes, setMostrarAjustes] = useState(false)
  const [showCompletado, setShowCompletado] = useState(false)
  const [esFavorito, setEsFavorito] = useState(esFavoritoInicial)
  const [zoom, setZoom] = useState(100)
  const [zoomPanelAbierto, setZoomPanelAbierto] = useState(false)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [arrastrando, setArrastrando] = useState(false)
  const [origenArrastre, setOrigenArrastre] = useState({ x: 0, y: 0 })
  const [offsetInicio, setOffsetInicio] = useState({ x: 0, y: 0 })
  const touchStartRef = useRef<number | null>(null)
  const hasSavedRef = useRef(false)

  useEffect(() => {
    const m = localStorage.getItem('pl_modoOscuro')
    if (m) setModoOscuro(m === 'true')
  }, [])

  useEffect(() => { if (estudianteId) registrarActividadHoyAction(estudianteId).catch(console.error) }, [estudianteId])

  useEffect(() => {
    if (!containerRef.current) return
    const obs = new ResizeObserver(e => { const w = e[0]?.contentRect.width; if (w && w > 0) setContainerWidth(w) })
    obs.observe(containerRef.current)
    const iw = containerRef.current.clientWidth; if (iw > 0) setContainerWidth(iw)
    return () => obs.disconnect()
  }, [])

  const guardarProgreso = useCallback((pagina: number, terminado: boolean) => {
    if (!numPages) return
    const pct = Math.round((pagina / numPages) * 100)
    const doSave = async () => { await (supabaseRef.current as any).from('progreso_lectura').upsert({ estudiante_id: estudianteId, lectura_id: lecturaId, pagina_actual: pagina, paginas_total: numPages, porcentaje: pct, terminado }, { onConflict: 'estudiante_id,lectura_id' }) }
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(doSave, 2000)
  }, [numPages, estudianteId, lecturaId])

  const guardarInmediato = useCallback(async () => {
    if (!numPages || hasSavedRef.current) return
    hasSavedRef.current = true
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    await (supabaseRef.current as any).from('progreso_lectura').upsert({ estudiante_id: estudianteId, lectura_id: lecturaId, pagina_actual: paginaActual, paginas_total: numPages, porcentaje: Math.round((paginaActual / numPages) * 100), terminado: paginaActual === numPages }, { onConflict: 'estudiante_id,lectura_id' })
  }, [numPages, paginaActual, estudianteId, lecturaId])

  useEffect(() => () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current) }, [])

  function handlePageChange(n: number) {
    if (!numPages || n < 1 || n > numPages) return
    setPaginaActual(n); hasSavedRef.current = false; guardarProgreso(n, n === numPages)
    if (n === numPages) setTimeout(() => setShowCompletado(true), 500)
  }

  const handleTouchStart = (e: React.TouchEvent) => { if (zoom === 100) touchStartRef.current = e.touches[0].clientX }
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (zoom > 100 || touchStartRef.current === null) return
    const d = touchStartRef.current - e.changedTouches[0].clientX; touchStartRef.current = null
    if (Math.abs(d) > 50) handlePageChange(paginaActual + (d > 0 ? 1 : -1))
  }

  const toggleFav = async () => { const r = await toggleFavoritoAction(lecturaId, estudianteId, esFavorito); if (r.success) setEsFavorito(r.esFavorito) }

  const handlePointerDown = (e: React.PointerEvent) => { if (zoom <= 100) return; setArrastrando(true); setOrigenArrastre({ x: e.clientX, y: e.clientY }); setOffsetInicio({ ...offset }); e.currentTarget.setPointerCapture(e.pointerId) }
  const handlePointerMove = (e: React.PointerEvent) => { if (!arrastrando || zoom <= 100) return; setOffset({ x: offsetInicio.x + (e.clientX - origenArrastre.x), y: offsetInicio.y + (e.clientY - origenArrastre.y) }) }
  const handlePointerUp = () => setArrastrando(false)

  async function handleBack() { await guardarInmediato(); router.push(`/lectura/${lecturaId}`) }

  const pct = numPages ? Math.round((paginaActual / numPages) * 100) : 0
  const pdfW = Math.floor((containerWidth * zoom) / 100)
  const bg = modoOscuro ? '#0F172A' : '#F7F9FB'

  return (
    <div className="reader-container" style={{ position: 'fixed', inset: 0, zIndex: 300, background: bg, display: 'flex', flexDirection: 'column' }}>

      {/* === TOP APP BAR === */}
      <header style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '64px', zIndex: 50, background: modoOscuro ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid', borderColor: modoOscuro ? 'rgba(255,255,255,0.06)' : '#F1F5F9', boxShadow: '0 1px 6px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={handleBack} style={{ width: '40px', height: '40px', borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: modoOscuro ? '#94A3B8' : '#64748B' }}>
            <ChevronLeft size={24} />
          </button>
          <span className="hide-mobile" style={{ fontSize: '16px', fontWeight: 800, color: modoOscuro ? 'white' : '#0F172A' }}>Plan Lectura</span>
        </div>
        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', pointerEvents: 'none' }}>
          <p style={{ fontSize: '15px', fontWeight: 700, color: modoOscuro ? 'white' : '#0F172A', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>{lecturaTitulo}</p>
          <p style={{ fontSize: '11px', color: modoOscuro ? '#64748B' : '#94A3B8', fontWeight: 600, margin: 0 }}>{lecturaAutor}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {[
            { Icon: Search, active: mostrarAjustes, onClick: () => setMostrarAjustes(!mostrarAjustes) },
            { Icon: Contrast, active: modoOscuro, onClick: () => { setModoOscuro(!modoOscuro); localStorage.setItem('pl_modoOscuro', String(!modoOscuro)) } },
            { Icon: Bookmark, active: esFavorito, onClick: toggleFav, fill: esFavorito },
          ].map(({ Icon, active, onClick, fill }, i) => (
            <button key={i} onClick={onClick} style={{ width: '40px', height: '40px', borderRadius: '50%', border: 'none', background: active ? (modoOscuro ? 'rgba(79,70,229,0.2)' : '#EEF2FF') : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: active ? '#4F46E5' : (modoOscuro ? '#94A3B8' : '#64748B'), transition: '0.2s' }}>
              <Icon size={20} fill={fill ? 'currentColor' : 'none'} />
            </button>
          ))}
        </div>
      </header>

      {/* === SETTINGS DROPDOWN === */}
      {mostrarAjustes && (
        <div style={{ position: 'absolute', top: '64px', right: '16px', zIndex: 55, background: modoOscuro ? '#1E293B' : 'white', border: '1px solid', borderColor: modoOscuro ? '#334155' : '#F1F5F9', borderRadius: '16px', padding: '20px', boxShadow: '0 20px 50px rgba(0,0,0,0.15)', minWidth: '260px', animation: 'slideUp 0.2s ease' }}>
          <p style={{ fontSize: '10px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Zoom</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: modoOscuro ? '#0F172A' : '#F8FAFC', padding: '8px', borderRadius: '12px' }}>
            <button onClick={() => setZoom(Math.max(50, zoom - 10))} style={{ width: '36px', height: '36px', borderRadius: '10px', border: 'none', background: modoOscuro ? '#1E293B' : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: modoOscuro ? 'white' : '#0F172A' }}><Minus size={16} /></button>
            <span style={{ fontWeight: 800, fontSize: '15px', color: modoOscuro ? 'white' : '#0F172A' }}>{zoom}%</span>
            <button onClick={() => setZoom(Math.min(300, zoom + 10))} style={{ width: '36px', height: '36px', borderRadius: '10px', border: 'none', background: modoOscuro ? '#1E293B' : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: modoOscuro ? 'white' : '#0F172A' }}><Plus size={16} /></button>
          </div>
        </div>
      )}

      {/* === MAIN READING AREA === */}
      <main style={{ flex: 1, paddingTop: '80px', paddingBottom: '100px', overflow: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '80px 16px 100px' }}
        className="lector-main-area"
      >
        <article className="lector-article" style={{ background: modoOscuro ? '#1E293B' : 'white', width: '100%', maxWidth: '960px', borderRadius: '16px', boxShadow: modoOscuro ? 'none' : '0 10px 40px -10px rgba(0,0,0,0.05)', border: '1px solid', borderColor: modoOscuro ? '#334155' : '#E2E8F0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

          {/* PDF Content */}
          <div
            ref={containerRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            style={{ flex: 1, overflow: zoom > 100 ? 'hidden' : 'auto', display: 'flex', justifyContent: 'center', padding: '16px', cursor: zoom > 100 ? (arrastrando ? 'grabbing' : 'grab') : 'default', userSelect: 'none' }}
          >
            <div style={{ transform: `translate(${offset.x}px, ${offset.y}px)`, transition: arrastrando ? 'none' : 'transform 0.15s ease', transformOrigin: 'top center' }}>
              <PDFViewer
                pdfUrl={`/api/pdf-proxy?url=${encodeURIComponent(pdfUrl)}`}
                paginaActual={paginaActual}
                width={pdfW}
                onLoadSuccess={setNumPages}
                loading={<SpinnerCarga />}
                error={<ErrorCarga />}
              />
            </div>
          </div>
        </article>
      </main>

      {/* === BOTTOM NAVIGATION === */}
      <nav style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '80px', zIndex: 50, background: modoOscuro ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', borderTop: '1px solid', borderColor: modoOscuro ? 'rgba(255,255,255,0.06)' : '#F1F5F9', boxShadow: '0 -8px 30px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px' }}>
        <button onClick={() => handlePageChange(paginaActual - 1)} disabled={paginaActual <= 1} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: paginaActual <= 1 ? 'not-allowed' : 'pointer', opacity: paginaActual <= 1 ? 0.3 : 1, padding: '8px 16px', color: modoOscuro ? '#94A3B8' : '#64748B' }}>
          <ChevronLeft size={20} />
          <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Anterior</span>
        </button>

        {/* Progress (hidden on small mobile) */}
        <div className="hide-mobile" style={{ flex: 1, maxWidth: '400px', margin: '0 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '100%', height: '6px', background: modoOscuro ? '#1E293B' : '#E2E8F0', borderRadius: '99px', overflow: 'hidden', marginBottom: '8px' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: '#4F46E5', borderRadius: '99px', transition: 'width 0.4s ease' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '11px', fontWeight: 700, color: modoOscuro ? '#64748B' : '#94A3B8' }}>
            <span>{pct}%</span>
            <span>Página {paginaActual} de {numPages ?? '...'}</span>
          </div>
        </div>

        {/* Mobile-only mini progress */}
        <div className="hide-desktop" style={{ flex: 1, textAlign: 'center' }}>
          <span style={{ fontSize: '13px', fontWeight: 800, color: modoOscuro ? 'white' : '#0F172A' }}>{paginaActual}</span>
          <span style={{ fontSize: '12px', color: '#94A3B8', margin: '0 4px' }}>/</span>
          <span style={{ fontSize: '12px', color: '#94A3B8' }}>{numPages ?? '...'}</span>
        </div>

        <button onClick={() => handlePageChange(paginaActual + 1)} disabled={!numPages || paginaActual >= numPages} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: modoOscuro ? 'rgba(79,70,229,0.15)' : '#EEF2FF', border: 'none', borderRadius: '99px', cursor: (!numPages || paginaActual >= numPages) ? 'not-allowed' : 'pointer', opacity: (!numPages || paginaActual >= numPages) ? 0.3 : 1, padding: '8px 24px', color: '#4F46E5' }}>
          <ChevronRight size={20} />
          <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Siguiente</span>
        </button>
      </nav>

      {/* === COMPLETADO MODAL === */}
      {showCompletado && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }} />
          <div style={{ position: 'relative', background: 'white', width: '100%', maxWidth: '380px', borderRadius: '32px', padding: '40px 24px', textAlign: 'center', animation: 'slideUp 0.3s ease' }}>
            <div style={{ width: '88px', height: '88px', borderRadius: '24px', background: 'linear-gradient(135deg, #FFD700, #F97316)', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 12px 30px rgba(249,115,22,0.3)', transform: 'rotate(-3deg)' }}>
              <Trophy size={44} color="white" />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#0F172A', marginBottom: '8px' }}>¡Lectura Completada!</h2>
            <p style={{ fontSize: '15px', color: '#64748B', marginBottom: '28px' }}>Has terminado <span style={{ color: '#4F46E5', fontWeight: 700 }}>"{lecturaTitulo}"</span></p>
            <button onClick={() => router.push('/inicio')} style={{ width: '100%', height: '52px', background: '#4F46E5', border: 'none', borderRadius: '16px', fontSize: '16px', fontWeight: 800, color: 'white', cursor: 'pointer', boxShadow: '0 8px 20px rgba(79,70,229,0.25)', marginBottom: '10px' }}>Volver al inicio</button>
            {(totalPreguntas > 0 && asignacionId) && (
              <button onClick={() => router.push(`/evaluacion/${asignacionId}`)} style={{ width: '100%', height: '48px', background: 'white', border: '2px solid #F1F5F9', borderRadius: '16px', fontSize: '14px', fontWeight: 700, color: '#475569', cursor: 'pointer' }}>Ir a la evaluación</button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
