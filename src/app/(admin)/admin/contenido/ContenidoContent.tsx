'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search, Plus, MoreVertical, Pencil, Trash2, ChevronDown, ChevronUp, BookOpen,
} from 'lucide-react'
import AdminTopBar from '@/components/layout/AdminTopBar'
import {
  cambiarEstadoLecturaAction,
  actualizarCatalogoAction,
  crearItemCatalogoAction,
  eliminarItemCatalogoAction,
} from '../actions'
import type { LecturaAdminResumen, ItemCatalogo } from '../types'
import { obtenerGradientePortada } from '@/lib/utils'

const TABS = ['Lecturas', 'Catálogos'] as const
type Tab = typeof TABS[number]

const ESTADO_ESTILOS: Record<string, { bg: string; color: string; label: string }> = {
  publicado:  { bg: '#D1FAE5', color: '#065F46', label: 'Publicado' },
  borrador:   { bg: '#FEF3C7', color: '#92400E', label: 'Borrador' },
  archivado:  { bg: '#F3F4F6', color: '#6B7280', label: 'Archivado' },
}

const CATALOGOS_LABELS: Record<string, string> = {
  materias: 'Materias',
  categorias: 'Categorías',
  grados: 'Grados',
  niveles: 'Niveles de dificultad',
}

interface Props {
  lecturas: LecturaAdminResumen[]
  stats: { totalLecturas: number; totalPreguntas: number }
  catalogos: { materias: ItemCatalogo[]; categorias: ItemCatalogo[]; grados: ItemCatalogo[]; niveles: ItemCatalogo[] }
}

function SeccionCatalogo({
  tabla, label, items: itemsIniciales,
}: { tabla: string; label: string; items: ItemCatalogo[] }) {
  const [items, setItems] = useState(itemsIniciales)
  const [expandido, setExpandido] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [valorEdicion, setValorEdicion] = useState('')
  const [nuevoNombre, setNuevoNombre] = useState('')
  const [agregando, setAgregando] = useState(false)

  async function guardarEdicion(id: string) {
    if (!valorEdicion.trim()) { setEditandoId(null); return }
    await actualizarCatalogoAction(tabla, id, valorEdicion.trim())
    setItems(prev => prev.map(i => i.id === id ? { ...i, nombre: valorEdicion.trim() } : i))
    setEditandoId(null)
  }

  async function handleAgregar() {
    if (!nuevoNombre.trim()) return
    const result = await crearItemCatalogoAction(tabla, nuevoNombre.trim())
    if (result.success && result.id) {
      setItems(prev => [...prev, { id: result.id!, nombre: nuevoNombre.trim() }])
      setNuevoNombre('')
      setAgregando(false)
    }
  }

  async function handleEliminar(id: string) {
    await eliminarItemCatalogoAction(tabla, id)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  return (
    <div style={{
      background: 'white', borderRadius: '16px', marginBottom: '8px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)', overflow: 'hidden',
    }}>
      <button
        onClick={() => setExpandido(!expandido)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <p style={{ fontSize: '15px', fontWeight: '700', color: '#111827' }}>{label}</p>
          <span style={{
            fontSize: '11px', fontWeight: '700', color: '#4F46E5',
            background: '#EEF2FF', borderRadius: '99px', padding: '2px 10px',
          }}>
            {items.length}
          </span>
        </div>
        {expandido ? <ChevronUp size={18} color="#9CA3AF" /> : <ChevronDown size={18} color="#9CA3AF" />}
      </button>

      {expandido && (
        <div style={{ borderTop: '1px solid #F3F4F6', padding: '8px 16px 12px' }}>
          {items.map(item => (
            <div key={item.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 0', borderBottom: '1px solid #F9FAFB',
            }}>
              {editandoId === item.id ? (
                <input
                  autoFocus
                  value={valorEdicion}
                  onChange={e => setValorEdicion(e.target.value)}
                  onBlur={() => guardarEdicion(item.id)}
                  onKeyDown={e => e.key === 'Enter' && guardarEdicion(item.id)}
                  style={{
                    flex: 1, border: 'none', borderBottom: '2px solid #4F46E5',
                    outline: 'none', fontSize: '14px', fontWeight: '600',
                    color: '#111827', background: 'transparent',
                    fontFamily: 'inherit', padding: '0 0 2px',
                  }}
                />
              ) : (
                <span
                  onClick={() => { setEditandoId(item.id); setValorEdicion(item.nombre) }}
                  style={{
                    fontSize: '14px', fontWeight: '600', color: '#111827',
                    flex: 1, cursor: 'pointer',
                  }}
                >
                  {item.nombre}
                </span>
              )}
              <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                <button
                  onClick={() => { setEditandoId(item.id); setValorEdicion(item.nombre) }}
                  style={{
                    width: '28px', height: '28px', borderRadius: '8px',
                    background: '#F3F4F6', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Pencil size={13} color="#6B7280" />
                </button>
                <button
                  onClick={() => handleEliminar(item.id)}
                  style={{
                    width: '28px', height: '28px', borderRadius: '8px',
                    background: '#FFF1F2', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Trash2 size={13} color="#F43F5E" />
                </button>
              </div>
            </div>
          ))}

          {agregando ? (
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <input
                autoFocus
                value={nuevoNombre}
                onChange={e => setNuevoNombre(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAgregar()}
                placeholder="Nombre..."
                style={{
                  flex: 1, height: '36px', border: '1.5px solid #4F46E5',
                  borderRadius: '10px', padding: '0 12px', fontSize: '14px',
                  outline: 'none', fontFamily: 'inherit', color: '#111827',
                }}
              />
              <button onClick={handleAgregar} style={{
                height: '36px', padding: '0 16px', borderRadius: '10px',
                background: '#4F46E5', border: 'none', color: 'white',
                fontSize: '13px', fontWeight: '700', cursor: 'pointer',
              }}>
                Agregar
              </button>
              <button onClick={() => setAgregando(false)} style={{
                height: '36px', padding: '0 12px', borderRadius: '10px',
                background: '#F3F4F6', border: 'none', color: '#6B7280',
                fontSize: '13px', fontWeight: '700', cursor: 'pointer',
              }}>
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAgregando(true)}
              style={{
                marginTop: '10px', width: '100%', height: '36px',
                border: '1.5px dashed #C7D2FE', borderRadius: '10px',
                background: 'transparent', color: '#4F46E5',
                fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              }}
            >
              <Plus size={14} /> Agregar {label.toLowerCase().slice(0, -1)}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default function ContenidoContent({ lecturas, stats, catalogos }: Props) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('Lecturas')
  const [busqueda, setBusqueda] = useState('')
  const [menuAbierto, setMenuAbierto] = useState<string | null>(null)
  const [lecturasLocal, setLecturasLocal] = useState(lecturas)

  const lecturasFiltradas = lecturasLocal.filter(l =>
    l.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
    l.autor.toLowerCase().includes(busqueda.toLowerCase())
  )

  async function handleCambiarEstado(id: string, estado: LecturaAdminResumen['estado']) {
    await cambiarEstadoLecturaAction(id, estado)
    setLecturasLocal(prev => prev.map(l => l.id === id ? { ...l, estado } : l))
    setMenuAbierto(null)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>
      <AdminTopBar
        title="Contenido"
        subtitle={`${stats.totalLecturas} lecturas · ${stats.totalPreguntas} preguntas`}
      />

      {/* TABS */}
      <div style={{
        display: 'flex', background: 'white',
        borderBottom: '1px solid #F3F4F6',
        padding: '0 16px',
      }}>
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1, height: '46px', border: 'none', background: 'none',
              fontSize: '14px', fontWeight: '700', cursor: 'pointer',
              color: tab === t ? '#4F46E5' : '#9CA3AF',
              borderBottom: tab === t ? '2.5px solid #4F46E5' : '2.5px solid transparent',
              transition: 'all 0.2s',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Lecturas' && (
        <div>
          {/* Búsqueda */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: 'white', border: '1.5px solid #E5E7EB',
            borderRadius: '14px', padding: '0 16px', height: '48px',
            margin: '12px 16px 0',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}>
            <Search size={16} color="#9CA3AF" strokeWidth={1.5} />
            <input
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar lectura..."
              style={{
                flex: 1, border: 'none', outline: 'none',
                background: 'transparent', fontSize: '14px',
                color: '#111827', fontFamily: 'inherit',
              }}
            />
          </div>

          <div style={{ padding: '12px 0' }}>
            {lecturasFiltradas.map(l => {
              const estadoE = ESTADO_ESTILOS[l.estado] ?? ESTADO_ESTILOS.borrador
              return (
                <div
                  key={l.id}
                  style={{
                    background: 'white', borderRadius: '16px',
                    padding: '14px 16px', marginBottom: '8px',
                    marginLeft: '16px', marginRight: '16px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                    display: 'flex', alignItems: 'center', gap: '12px',
                    border: '1px solid rgba(0,0,0,0.03)',
                  }}
                >
                  {/* Portada mini */}
                  <div style={{
                    width: '44px', height: '56px', borderRadius: '10px',
                    background: obtenerGradientePortada(l.id),
                    flexShrink: 0, overflow: 'hidden',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <BookOpen size={18} color="rgba(255,255,255,0.8)" />
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: '14px', fontWeight: '700', color: '#111827',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {l.titulo}
                    </p>
                    <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '1px' }}>
                      {l.autor}
                    </p>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '5px', alignItems: 'center' }}>
                      <span style={{
                        fontSize: '10px', fontWeight: '700',
                        background: estadoE.bg, color: estadoE.color,
                        borderRadius: '6px', padding: '2px 8px',
                      }}>
                        {estadoE.label}
                      </span>
                      <span style={{ fontSize: '11px', color: '#9CA3AF' }}>
                        {l.total_preguntas} preg · {l.total_asignaciones} asig
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setMenuAbierto(menuAbierto === l.id ? null : l.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', flexShrink: 0 }}
                  >
                    <MoreVertical size={16} color="#9CA3AF" />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {tab === 'Catálogos' && (
        <div style={{ padding: '12px 16px' }}>
          {Object.entries(catalogos).map(([tabla, items]) => (
            <SeccionCatalogo
              key={tabla}
              tabla={tabla === 'niveles' ? 'niveles_dificultad' : tabla}
              label={CATALOGOS_LABELS[tabla] ?? tabla}
              items={items}
            />
          ))}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => router.push('/profesor/lecturas/nueva')}
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

      {/* Menú lectura */}
      {menuAbierto && (() => {
        const l = lecturasLocal.find(x => x.id === menuAbierto)
        if (!l) return null
        return (
          <>
            <div onClick={() => setMenuAbierto(null)} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.4)' }} />
            <div style={{
              position: 'fixed', bottom: '76px', left: '16px', right: '16px',
              zIndex: 201, background: 'white', borderRadius: '20px',
              boxShadow: '0 -8px 40px rgba(0,0,0,0.15)', overflow: 'hidden',
            }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #F3F4F6' }}>
                <p style={{ fontSize: '14px', fontWeight: '700', color: '#111827' }}>{l.titulo}</p>
              </div>
              {[
                { label: 'Gestionar preguntas', action: () => router.push(`/admin/contenido/lecturas/${l.id}/preguntas`), color: '#111827' },
                l.estado !== 'publicado' && { label: 'Publicar', action: () => handleCambiarEstado(l.id, 'publicado'), color: '#10B981' },
                l.estado !== 'archivado' && { label: 'Archivar', action: () => handleCambiarEstado(l.id, 'archivado'), color: '#F59E0B' },
                l.estado !== 'borrador' && { label: 'Pasar a borrador', action: () => handleCambiarEstado(l.id, 'borrador'), color: '#6B7280' },
              ].filter(Boolean).map((item) => {
                const it = item as { label: string; action: () => void; color: string }
                return (
                  <button key={it.label} onClick={it.action} style={{
                    width: '100%', padding: '14px 16px', border: 'none',
                    background: 'none', cursor: 'pointer', textAlign: 'left',
                    fontSize: '14px', fontWeight: '600', color: it.color,
                    borderBottom: '1px solid #F9FAFB',
                  }}>
                    {it.label}
                  </button>
                )
              })}
              <button onClick={() => setMenuAbierto(null)} style={{
                width: '100%', padding: '14px', border: 'none', background: 'none',
                cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#9CA3AF', textAlign: 'center',
              }}>
                Cancelar
              </button>
            </div>
          </>
        )
      })()}
    </div>
  )
}
