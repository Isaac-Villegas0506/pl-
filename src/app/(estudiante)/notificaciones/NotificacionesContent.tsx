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

      <div className="estudiante-container" style={{ padding: '0 20px' }}>
        {/* FILTROS */}
        <div style={{ overflowX: 'auto', padding: '16px 0 0' }} className="scrollbar-hide">
          <div style={{ display: 'flex', gap: '10px', width: 'max-content', paddingBottom: '4px' }}>
            {FILTROS.map(f => {
              const activo = filtro === f.key
              return (
                <button key={f.key} onClick={() => setFiltro(f.key)} style={{
                  height: '38px', padding: '0 20px', borderRadius: '12px',
                  border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '800',
                  background: activo ? '#4F46E5' : 'white',
                  color: activo ? 'white' : '#64748B',
                  boxShadow: activo ? '0 4px 12px rgba(79,70,229,0.2)' : '0 2px 6px rgba(0,0,0,0.04)',
                  transition: 'all 0.2s ease',
                }}>
                  {f.label}
                  {f.key === 'no_leidas' && noLeidas > 0 && (
                    <span style={{
                      marginLeft: '8px', background: activo ? 'rgba(255,255,255,0.25)' : '#F43F5E',
                      color: 'white', borderRadius: '8px',
                      padding: '2px 8px', fontSize: '11px', fontWeight: '900',
                    }}>{noLeidas}</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* LISTA */}
        <div style={{ padding: '24px 0' }}>
          {isLoading && notificaciones.length === 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4F46E5]"></div>
            </div>
          )}

          {!isLoading && filtradas.length === 0 && (
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
              <div style={{
                width: '88px', height: '88px', borderRadius: '32px',
                background: 'white', margin: '0 auto 24px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
              }}>
                <Bell size={40} color="#D1D5DB" strokeWidth={1.5} />
              </div>
              <p style={{ fontSize: '20px', fontWeight: '800', color: '#111827' }}>Todo al día</p>
              <p style={{ fontSize: '15px', color: '#64748B', marginTop: '8px', fontWeight: 500 }}>
                No tienes notificaciones pendientes por ahora
              </p>
            </div>
          )}

          {grupos.map(grupo => (
            <div key={grupo.label} style={{ marginBottom: '32px' }}>
              <p style={{ fontSize: '13px', fontWeight: '800', color: '#94A3B8', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {grupo.label}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }} className="notificaciones-grid">
                {grupo.items.map(n => {
                  const col = COLORES[n.tipo] ?? COLORES.sistema
                  return (
                    <div key={n.id} onClick={() => handleClick(n)} style={{
                      display: 'flex', gap: '16px', alignItems: 'flex-start',
                      padding: '18px',
                      background: n.leida ? 'white' : '#F5F3FF',
                      borderRadius: '20px',
                      border: n.leida ? '1.5px solid #F1F5F9' : `1.5px solid ${col.border}`,
                      cursor: n.accion_url ? 'pointer' : 'default',
                      boxShadow: n.leida ? '0 4px 12px rgba(0,0,0,0.03)' : '0 8px 24px rgba(79,70,229,0.08)',
                      transition: 'all 0.2s ease',
                    }} className="notificacion-card">
                      {/* Ícono */}
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <div style={{
                          width: '48px', height: '48px', borderRadius: '14px',
                          background: col.icoBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: `0 4px 12px ${col.icoBg}`,
                        }}>
                          {ICONOS[n.tipo]}
                        </div>
                        {!n.leida && (
                          <div style={{
                            position: 'absolute', top: '-4px', right: '-4px',
                            width: '12px', height: '12px',
                            background: '#4F46E5', borderRadius: '50%', border: '2px solid white',
                          }} />
                        )}
                      </div>

                      {/* Contenido */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                          <p style={{ fontSize: '15px', fontWeight: n.leida ? 700 : 800, color: '#111827', lineHeight: '1.4', flex: 1 }}>
                            {n.titulo}
                          </p>
                          <span style={{ fontSize: '12px', color: '#94A3B8', flexShrink: 0, marginTop: '2px', fontWeight: 600 }}>
                            {tiempoRelativo(n.created_at)}
                          </span>
                        </div>
                        <p style={{ fontSize: '14px', color: '#64748B', marginTop: '6px', lineHeight: '1.5', fontWeight: 500 }}>
                          {n.mensaje}
                        </p>
                        <span style={{
                          display: 'inline-block', fontSize: '11px', fontWeight: '800',
                          color: col.texto, background: col.icoBg, borderRadius: '6px',
                          padding: '3px 10px', marginTop: '10px', textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }}>
                          {col.label}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          {hayMas && (
            <button onClick={cargarMas} style={{
              width: '100%', height: '48px', borderRadius: '14px',
              background: 'white', border: '2px solid #E2E8F0',
              fontSize: '15px', fontWeight: '800', color: '#64748B',
              cursor: 'pointer', marginTop: '12px', transition: 'all 0.2s ease',
            }}>
              Cargar más notificaciones
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
