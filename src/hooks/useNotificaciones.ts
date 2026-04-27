'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

export interface Notificacion {
  id: string
  tipo: 'asignacion' | 'calificacion' | 'recordatorio' | 'sistema' | 'logro'
  titulo: string
  mensaje: string
  leida: boolean
  accion_url: string | null
  created_at: string
}

interface UseNotificacionesReturn {
  notificaciones: Notificacion[]
  noLeidas: number
  isLoading: boolean
  marcarLeida: (id: string) => Promise<void>
  marcarTodasLeidas: () => Promise<void>
  cargarMas: () => Promise<void>
  hayMas: boolean
}

const PAGE_SIZE = 20

function dispararToast(notif: Notificacion) {
  window.dispatchEvent(new CustomEvent('nueva_notificacion', { detail: notif }))
}

export function useNotificaciones(usuarioId: string | null): UseNotificacionesReturn {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
  const [noLeidas, setNoLeidas] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [pagina, setPagina] = useState(0)
  const [hayMas, setHayMas] = useState(false)
  const canalRef = useRef<RealtimeChannel | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any

  const cargarNotificaciones = useCallback(async (pag: number) => {
    if (!usuarioId) return
    setIsLoading(true)
    const from = pag * PAGE_SIZE
    const to = from + PAGE_SIZE - 1
    const { data, error } = await supabase
      .from('notificaciones')
      .select('id, tipo, titulo, mensaje, leida, accion_url, created_at')
      .eq('usuario_id', usuarioId)
      .order('created_at', { ascending: false })
      .range(from, to)
    if (!error && data) {
      const rows = data as Notificacion[]
      setNotificaciones(prev => pag === 0 ? rows : [...prev, ...rows])
      setHayMas(data.length === PAGE_SIZE)
    }
    setIsLoading(false)
  }, [usuarioId, supabase])

  const contarNoLeidas = useCallback(async () => {
    if (!usuarioId) return
    const { count } = await supabase
      .from('notificaciones')
      .select('*', { count: 'exact', head: true })
      .eq('usuario_id', usuarioId)
      .eq('leida', false)
    setNoLeidas(count ?? 0)
  }, [usuarioId, supabase])

  useEffect(() => {
    if (!usuarioId) return
    cargarNotificaciones(0)
    contarNoLeidas()

    const canal = supabase
      .channel(`notificaciones_${usuarioId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notificaciones',
        filter: `usuario_id=eq.${usuarioId}`,
      }, (payload: any) => {
        const nueva = payload.new as Notificacion
        setNotificaciones(prev => [nueva, ...prev])
        setNoLeidas(prev => prev + 1)
        dispararToast(nueva)
      })
      .subscribe()

    canalRef.current = canal
    return () => {
      if (canalRef.current) supabase.removeChannel(canalRef.current)
    }
  }, [usuarioId, cargarNotificaciones, contarNoLeidas, supabase])

  const marcarLeida = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('notificaciones').update({ leida: true }).eq('id', id)
    if (!error) {
      setNotificaciones(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n))
      setNoLeidas(prev => Math.max(0, prev - 1))
    }
  }, [supabase])

  const marcarTodasLeidas = useCallback(async () => {
    if (!usuarioId) return
    const { error } = await supabase
      .from('notificaciones').update({ leida: true })
      .eq('usuario_id', usuarioId).eq('leida', false)
    if (!error) {
      setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })))
      setNoLeidas(0)
    }
  }, [usuarioId, supabase])

  const cargarMas = useCallback(async () => {
    const sig = pagina + 1
    setPagina(sig)
    await cargarNotificaciones(sig)
  }, [pagina, cargarNotificaciones])

  return { notificaciones, noLeidas, isLoading, marcarLeida, marcarTodasLeidas, cargarMas, hayMas }
}
