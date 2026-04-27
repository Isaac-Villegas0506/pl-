'use client'
import { useState, useCallback } from 'react'
import { registrarDescargaAction, eliminarDescargaAction } from '@/app/(estudiante)/mis-libros/actions'

const DB_NAME = 'plan-lectura-pdfs'
const DB_VERSION = 1
const STORE_NAME = 'pdfs'

// ── Abrir / crear IndexedDB ─────────────────────────────────
function abrirDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'lecturaId' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

// ── Guardar PDF en IndexedDB ───────────────────────────────
async function guardarPDFenIDB(
  lecturaId: string,
  blob: Blob,
  nombre: string
): Promise<void> {
  const db = await abrirDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put({
      lecturaId,
      blob,
      nombre,
      guardadoEn: new Date().toISOString(),
    })
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

// ── Obtener PDF de IndexedDB ────────────────────────────────
export async function obtenerPDFdeIDB(
  lecturaId: string
): Promise<Blob | null> {
  try {
    const db = await abrirDB()
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const req = tx.objectStore(STORE_NAME).get(lecturaId)
      req.onsuccess = () => resolve(req.result?.blob ?? null)
      req.onerror = () => resolve(null)
    })
  } catch {
    return null
  }
}

// ── Eliminar PDF de IndexedDB ───────────────────────────────
async function eliminarPDFdeIDB(lecturaId: string): Promise<void> {
  const db = await abrirDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).delete(lecturaId)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

// ── Calcular espacio usado ──────────────────────────────────
export async function calcularEspacioIDB(): Promise<number> {
  try {
    const db = await abrirDB()
    return new Promise((resolve) => {
      let total = 0
      const tx = db.transaction(STORE_NAME, 'readonly')
      tx.objectStore(STORE_NAME).openCursor().onsuccess = (e) => {
        const cursor = (e.target as IDBRequest).result
        if (cursor) {
          total += (cursor.value.blob as Blob).size
          cursor.continue()
        } else {
          resolve(total)
        }
      }
    })
  } catch {
    return 0
  }
}

// ── Hook principal ─────────────────────────────────────────
export type EstadoDescarga =
  | 'idle'
  | 'descargando'
  | 'guardando'
  | 'completo'
  | 'error'

interface UseDescargaOfflineReturn {
  estado: EstadoDescarga
  progreso: number           // 0 a 100
  descargar: (lecturaId: string, pdfUrl: string, titulo: string,
              estudianteId: string) => Promise<void>
  eliminar: (lecturaId: string, estudianteId: string) => Promise<void>
  estaDescargada: (lecturaId: string) => boolean
}

export function useDescargaOffline(
  descargasActuales: string[] // lecturaIds ya descargadas
): UseDescargaOfflineReturn {
  const [estados, setEstados] = useState<Record<string, EstadoDescarga>>({})
  const [progresos, setProgresos] = useState<Record<string, number>>({})

  const descargar = useCallback(async (
    lecturaId: string,
    pdfUrl: string,
    titulo: string,
    estudianteId: string
  ) => {
    setEstados(prev => ({ ...prev, [lecturaId]: 'descargando' }))
    setProgresos(prev => ({ ...prev, [lecturaId]: 0 }))

    try {
      // Obtener URL firmada si es de Supabase Storage (privada)
      const urlFinal = pdfUrl.includes('supabase')
        ? await obtenerUrlFirmada(pdfUrl)
        : pdfUrl

      // Descargar con seguimiento de progreso usando fetch + ReadableStream
      const response = await fetch(urlFinal)
      if (!response.ok) throw new Error('Error al descargar')

      const contentLength = response.headers.get('content-length')
      const total = contentLength ? parseInt(contentLength) : 0
      const reader = response.body?.getReader()
      if (!reader) throw new Error('No se pudo leer el stream')

      const chunks: Uint8Array[] = []
      let recibido = 0

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        chunks.push(value)
        recibido += value.length
        if (total > 0) {
          const pct = Math.round((recibido / total) * 85) // 85% para la descarga
          setProgresos(prev => ({ ...prev, [lecturaId]: pct }))
        }
      }

      setEstados(prev => ({ ...prev, [lecturaId]: 'guardando' }))
      setProgresos(prev => ({ ...prev, [lecturaId]: 90 }))

      // Crear Blob y guardar en IndexedDB
      const blob = new Blob(chunks as any[], { type: 'application/pdf' })
      const nombre = `${titulo.replace(/[^a-z0-9]/gi, '_')}.pdf`
      await guardarPDFenIDB(lecturaId, blob, nombre)

      setProgresos(prev => ({ ...prev, [lecturaId]: 98 }))

      // Registrar en Supabase
      await registrarDescargaAction(lecturaId, estudianteId, nombre, blob.size)

      setProgresos(prev => ({ ...prev, [lecturaId]: 100 }))
      setEstados(prev => ({ ...prev, [lecturaId]: 'completo' }))

    } catch (err) {
      console.error('[Descarga] Error:', err)
      setEstados(prev => ({ ...prev, [lecturaId]: 'error' }))
    }
  }, [])

  const eliminar = useCallback(async (
    lecturaId: string,
    estudianteId: string
  ) => {
    await eliminarPDFdeIDB(lecturaId)
    await eliminarDescargaAction(lecturaId, estudianteId)
    setEstados(prev => ({ ...prev, [lecturaId]: 'idle' }))
  }, [])

  const estaDescargada = useCallback((lecturaId: string) => {
    return descargasActuales.includes(lecturaId) ||
           estados[lecturaId] === 'completo'
  }, [descargasActuales, estados])

  return {
    estado: estados['__current'] ?? 'idle',
    progreso: progresos['__current'] ?? 0,
    descargar,
    eliminar,
    estaDescargada,
  }
}

async function obtenerUrlFirmada(ruta: string): Promise<string> {
  const res = await fetch(`/api/storage/url-firmada?ruta=${encodeURIComponent(ruta)}`)
  const { url } = await res.json()
  return url
}
