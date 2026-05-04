'use client'
import { useState, useEffect } from 'react'
import { Bell, X } from 'lucide-react'

interface Props { usuarioId: string }

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)))
}

export default function SolicitarPermisosPush({ usuarioId: _usuarioId }: Props) {
  const [mostrar, setMostrar] = useState(false)
  const [estado, setEstado] = useState<'idle' | 'solicitando' | 'granted' | 'denied'>('idle')

  const suscribirSiNoEsta = async () => {
    if (!('serviceWorker' in navigator)) return
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    if (!vapidKey) return
    try {
      const registration = await navigator.serviceWorker.ready
      const existente = await registration.pushManager.getSubscription()
      if (existente) return
      const rawKey = urlBase64ToUint8Array(vapidKey)
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: rawKey.buffer.slice(rawKey.byteOffset, rawKey.byteOffset + rawKey.byteLength) as ArrayBuffer,
      })
      await fetch('/api/push/suscribir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...subscription.toJSON(), userAgent: navigator.userAgent }),
      })
    } catch (err) {
      console.error('[Push] Error al suscribir:', err)
    }
  }

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return
    if (Notification.permission === 'granted') { suscribirSiNoEsta(); return }
    if (Notification.permission === 'denied') return
    if (localStorage.getItem('push_permiso_preguntado')) return
    const t = setTimeout(() => setMostrar(true), 3000)
    return () => clearTimeout(t)
  }, [])

  const handleActivar = async () => {
    setEstado('solicitando')
    localStorage.setItem('push_permiso_preguntado', 'true')
    const permiso = await Notification.requestPermission()
    if (permiso === 'granted') {
      setEstado('granted')
      await suscribirSiNoEsta()
      setTimeout(() => setMostrar(false), 2000)
    } else {
      setEstado('denied')
      setTimeout(() => setMostrar(false), 2000)
    }
  }

  const handleDescartar = () => {
    localStorage.setItem('push_permiso_preguntado', 'true')
    setMostrar(false)
  }

  if (!mostrar) return null

  if (estado === 'granted') {
    return (
      <div style={{
        position: 'fixed', bottom: '88px', left: '50%', transform: 'translateX(-50%)',
        width: 'calc(100% - 24px)', maxWidth: '440px', zIndex: 8999,
        background: '#ECFDF5', border: '1.5px solid #86EFAC', borderRadius: '16px',
        padding: '14px', display: 'flex', alignItems: 'center', gap: '10px',
        boxShadow: '0 4px 16px rgba(16,185,129,0.2)',
      }}>
        <Bell size={20} color="#10B981" />
        <p style={{ fontSize: '14px', fontWeight: '700', color: '#065F46' }}>
          ¡Notificaciones activadas! 🎉
        </p>
      </div>
    )
  }

  if (estado === 'denied') {
    return (
      <div style={{
        position: 'fixed', bottom: '88px', left: '50%', transform: 'translateX(-50%)',
        width: 'calc(100% - 24px)', maxWidth: '440px', zIndex: 8999,
        background: '#FFF1F2', border: '1.5px solid #FDA4AF', borderRadius: '16px',
        padding: '14px', display: 'flex', alignItems: 'center', gap: '10px',
      }}>
        <Bell size={20} color="#F43F5E" />
        <p style={{ fontSize: '14px', fontWeight: '700', color: '#BE123C' }}>
          Permiso denegado. Puedes activarlo en ajustes.
        </p>
      </div>
    )
  }

  return (
    <div style={{
      position: 'fixed', bottom: '88px', left: '50%', transform: 'translateX(-50%)',
      width: 'calc(100% - 24px)', maxWidth: '440px', zIndex: 8999,
      background: 'white', borderRadius: '20px', padding: '16px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1px solid rgba(79,70,229,0.1)',
    }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '14px', flexShrink: 0,
          background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Bell size={22} color="#4F46E5" strokeWidth={2} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '15px', fontWeight: '800', color: '#111827' }}>
            Activa las notificaciones
          </p>
          <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px', lineHeight: '1.4' }}>
            Te avisamos cuando te asignen lecturas o califiquen tus evaluaciones
          </p>
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <button onClick={handleActivar} disabled={estado === 'solicitando'} style={{
              flex: 1, height: '40px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #4F46E5, #6D28D9)',
              color: 'white', border: 'none', fontSize: '13px', fontWeight: '700',
              cursor: estado === 'solicitando' ? 'wait' : 'pointer', fontFamily: 'inherit',
            }}>
              {estado === 'solicitando' ? 'Activando...' : 'Activar ahora'}
            </button>
            <button onClick={handleDescartar} style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: '#F3F4F6', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <X size={16} color="#9CA3AF" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
