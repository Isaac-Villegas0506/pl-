'use client'
import { useState } from 'react'
import { Download, WifiOff, Trash2, Loader } from 'lucide-react'
import { useDescargaOffline } from '@/hooks/useDescargaOffline'

interface Props {
  lecturaId: string
  lecturaTitulo: string
  pdfUrl: string
  descargada: boolean
  estudianteId: string
  onDescargaCompleta?: () => void
}

export default function BtnDescargar({
  lecturaId, lecturaTitulo, pdfUrl,
  descargada: descargadaInicial, estudianteId, onDescargaCompleta,
}: Props) {
  const [estadoLocal, setEstadoLocal] = useState<
    'idle' | 'descargando' | 'completo' | 'error'
  >(descargadaInicial ? 'completo' : 'idle')
  const [progreso, setProgreso] = useState(0)
  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false)
  const { descargar, eliminar } = useDescargaOffline([])

  const handleDescargar = async () => {
    if (estadoLocal === 'completo') {
      setConfirmandoEliminar(true)
      return
    }
    setEstadoLocal('descargando')
    setProgreso(0)

    try {
      await descargar(lecturaId, pdfUrl, lecturaTitulo, estudianteId)
      setEstadoLocal('completo')
      setProgreso(100)
      onDescargaCompleta?.()
    } catch {
      setEstadoLocal('error')
    }
  }

  const handleEliminar = async () => {
    await eliminar(lecturaId, estudianteId)
    setEstadoLocal('idle')
    setProgreso(0)
    setConfirmandoEliminar(false)
  }

  if (confirmandoEliminar) {
    return (
      <div style={{
        display: 'flex', gap: '6px', alignItems: 'center',
      }}>
        <button onClick={() => setConfirmandoEliminar(false)} style={{
          height: '42px', padding: '0 12px', borderRadius: '12px',
          background: '#F3F4F6', border: 'none',
          fontSize: '13px', fontWeight: '600', color: '#6B7280',
          cursor: 'pointer', fontFamily: 'inherit',
        }}>
          Cancelar
        </button>
        <button onClick={handleEliminar} style={{
          height: '42px', padding: '0 12px', borderRadius: '12px',
          background: '#FFF1F2', border: '1.5px solid #FDA4AF',
          fontSize: '13px', fontWeight: '700', color: '#F43F5E',
          cursor: 'pointer', fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', gap: '4px',
        }}>
          <Trash2 size={14} /> Eliminar
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleDescargar}
      disabled={estadoLocal === 'descargando'}
      style={{
        width: '42px', height: '42px', borderRadius: '12px',
        border: 'none', cursor: estadoLocal === 'descargando' ? 'wait' : 'pointer',
        background: estadoLocal === 'completo'
          ? '#ECFDF5'
          : estadoLocal === 'error'
            ? '#FFF1F2'
            : '#F5F3FF',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, position: 'relative', overflow: 'hidden',
        transition: 'all 0.2s',
      }}
    >
      {/* Barra de progreso de fondo (fill from bottom) */}
      {estadoLocal === 'descargando' && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: '#EEF2FF',
          height: `${progreso}%`,
          transition: 'height 0.2s ease',
          zIndex: 0,
        }} />
      )}

      <div style={{ position: 'relative', zIndex: 1 }}>
        {estadoLocal === 'idle' && (
          <Download size={17} color="#4F46E5" strokeWidth={2.5} />
        )}
        {estadoLocal === 'descargando' && (
          <Loader size={17} color="#4F46E5" strokeWidth={2.5}
            style={{ animation: 'spin 1s linear infinite' }} />
        )}
        {estadoLocal === 'completo' && (
          <WifiOff size={17} color="#10B981" strokeWidth={2.5} />
        )}
        {estadoLocal === 'error' && (
          <Download size={17} color="#F43F5E" strokeWidth={2.5} />
        )}
      </div>
    </button>
  )
}
