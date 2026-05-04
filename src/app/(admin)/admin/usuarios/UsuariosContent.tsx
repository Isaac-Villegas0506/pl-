'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MoreVertical, X, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import AdminTopBar from '@/components/layout/AdminTopBar'
import ModalEditarUsuario from '@/components/admin/ModalEditarUsuario'
import {
  cambiarRolAction,
  desactivarUsuarioAction,
  reactivarUsuarioAction,
} from '../actions'
import type { UsuarioConDetalle, FiltrosUsuario } from '../types'

const BADGE_ESTILOS: Record<string, { background: string; color: string }> = {
  administrador: { background: '#0F172A', color: 'white' },
  profesor:      { background: '#4F46E5', color: 'white' },
  estudiante:    { background: '#10B981', color: 'white' },
}

const FILTROS_CHIPS = [
  { label: 'Todos',       valor: 'todos' },
  { label: 'Estudiantes', valor: 'estudiante' },
  { label: 'Profesores',  valor: 'profesor' },
  { label: 'Admins',      valor: 'administrador' },
  { label: 'Inactivos',   valor: 'inactivo' },
]

interface Props {
  usuarios: UsuarioConDetalle[]
  total: number
  pagina: number
  totalPaginas: number
  filtrosActivos: FiltrosUsuario
  roleStats?: { estudiantes: number; profesores: number; admins: number }
}

export default function UsuariosContent({
  usuarios: usuariosIniciales,
  total,
  pagina,
  totalPaginas,
  filtrosActivos,
  roleStats,
}: Props) {
  const router = useRouter()
  const [usuarios, setUsuarios] = useState(usuariosIniciales)
  const [busqueda, setBusqueda] = useState(filtrosActivos.busqueda ?? '')
  const [filtroRol, setFiltroRol] = useState(filtrosActivos.rol ?? 'todos')
  const [menuAbierto, setMenuAbierto] = useState<string | null>(null)
  const [usuarioEditando, setUsuarioEditando] = useState<UsuarioConDetalle | null>(null)
  const [cargando, setCargando] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const aplicarFiltros = useCallback((nuevaBusqueda: string, nuevoRol: string, nuevaPagina = 1) => {
    const params = new URLSearchParams()
    if (nuevaBusqueda) params.set('busqueda', nuevaBusqueda)
    if (nuevoRol !== 'todos') params.set('rol', nuevoRol)
    params.set('pagina', String(nuevaPagina))
    router.push(`/admin/usuarios?${params.toString()}`)
  }, [router])

  function handleBusqueda(valor: string) {
    setBusqueda(valor)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => aplicarFiltros(valor, filtroRol), 300)
  }

  function handleFiltroRol(rol: string) {
    setFiltroRol(rol)
    aplicarFiltros(busqueda, rol)
  }

  async function handleCambiarRol(usuario: UsuarioConDetalle, nuevoRol: string) {
    setCargando(true)
    setMenuAbierto(null)
    await cambiarRolAction(usuario.id, nuevoRol)
    setUsuarios(prev => prev.map(u =>
      u.id === usuario.id ? { ...u, rol: nuevoRol as UsuarioConDetalle['rol'] } : u
    ))
    setCargando(false)
  }

  async function handleDesactivar(usuario: UsuarioConDetalle) {
    setCargando(true)
    setMenuAbierto(null)
    await desactivarUsuarioAction(usuario.id, usuario.auth_id)
    setUsuarios(prev => prev.map(u => u.id === usuario.id ? { ...u, activo: false } : u))
    setCargando(false)
  }

  async function handleReactivar(usuario: UsuarioConDetalle) {
    setCargando(true)
    setMenuAbierto(null)
    await reactivarUsuarioAction(usuario.id, usuario.auth_id)
    setUsuarios(prev => prev.map(u => u.id === usuario.id ? { ...u, activo: true } : u))
    setCargando(false)
  }

  const desde = (pagina - 1) * 20 + 1
  const hasta = Math.min(pagina * 20, total)

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>
      <AdminTopBar title="Usuarios" subtitle={`${total} registros`} />

      {/* USER DISTRIBUTION */}
      {roleStats && (
        <div style={{ padding: '12px 16px 0' }}>
          <section style={{
            background: 'white', borderRadius: '12px', border: '1px solid #C9C4D7',
            padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#191C1E', marginBottom: '12px' }}>Distribución</h2>
            <div style={{ display: 'flex', gap: '10px' }}>
              {[
                { label: 'Estudiantes', value: roleStats.estudiantes, bg: '#62FAE3', color: '#005047' },
                { label: 'Profesores', value: roleStats.profesores, bg: '#E6DEFF', color: '#481BC6' },
                { label: 'Admins', value: roleStats.admins, bg: '#191C1E', color: 'white' },
              ].map(chip => (
                <div key={chip.label} style={{
                  flex: 1, padding: '14px 12px', borderRadius: '12px',
                  background: chip.bg, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: '2px',
                }}>
                  <span style={{ fontSize: '22px', fontWeight: 700, color: chip.color }}>{chip.value}</span>
                  <span style={{ fontSize: '10px', fontWeight: 600, color: chip.color, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{chip.label}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* BÚSQUEDA */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        background: 'white', border: '1.5px solid #E5E7EB',
        borderRadius: '14px', padding: '0 16px', height: '48px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        margin: '12px 16px 0',
      }}>
        <Search size={16} color="#9CA3AF" strokeWidth={1.5} />
        <input
          value={busqueda}
          onChange={e => handleBusqueda(e.target.value)}
          placeholder="Buscar por nombre, email..."
          style={{
            flex: 1, border: 'none', outline: 'none',
            background: 'transparent', fontSize: '14px', color: '#111827',
            fontFamily: 'inherit',
          }}
        />
        {busqueda && (
          <button onClick={() => handleBusqueda('')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={14} color="#9CA3AF" />
          </button>
        )}
      </div>

      {/* CHIPS FILTRO ROL */}
      <div style={{ overflowX: 'auto', padding: '12px 16px 0' }}>
        <div style={{ display: 'flex', gap: '8px', width: 'max-content' }}>
          {FILTROS_CHIPS.map(chip => {
            const active = filtroRol === chip.valor
            return (
              <button
                key={chip.valor}
                onClick={() => handleFiltroRol(chip.valor)}
                style={{
                  height: '34px', padding: '0 16px',
                  borderRadius: '99px', border: 'none', cursor: 'pointer',
                  fontSize: '13px', fontWeight: '700',
                  background: active ? '#0F172A' : 'white',
                  color: active ? 'white' : '#6B7280',
                  boxShadow: active ? '0 2px 8px rgba(15,23,42,0.2)' : '0 1px 4px rgba(0,0,0,0.06)',
                  transition: 'all 0.2s',
                }}
              >
                {chip.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* LISTA */}
      <div style={{ padding: '12px 0' }}>
        {cargando && (
          <div style={{ padding: '20px', textAlign: 'center', color: '#9CA3AF', fontSize: '13px' }}>
            Actualizando...
          </div>
        )}
        {usuarios.length === 0 && !cargando && (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#9CA3AF', fontSize: '14px' }}>
            No se encontraron usuarios
          </div>
        )}
        {usuarios.map(u => (
          <div
            key={u.id}
            style={{
              background: 'white', borderRadius: '16px',
              padding: '14px 16px', marginBottom: '8px',
              marginLeft: '16px', marginRight: '16px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              display: 'flex', alignItems: 'center', gap: '12px',
              border: '1px solid rgba(0,0,0,0.02)',
              opacity: u.activo ? 1 : 0.65,
            }}
          >
            <Avatar nombre={u.nombre} apellido={u.apellido} size="md" />

            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '14px', fontWeight: '700', color: '#111827' }}>
                {u.nombre} {u.apellido}
              </p>
              <p style={{
                fontSize: '12px', color: '#9CA3AF', marginTop: '1px',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {u.email}
              </p>
              {u.rol === 'estudiante' && u.aula && (
                <p style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>
                  {u.aula.grado_nombre} · {u.aula.seccion_nombre}
                </p>
              )}
            </div>

            <div style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'flex-end', gap: '5px', flexShrink: 0,
            }}>
              <span style={{
                ...(BADGE_ESTILOS[u.rol] ?? { background: '#F3F4F6', color: '#9CA3AF' }),
                fontSize: '10px', fontWeight: '800',
                borderRadius: '6px', padding: '3px 8px',
                letterSpacing: '0.04em', textTransform: 'uppercase',
              }}>
                {u.rol}
              </span>
              {!u.activo && (
                <span style={{
                  fontSize: '10px', fontWeight: '700',
                  color: '#9CA3AF', background: '#F3F4F6',
                  borderRadius: '6px', padding: '3px 8px',
                }}>
                  Inactivo
                </span>
              )}
              <button
                onClick={() => setMenuAbierto(menuAbierto === u.id ? null : u.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
              >
                <MoreVertical size={16} color="#9CA3AF" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* PAGINACIÓN */}
      {totalPaginas > 1 && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px 20px',
        }}>
          <span style={{ fontSize: '12px', color: '#9CA3AF' }}>
            {desde}–{hasta} de {total}
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => aplicarFiltros(busqueda, filtroRol, pagina - 1)}
              disabled={pagina <= 1}
              style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: 'white', border: '1px solid #E5E7EB',
                cursor: pagina <= 1 ? 'default' : 'pointer',
                opacity: pagina <= 1 ? 0.4 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <ChevronLeft size={16} color="#374151" />
            </button>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: '#4F46E5', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: 'white' }}>{pagina}</span>
            </div>
            <button
              onClick={() => aplicarFiltros(busqueda, filtroRol, pagina + 1)}
              disabled={pagina >= totalPaginas}
              style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: 'white', border: '1px solid #E5E7EB',
                cursor: pagina >= totalPaginas ? 'default' : 'pointer',
                opacity: pagina >= totalPaginas ? 0.4 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <ChevronRight size={16} color="#374151" />
            </button>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => router.push('/admin/usuarios/nuevo')}
        style={{
          position: 'fixed', bottom: '80px', right: '20px', zIndex: 100,
          width: '56px', height: '56px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #4F46E5, #6D28D9)',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(79,70,229,0.4)',
        }}
      >
        <Plus size={24} color="white" strokeWidth={2.5} />
      </button>

      {/* MENÚ CONTEXTUAL */}
      {menuAbierto && (() => {
        const u = usuarios.find(x => x.id === menuAbierto)
        if (!u) return null
        return (
          <>
            <div
              onClick={() => setMenuAbierto(null)}
              style={{
                position: 'fixed', inset: 0, zIndex: 200,
                background: 'rgba(0,0,0,0.4)',
              }}
            />
            <div style={{
              position: 'fixed', bottom: '76px', left: '16px', right: '16px',
              zIndex: 201, background: 'white', borderRadius: '20px',
              boxShadow: '0 -8px 40px rgba(0,0,0,0.15)',
              overflow: 'hidden',
            }}>
              <div style={{ padding: '16px', borderBottom: '1px solid #F3F4F6' }}>
                <p style={{ fontSize: '14px', fontWeight: '700', color: '#111827' }}>
                  {u.nombre} {u.apellido}
                </p>
                <p style={{ fontSize: '12px', color: '#9CA3AF' }}>{u.email}</p>
              </div>
              {[
                { label: 'Editar usuario', action: () => { setUsuarioEditando(u); setMenuAbierto(null) }, color: '#111827' },
                { label: 'Cambiar a Estudiante', action: () => handleCambiarRol(u, 'estudiante'), color: '#10B981' },
                { label: 'Cambiar a Profesor', action: () => handleCambiarRol(u, 'profesor'), color: '#4F46E5' },
                { label: 'Cambiar a Admin', action: () => handleCambiarRol(u, 'administrador'), color: '#0F172A' },
                ...(u.activo
                  ? [{ label: 'Desactivar cuenta', action: () => handleDesactivar(u), color: '#F43F5E' }]
                  : [{ label: 'Reactivar cuenta', action: () => handleReactivar(u), color: '#10B981' }]
                ),
              ].map(item => (
                <button
                  key={item.label}
                  onClick={item.action}
                  style={{
                    width: '100%', padding: '14px 16px', border: 'none',
                    background: 'none', cursor: 'pointer', textAlign: 'left',
                    fontSize: '14px', fontWeight: '600', color: item.color,
                    borderBottom: '1px solid #F9FAFB',
                  }}
                >
                  {item.label}
                </button>
              ))}
              <button
                onClick={() => setMenuAbierto(null)}
                style={{
                  width: '100%', padding: '14px 16px', border: 'none',
                  background: 'none', cursor: 'pointer', textAlign: 'center',
                  fontSize: '14px', fontWeight: '600', color: '#9CA3AF',
                }}
              >
                Cancelar
              </button>
            </div>
          </>
        )
      })()}

      {/* MODAL EDITAR */}
      {usuarioEditando && (
        <ModalEditarUsuario
          usuario={usuarioEditando}
          isOpen={!!usuarioEditando}
          onClose={() => setUsuarioEditando(null)}
          onGuardado={actualizado => {
            setUsuarios(prev => prev.map(u => u.id === actualizado.id ? actualizado : u))
            setUsuarioEditando(null)
          }}
        />
      )}
    </div>
  )
}
