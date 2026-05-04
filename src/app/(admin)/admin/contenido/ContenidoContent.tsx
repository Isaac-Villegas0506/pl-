'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search, Plus, MoreVertical, Pencil, Trash2, ChevronDown, ChevronUp, BookOpen,
  Archive, Eye, FileText, X, ClipboardList,
} from 'lucide-react'
import Image from 'next/image'
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

const FILTRO_ESTADOS = [
  { label: 'Todos', valor: 'todos' },
  { label: 'Publicados', valor: 'publicado' },
  { label: 'Borradores', valor: 'borrador' },
  { label: 'Archivados', valor: 'archivado' },
]

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
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [menuAbierto, setMenuAbierto] = useState<string | null>(null)
  const [lecturasLocal, setLecturasLocal] = useState(lecturas)

  const lecturasFiltradas = lecturasLocal.filter(l => {
    const matchBusqueda = l.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      l.autor.toLowerCase().includes(busqueda.toLowerCase())
    const matchEstado = filtroEstado === 'todos' || l.estado === filtroEstado
    return matchBusqueda && matchEstado
  })

  async function handleCambiarEstado(id: string, estado: LecturaAdminResumen['estado']) {
    await cambiarEstadoLecturaAction(id, estado)
    setLecturasLocal(prev => prev.map(l => l.id === id ? { ...l, estado } : l))
    setMenuAbierto(null)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFF', padding: '32px 24px 100px' }}>
      <div className="estudiante-container">

        {/* HEADER */}
        <header style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '40px' }} className="explorar-header-row">
          <div style={{ flexShrink: 0 }}>
            <h1 style={{ fontSize: '30px', fontWeight: 800, color: '#0F172A' }}>
              Contenido
            </h1>
            <p style={{ fontSize: '14px', color: '#64748B', marginTop: '4px', fontWeight: 500 }}>
              {stats.totalLecturas} lecturas · {stats.totalPreguntas} preguntas en el sistema
            </p>
          </div>

          {/* Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, maxWidth: '100%' }}>
            <div style={{
              position: 'relative', flex: 1, minWidth: 0,
            }}>
              <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                placeholder="Buscar lectura por título o autor..."
                style={{
                  width: '100%', height: '52px', paddingLeft: '48px', paddingRight: busqueda ? '44px' : '16px',
                  border: '2px solid #E2E8F0', borderRadius: '18px', fontSize: '15px',
                  color: '#0F172A', background: 'white', fontFamily: 'inherit', outline: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onFocus={e => { e.target.style.borderColor = '#4F46E5'; e.target.style.boxShadow = '0 0 0 4px rgba(79,70,229,0.08)' }}
                onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.02)' }}
              />
              {busqueda && (
                <button onClick={() => setBusqueda('')} style={{
                  position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                  background: '#F1F5F9', border: 'none', borderRadius: '50%',
                  width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                }}>
                  <X size={14} color="#64748B" />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* TABS */}
        <div style={{ display: 'flex', background: 'white', borderRadius: '16px', padding: '4px', marginBottom: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1, height: '42px', border: 'none', borderRadius: '12px',
                fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                background: tab === t ? '#4F46E5' : 'transparent',
                color: tab === t ? 'white' : '#9CA3AF',
                transition: 'all 0.2s', fontFamily: 'inherit',
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'Lecturas' && (
          <>
            {/* STATE FILTER CHIPS */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
              {FILTRO_ESTADOS.map(f => (
                <button
                  key={f.valor}
                  onClick={() => setFiltroEstado(f.valor)}
                  style={{
                    padding: '8px 18px', borderRadius: '99px',
                    fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                    border: filtroEstado === f.valor ? 'none' : '1.5px solid #E2E8F0',
                    background: filtroEstado === f.valor ? '#4F46E5' : 'white',
                    color: filtroEstado === f.valor ? 'white' : '#64748B',
                    boxShadow: filtroEstado === f.valor ? '0 4px 12px rgba(79,70,229,0.2)' : 'none',
                    fontFamily: 'inherit',
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* RESULTS COUNT */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>
                {lecturasFiltradas.length} {lecturasFiltradas.length === 1 ? 'lectura' : 'lecturas'}
              </h2>
            </div>

            {/* GRID - Explorar style */}
            {lecturasFiltradas.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94A3B8' }}>
                <BookOpen size={48} color="#CBD5E1" style={{ margin: '0 auto 16px' }} />
                <p style={{ fontSize: '16px', fontWeight: 700, color: '#64748B' }}>Sin resultados</p>
                <p style={{ fontSize: '14px', marginTop: '4px' }}>No hay lecturas que coincidan con los filtros.</p>
              </div>
            ) : (
              <div className="explorar-premium-grid">
                {lecturasFiltradas.map(l => {
                  const gradient = obtenerGradientePortada(l.id)
                  const estadoE = ESTADO_ESTILOS[l.estado] ?? ESTADO_ESTILOS.borrador
                  return (
                    <div key={l.id} style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative' }}>
                      {/* Card Cover */}
                      <div
                        style={{
                          position: 'relative', aspectRatio: '3/4',
                          background: gradient, borderRadius: '24px',
                          overflow: 'hidden', display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.3s ease', cursor: 'pointer',
                        }}
                        className="book-card-container"
                        onClick={() => router.push(`/admin/contenido/lecturas/${l.id}/preguntas`)}
                      >
                        {/* Estado badge */}
                        <span style={{
                          position: 'absolute', top: '12px', left: '12px', zIndex: 5,
                          fontSize: '10px', fontWeight: 800, textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          background: estadoE.bg, color: estadoE.color,
                          borderRadius: '8px', padding: '4px 10px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        }}>
                          {estadoE.label}
                        </span>

                        {/* 3-dot menu */}
                        <button
                          onClick={(e) => { e.stopPropagation(); setMenuAbierto(menuAbierto === l.id ? null : l.id) }}
                          style={{
                            position: 'absolute', top: '12px', right: '12px', zIndex: 5,
                            width: '36px', height: '36px',
                            background: 'rgba(255,255,255,0.9)',
                            backdropFilter: 'blur(8px)',
                            border: 'none', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          }}
                        >
                          <MoreVertical size={18} color="#374151" />
                        </button>

                        {/* Dropdown menu (desktop-friendly) */}
                        {menuAbierto === l.id && (
                          <div
                            onClick={e => e.stopPropagation()}
                            style={{
                              position: 'absolute', top: '52px', right: '12px', zIndex: 20,
                              background: 'white', borderRadius: '16px',
                              boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
                              border: '1px solid #E2E8F0',
                              minWidth: '200px', overflow: 'hidden',
                            }}
                          >
                            {[
                              { label: 'Editar lectura', icon: Pencil, action: () => { router.push(`/profesor/lecturas/${l.id}/editar`); setMenuAbierto(null) }, color: '#0F172A' },
                              { label: 'Gestionar preguntas', icon: ClipboardList, action: () => { router.push(`/admin/contenido/lecturas/${l.id}/preguntas`); setMenuAbierto(null) }, color: '#4F46E5' },
                              ...(l.estado !== 'publicado' ? [{ label: 'Publicar', icon: Eye, action: () => handleCambiarEstado(l.id, 'publicado'), color: '#10B981' }] : []),
                              ...(l.estado !== 'archivado' ? [{ label: 'Archivar', icon: Archive, action: () => handleCambiarEstado(l.id, 'archivado'), color: '#F59E0B' }] : []),
                              ...(l.estado !== 'borrador' ? [{ label: 'Pasar a borrador', icon: FileText, action: () => handleCambiarEstado(l.id, 'borrador'), color: '#6B7280' }] : []),
                            ].map(item => (
                              <button
                                key={item.label}
                                onClick={item.action}
                                style={{
                                  width: '100%', padding: '12px 16px', border: 'none',
                                  background: 'none', cursor: 'pointer', textAlign: 'left',
                                  fontSize: '14px', fontWeight: 600, color: item.color,
                                  display: 'flex', alignItems: 'center', gap: '10px',
                                  transition: 'background 0.15s', fontFamily: 'inherit',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                              >
                                <item.icon size={16} />
                                {item.label}
                              </button>
                            ))}
                          </div>
                        )}

                        {l.portada_url ? (
                          <Image src={l.portada_url} alt={l.titulo} fill style={{ objectFit: 'cover' }} />
                        ) : (
                          <BookOpen size={64} color="rgba(255,255,255,0.3)" strokeWidth={1.5} />
                        )}
                      </div>

                      {/* Info */}
                      <div style={{ padding: '0 4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4F46E5' }}>
                          {l.materia_nombre || 'General'}
                        </span>
                        <h3 style={{
                          fontSize: '15px', fontWeight: 800, color: '#0F172A', lineHeight: '1.2',
                          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        }}>
                          {l.titulo}
                        </h3>
                        <p style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>{l.autor}</p>
                        <p style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
                          {l.total_preguntas} preg · {l.total_asignaciones} asig
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {tab === 'Catálogos' && (
          <div>
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

        {/* Close menu overlay */}
        {menuAbierto && (
          <div
            onClick={() => setMenuAbierto(null)}
            style={{ position: 'fixed', inset: 0, zIndex: 1 }}
          />
        )}
      </div>

      <style jsx global>{`
        .explorar-premium-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px 16px;
        }

        @media (min-width: 640px) {
          .explorar-premium-grid { grid-template-columns: repeat(3, 1fr); gap: 32px 24px; }
        }

        @media (min-width: 1024px) {
          .explorar-premium-grid { grid-template-columns: repeat(4, 1fr); }
          .explorar-header-row { flex-direction: row !important; align-items: center !important; }
        }

        @media (min-width: 1280px) {
          .explorar-premium-grid { grid-template-columns: repeat(5, 1fr); }
        }

        .book-card-container:hover {
          transform: translateY(-8px);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
        }
      `}</style>
    </div>
  )
}
