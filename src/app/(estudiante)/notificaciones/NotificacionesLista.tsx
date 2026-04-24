'use client'

import { useRouter } from 'next/navigation'
import { BookOpen, Clock, Star, Bell } from 'lucide-react'
import { EmptyState } from '@/components/ui'
import { tiempoRelativo } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface Notificacion {
  id: string
  tipo: 'asignacion' | 'vencimiento' | 'calificacion' | 'sistema'
  titulo: string
  mensaje: string | null
  leida: boolean
  url_destino: string | null
  created_at: string
}

interface NotificacionesListaProps {
  notificaciones: Notificacion[]
}

const TIPO_CONFIG: Record<
  string,
  { icon: LucideIcon; iconColor: string; bgColor: string }
> = {
  asignacion: { icon: BookOpen, iconColor: '#2563EB', bgColor: '#EFF6FF' },
  vencimiento: { icon: Clock, iconColor: '#F59E0B', bgColor: '#FEF3C7' },
  calificacion: { icon: Star, iconColor: '#10B981', bgColor: '#D1FAE5' },
  sistema: { icon: Bell, iconColor: '#8B5CF6', bgColor: '#F5F3FF' },
}

export default function NotificacionesLista({
  notificaciones,
}: NotificacionesListaProps) {
  const router = useRouter()

  if (notificaciones.length === 0) {
    return (
      <EmptyState
        icon={Bell}
        title="Sin notificaciones"
        description="Aquí aparecerán tus avisos"
      />
    )
  }

  return (
    <div className="max-w-md mx-auto px-4 py-4 space-y-2">
      {notificaciones.map((n) => {
        const config = TIPO_CONFIG[n.tipo] ?? TIPO_CONFIG.sistema
        const Icon = config.icon
        const noLeida = !n.leida

        return (
          <button
            key={n.id}
            onClick={() => {
              if (n.url_destino) router.push(n.url_destino)
            }}
            className={`w-full flex items-start gap-3 p-3 rounded-[12px] text-left transition-colors ${
              noLeida
                ? 'bg-[#F0F7FF] border-l-[3px] border-l-[#2563EB]'
                : 'bg-white'
            } ${n.url_destino ? 'cursor-pointer hover:bg-[#F8FAFC]' : ''}`}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: config.bgColor }}
            >
              <Icon size={18} style={{ color: config.iconColor }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#0F172A]">
                {n.titulo}
              </p>
              {n.mensaje && (
                <p className="text-sm text-[#475569] line-clamp-2 mt-0.5">
                  {n.mensaje}
                </p>
              )}
              <p className="text-xs text-[#94A3B8] mt-1">
                {tiempoRelativo(n.created_at)}
              </p>
            </div>
          </button>
        )
      })}
    </div>
  )
}
