const CACHE_NAME = 'plan-lectura-v1'
const OFFLINE_URL = '/offline'

const STATIC_ASSETS = [
  '/',
  '/inicio',
  '/explorar',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS).catch(() => {}))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
      ))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  const url = new URL(event.request.url)
  if (
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('supabase.io') ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/_next/webpack-hmr')
  ) return

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok && event.request.url.startsWith('http')) {
          const cloned = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned))
        }
        return response
      })
      .catch(() =>
        caches.match(event.request).then((cached) => {
          if (cached) return cached
          if (event.request.mode === 'navigate') {
            return caches.match(OFFLINE_URL)
          }
          return new Response('Sin conexión', { status: 503 })
        })
      )
  )
})

self.addEventListener('push', (event) => {
  if (!event.data) return

  let data
  try {
    data = event.data.json()
  } catch {
    data = {
      title: 'Plan de Lectura',
      body: event.data.text(),
      url: '/inicio',
    }
  }

  const options = {
    body: data.body || data.mensaje || '',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || data.accion_url || '/inicio',
      notificacion_id: data.notificacion_id || null,
    },
    tag: data.tag || 'plan-lectura-notif',
    renotify: true,
    requireInteraction: false,
    silent: false,
  }

  event.waitUntil(
    self.registration.showNotification(
      data.title || data.titulo || 'Plan de Lectura',
      options
    )
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const targetUrl = event.notification.data && event.notification.data.url
    ? event.notification.data.url
    : '/inicio'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.focus()
            client.postMessage({ type: 'NAVIGATE', url: targetUrl })
            return
          }
        }
        if (clients.openWindow) return clients.openWindow(targetUrl)
      })
  )
})

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-notificaciones') {
    event.waitUntil(sincronizarNotificaciones())
  }
})

async function sincronizarNotificaciones() {
  const cache = await caches.open(CACHE_NAME)
  const pendingResponse = await cache.match('/__pending_reads__')
  if (!pendingResponse) return

  const pendingIds = await pendingResponse.json()
  if (!pendingIds || !pendingIds.length) return

  try {
    await fetch('/api/notificaciones/marcar-leidas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: pendingIds }),
    })
    await cache.delete('/__pending_reads__')
  } catch {
    // Retry on next sync
  }
}
