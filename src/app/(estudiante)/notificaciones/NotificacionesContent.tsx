'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, BookOpen, Star } from 'lucide-react'
import { TopBar } from '@/components/layout'
import { useNotificaciones, type Notificacion } from '@/hooks/useNotificaciones'

const ICONOS: Record<string, React.ReactNode> = {
  asignacion:   <BookOpen size={20} color="#4F46E5" strokeWidth={2} />,
  calificacion: <Star    size={20} color="#F59E0B" strokeWidth={2} />,
  recordatorio: <Bell    size={20} color="#0EA5E9" strokeWidth={2} />,
  sistema:      <Bell    size={20} color="#6B7280" strokeWidth={2} />,
  logro:        <Star    size={20} color="#10B981" strokeWidth={2} />,
}

const COLORES: Record<string, { icoBg: string; border: string; texto: string; label: string }> = {
  asignacion:   { icoBg: '#EEF2FF', border: '#C7D2FE', texto: '#4F46E5', label: 'Asignación' },
  calificacion: { icoBg: '#FEF3C7', border: '#FCD34D', texto: '#D97706', label: 'Calificación' },
  recordatorio: { icoBg: '#E0F2FE', border: '#BAE6FD', texto: '#0284C7', label: 'Recordatorio' },
  sistema:      { icoBg: '#F3F4F6', border: '#E5E7EB', texto: '#6B7280', label: 'Sistema' },
  logro:        { icoBg: '#D1FAE5', border: '#86EFAC', texto: '#059669', label: 'Logro' },
}

const FILTROS = [
  { key: 'todas', label: 'Todas' },
  { key: 'no_leidas', label: 'Sin leer' },
  { key: 'asignacion', label: 'Asignaciones' },
  { key: 'calificacion', label: 'Calificaciones' },
] as const
type Filtro = typeof FILTROS[number]['key']

function tiempoRelativo(fecha: string): string {
  const diff = Date.now() - new Date(fecha).getTime()
  const min  = Math.floor(diff / 60000)
  const hora = Math.floor(diff / 3600000)
  const dia  = Math.floor(diff / 86400000)
  if (min < 1)   return 'Ahora'
  if (hora < 1)  return `Hace ${min} min`
  if (dia < 1)   return `Hace ${hora} h`
  if (dia === 1) return `Ayer a las ${new Date(fecha).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}`
  return new Date(fecha).toLocaleDateString('es', { day: 'numeric', month: 'short' })
}

function agrupar(notifs: Notificacion[]) {
  const hoy    = new Date(); hoy.setHours(0,0,0,0)
  const ayer   = new Date(hoy); ayer.setDate(ayer.getDate() - 1)
  const semana = new Date(hoy); semana.setDate(semana.getDate() - 7)
  const grupos: { label: string; items: Notificacion[] }[] = [
    { label: 'Hoy',         items: [] },
    { label: 'Ayer',        items: [] },
    { label: 'Esta semana', items: [] },
    { label: 'Antes',       items: [] },
  ]
  notifs.forEach(n => {
    const d = new Date(n.created_at)
    if (d >= hoy)    grupos[0].items.push(n)
    else if (d >= ayer)   grupos[1].items.push(n)
    else if (d >= semana) grupos[2].items.push(n)
    else              grupos[3].items.push(n)
  })
  return grupos.filter(g => g.items.length > 0)
}

interface Props {
  notificacionesIniciales: Notificacion[]
  usuarioId: string
}

export default function NotificacionesContent({ notificacionesIniciales, usuarioId }: Props) {
  const router = useRouter()
  const { notificaciones, noLeidas, isLoading, marcarLeida, marcarTodasLeidas, cargarMas, hayMas } =
    useNotificaciones(usuarioId)
  const [filtro, setFiltro] = useState<Filtro>('todas')

  const lista = notificaciones.length > 0 ? notificaciones : notificacionesIniciales
  const filtradas = lista.filter(n => {
    if (filtro === 'no_leidas') return !n.leida
    if (filtro === 'todas') return true
    return n.tipo === filtro
  })
  const grupos = agrupar(filtradas)

  async function handleClick(n: Notificacion) {
    if (!n.leida) await marcarLeida(n.id)
    if (n.accion_url) router.push(n.accion_url)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F5F3FF' }}>
      <TopBar
        title="Notificaciones"
        showBack
        rightContent={
          noLeidas > 0 && (
            <button onClick={marcarTodasLeidas} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '13px', fontWeight: '700', color: '#4F46E5',
            }}>
              Marcar leídas
            </button>
          )
        }
      />

      {/* FILTROS */}
      <div style={{ overflowX: 'auto', padding: '12px 16px 0' }}>
        <div style={{ display: 'flex', gap: '8px', width: 'max-content' }}>
          {FILTROS.map(f => {
            const activo = filtro === f.key
            return (
              <button key={f.key} onClick={() => setFiltro(f.key)} style={{
                height: '34px', padding: '0 16px', borderRadius: '99px',
                border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '700',
                background: activo ? '#4F46E5' : 'white',
                color: activo ? 'white' : '#6B7280',
                boxShadow: activo ? '0 2px 8px rgba(79,70,229,0.25)' : '0 1px 4px rgba(0,0,0,0.06)',
              }}>
                {f.label}
                {f.key === 'no_leidas' && noLeidas > 0 && (
                  <span style={{
                    marginLeft: '6px', background: activo ? 'rgba(255,255,255,0.3)' : '#4F46E5',
                    color: activo ? 'white' : 'white', borderRadius: '99px',
                    padding: '1px 6px', fontSize: '11px',
                  }}>{noLeidas}</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* LISTA */}
      <div style={{ padding: '12px 16px' }}>
        {isLoading && notificaciones.length === 0 && (
          <p style={{ textAlign: 'center', color: '#9CA3AF', padding: '40px', fontSize: '14px' }}>
            Cargando...
          </p>
        )}

        {!isLoading && filtradas.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: '#F3F4F6', margin: '0 auto 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Bell size={32} color="#D1D5DB" strokeWidth={1.5} />
            </div>
            <p style={{ fontSize: '18px', fontWeight: '800', color: '#111827' }}>Todo al día</p>
            <p style={{ fontSize: '14px', color: '#9CA3AF', marginTop: '6px' }}>
              No tienes notificaciones pendientes
            </p>
          </div>
        )}

        {grupos.map(grupo => (
          <div key={grupo.label} style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '12px', fontWeight: '700', color: '#9CA3AF', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {grupo.label}
            </p>
            {grupo.items.map(n => {
              const col = COLORES[n.tipo] ?? COLORES.sistema
              return (
                <div key={n.id} onClick={() => handleClick(n)} style={{
                  display: 'flex', gap: '12px', alignItems: 'flex-start',
                  padding: '14px', marginBottom: '8px',
                  background: n.leida ? 'white' : '#F5F3FF',
                  borderRadius: '16px',
                  border: n.leida ? '1px solid rgba(0,0,0,0.04)' : `1.5px solid ${col.border}`,
                  cursor: n.accion_url ? 'pointer' : 'default',
                  boxShadow: n.leida ? '0 1px 4px rgba(0,0,0,0.04)' : '0 2px 8px rgba(79,70,229,0.08)',
                }}>
                  {/* Ícono */}
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div style={{
                      width: '42px', height: '42px', borderRadius: '12px',
                      background: col.icoBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {ICONOS[n.tipo]}
                    </div>
                    {!n.leida && (
                      <div style={{
                        position: 'absolute', top: '-2px', right: '-2px',
                        width: '10px', height: '10px',
                        background: '#4F46E5', borderRadius: '50%', border: '2px solid white',
                      }} />
                    )}
                  </div>

                  {/* Contenido */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                      <p style={{ fontSize: '14px', fontWeight: n.leida ? 600 : 800, color: '#111827', lineHeight: '1.3', flex: 1 }}>
                        {n.titulo}
                      </p>
                      <span style={{ fontSize: '11px', color: '#9CA3AF', flexShrink: 0, marginTop: '1px' }}>
                        {tiempoRelativo(n.created_at)}
                      </span>
                    </div>
                    <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px', lineHeight: '1.5' }}>
                      {n.mensaje}
                    </p>
                    <span style={{
                      display: 'inline-block', fontSize: '11px', fontWeight: '600',
                      color: col.texto, background: col.icoBg, borderRadius: '6px',
                      padding: '2px 8px', marginTop: '8px',
                    }}>
                      {col.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        ))}

        {hayMas && (
          <button onClick={cargarMas} style={{
            width: '100%', height: '44px', borderRadius: '12px',
            background: 'white', border: '1.5px solid #E5E7EB',
            fontSize: '14px', fontWeight: '700', color: '#6B7280',
            cursor: 'pointer', marginTop: '4px',
          }}>
            Cargar más
          </button>
        )}
      </div>
    </div>
  )
}
