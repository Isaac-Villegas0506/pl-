'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, Bell, BookOpen, Star } from 'lucide-react'
import type { Notificacion } from '@/hooks/useNotificaciones'

const ICONOS: Record<string, React.ReactNode> = {
  asignacion: <BookOpen size={18} color="#4F46E5" strokeWidth={2} />,
  calificacion: <Star size={18} color="#F59E0B" strokeWidth={2} />,
  recordatorio: <Bell size={18} color="#0EA5E9" strokeWidth={2} />,
  sistema: <Bell size={18} color="#6B7280" strokeWidth={2} />,
  logro: <Star size={18} color="#10B981" strokeWidth={2} />,
}

const COLORES: Record<string, { icoBg: string; border: string }> = {
  asignacion:  { icoBg: '#EEF2FF', border: '#C7D2FE' },
  calificacion: { icoBg: '#FEF3C7', border: '#FCD34D' },
  recordatorio: { icoBg: '#E0F2FE', border: '#BAE6FD' },
  sistema:      { icoBg: '#F3F4F6', border: '#E5E7EB' },
  logro:        { icoBg: '#D1FAE5', border: '#86EFAC' },
}

export default function ToastNotificacion() {
  const [toasts, setToasts] = useState<(Notificacion & { visible: boolean })[]>([])
  const router = useRouter()

  const cerrar = (id: string) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, visible: false } : t))
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 350)
  }

  useEffect(() => {
    const handler = (e: Event) => {
      const notif = (e as CustomEvent<Notificacion>).detail
      setToasts(prev => [...prev, { ...notif, visible: false }])
      requestAnimationFrame(() => {
        setTimeout(() => {
          setToasts(prev => prev.map(t => t.id === notif.id ? { ...t, visible: true } : t))
        }, 50)
      })
      setTimeout(() => cerrar(notif.id), 5000)
    }
    window.addEventListener('nueva_notificacion', handler)
    return () => window.removeEventListener('nueva_notificacion', handler)
  }, [])

  if (!toasts.length) return null

  return (
    <div style={{
      position: 'fixed', top: '12px', left: '12px', right: '12px', zIndex: 99999,
      display: 'flex', flexDirection: 'column', gap: '8px', pointerEvents: 'none',
    }}>
      {toasts.map(toast => {
        const col = COLORES[toast.tipo] ?? COLORES.sistema
        return (
          <div key={toast.id} onClick={() => { cerrar(toast.id); if (toast.accion_url) router.push(toast.accion_url) }}
            style={{
              background: 'white', borderRadius: '18px', padding: '14px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08)',
              border: `1.5px solid ${col.border}`,
              display: 'flex', alignItems: 'flex-start', gap: '10px',
              cursor: toast.accion_url ? 'pointer' : 'default',
              pointerEvents: 'all',
              transform: toast.visible ? 'translateY(0) scale(1)' : 'translateY(-20px) scale(0.95)',
              opacity: toast.visible ? 1 : 0,
              transition: 'transform 0.35s cubic-bezier(0.16,1,0.3,1), opacity 0.3s ease',
            }}
          >
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: col.icoBg, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {ICONOS[toast.tipo]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '14px', fontWeight: '800', color: '#111827', lineHeight: '1.2' }}>
                {toast.titulo}
              </p>
              <p style={{
                fontSize: '13px', color: '#6B7280', marginTop: '3px', lineHeight: '1.4',
                overflow: 'hidden', textOverflow: 'ellipsis',
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              }}>
                {toast.mensaje}
              </p>
            </div>
            <button onClick={(e) => { e.stopPropagation(); cerrar(toast.id) }} style={{
              width: '24px', height: '24px', flexShrink: 0,
              background: '#F3F4F6', border: 'none', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}>
              <X size={12} color="#9CA3AF" strokeWidth={2.5} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
