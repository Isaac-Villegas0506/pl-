'use client'
import { useState, useEffect } from 'react'
import { X, Download, BookOpen } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstalarAppBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [mostrar, setMostrar] = useState(false)
  const [instalando, setInstalando] = useState(false)
  const [visible, setVisible] = useState(false)
  const [esIOS, setEsIOS] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(display-mode: standalone)').matches) return

    const descartado = localStorage.getItem('pwa_banner_descartado')
    if (descartado && Date.now() - parseInt(descartado) < 7 * 24 * 60 * 60 * 1000) return

    // Detectar iOS
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
    setEsIOS(ios)

    if (ios) {
      // En iOS mostrar instrucción manual después de 3s
      const t = setTimeout(() => { setMostrar(true); setTimeout(() => setVisible(true), 100) }, 3000)
      return () => clearTimeout(t)
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setMostrar(true)
      setTimeout(() => setVisible(true), 1500)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstalar = async () => {
    if (!deferredPrompt) return
    setInstalando(true)
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setMostrar(false)
    setDeferredPrompt(null)
    setInstalando(false)
  }

  const handleDescartar = () => {
    setVisible(false)
    setTimeout(() => setMostrar(false), 300)
    localStorage.setItem('pwa_banner_descartado', Date.now().toString())
  }

  if (!mostrar) return null

  return (
    <div style={{
      position: 'fixed', bottom: '76px', left: '12px', right: '12px', zIndex: 9000,
      background: 'white', borderRadius: '20px', padding: '16px',
      boxShadow: '0 -4px 0 0 rgba(79,70,229,0.12), 0 8px 40px rgba(0,0,0,0.14)',
      border: '1px solid rgba(79,70,229,0.1)',
      display: 'flex', alignItems: 'center', gap: '12px',
      transform: visible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.96)',
      opacity: visible ? 1 : 0,
      transition: 'transform 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.3s ease',
    }}>
      <div style={{
        width: '52px', height: '52px', borderRadius: '14px', flexShrink: 0,
        background: 'linear-gradient(135deg, #4F46E5, #6D28D9)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(79,70,229,0.3)',
      }}>
        <BookOpen size={26} color="white" strokeWidth={1.5} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '14px', fontWeight: '800', color: '#111827', lineHeight: '1.2' }}>
          Instala la app
        </p>
        {esIOS ? (
          <p style={{ fontSize: '11px', color: '#6B7280', marginTop: '3px', lineHeight: '1.4' }}>
            Safari → <strong>Compartir</strong> → Añadir a inicio
          </p>
        ) : (
          <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px', lineHeight: '1.4' }}>
            Acceso rápido sin abrir el navegador
          </p>
        )}
      </div>

      {!esIOS && (
        <button onClick={handleInstalar} disabled={instalando} style={{
          height: '38px', padding: '0 14px', flexShrink: 0,
          background: instalando ? '#A5B4FC' : 'linear-gradient(135deg, #4F46E5, #6D28D9)',
          color: 'white', border: 'none', borderRadius: '10px',
          fontSize: '13px', fontWeight: '700',
          cursor: instalando ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', gap: '5px',
          fontFamily: 'inherit',
        }}>
          <Download size={14} strokeWidth={2.5} />
          {instalando ? '...' : 'Instalar'}
        </button>
      )}

      <button onClick={handleDescartar} style={{
        width: '28px', height: '28px', flexShrink: 0,
        background: '#F3F4F6', border: 'none', borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
      }}>
        <X size={14} color="#9CA3AF" strokeWidth={2.5} />
      </button>
    </div>
  )
}
