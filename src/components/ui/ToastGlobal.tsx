'use client'
import { useState, useEffect, useCallback } from 'react'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'

export type TipoToast = 'exito' | 'error' | 'info' | 'advertencia'
interface ToastItem {
  id: string; tipo: TipoToast; mensaje: string; visible: boolean
}

// ── Singleton de eventos ──────────────────────────────────
const listeners: ((toast: Omit<ToastItem, 'id' | 'visible'>) => void)[] = []

export function mostrarToast(tipo: TipoToast, mensaje: string) {
  listeners.forEach(fn => fn({ tipo, mensaje }))
}

// ── Componente ────────────────────────────────────────────
export default function ToastGlobal() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const agregar = useCallback((data: Omit<ToastItem, 'id' | 'visible'>) => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { ...data, id, visible: false }])
    requestAnimationFrame(() => {
      setTimeout(() => {
        setToasts(prev => prev.map(t => t.id === id ? { ...t, visible: true } : t))
      }, 30)
    })
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, visible: false } : t))
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, 350)
    }, 3500)
  }, [])

  useEffect(() => {
    listeners.push(agregar)
    return () => { const i = listeners.indexOf(agregar); if (i > -1) listeners.splice(i, 1) }
  }, [agregar])

  const ESTILOS: Record<TipoToast, { bg: string; border: string; icono: React.ReactNode }> = {
    exito:      { bg: '#ECFDF5', border: '#86EFAC', icono: <CheckCircle2 size={18} color="#10B981" /> },
    error:      { bg: '#FFF1F2', border: '#FDA4AF', icono: <XCircle size={18} color="#F43F5E" />     },
    info:       { bg: '#EEF2FF', border: '#C7D2FE', icono: <Info size={18} color="#4F46E5" />        },
    advertencia:{ bg: '#FFFBEB', border: '#FCD34D', icono: <Info size={18} color="#D97706" />        },
  }

  return (
    <div style={{
      position: 'fixed', top: 12, left: 12, right: 12, zIndex: 400,
      display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none',
    }}>
      {toasts.map(t => {
        const est = ESTILOS[t.tipo]
        return (
          <div key={t.id} style={{
            background: 'white', borderRadius: 16, padding: '12px 14px',
            border: `1.5px solid ${est.border}`,
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
            display: 'flex', alignItems: 'center', gap: 10,
            pointerEvents: 'all',
            transform: t.visible ? 'translateY(0) scale(1)' : 'translateY(-12px) scale(0.96)',
            opacity: t.visible ? 1 : 0,
            transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
          }}>
            {est.icono}
            <p style={{ flex: 1, fontSize: 14, fontWeight: 700, color: '#111827' }}>
              {t.mensaje}
            </p>
          </div>
        )
      })}
    </div>
  )
}
