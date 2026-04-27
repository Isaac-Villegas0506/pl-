'use client'
import { useEffect } from 'react'

export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return

    const registrar = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none',
        })

        setInterval(() => { registration.update() }, 60 * 60 * 1000)

        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data?.type === 'NAVIGATE') {
            window.location.href = event.data.url
          }
        })
      } catch (error) {
        console.error('[SW] Error al registrar:', error)
      }
    }

    if (document.readyState === 'complete') {
      registrar()
    } else {
      window.addEventListener('load', registrar)
      return () => window.removeEventListener('load', registrar)
    }
  }, [])

  return null
}
