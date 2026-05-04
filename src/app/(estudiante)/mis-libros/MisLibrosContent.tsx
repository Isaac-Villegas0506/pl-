'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Search, AlertTriangle, WifiOff, Calendar, BarChart3, BookOpen, HardDrive, FileText, Trash2, X } from 'lucide-react'
import { formatBytes, formatFecha, formatFechaCorta, formatTiempoRelativo, diasRestantes, fechaLimiteLabel, notaGradiente, obtenerGradientePortada } from '@/lib/utils'
import BtnDescargar from '@/components/mis-libros/BtnDescargar'
import { calcularEspacioIDB } from '@/hooks/useDescargaOffline'
import { EmptyState, Button } from '@/components/ui'

interface Asignacion {
  id: string
  lectura_id: string
  fecha_limite: string | null
  estado: string
  porcentaje_progreso: number
  nota: number | null
  completado_en: string | null
  lectura: {
    id: string
    titulo: string
    autor: string
    portada_url: string | null
    pdf_url: string | null
    materia?: { nombre: string; color: string } | null
  }
}

interface Historial {
  id: string
  lectura_id: string
  estado: string
  nota_final: number | null
  nota_automatica: number | null
  updated_at: string
  lectura: {
    id: string
    titulo: string
    autor: string
    portada_url: string | null
  }
}

interface Descarga {
  id: string
  lectura_id: string
  archivo_nombre: string
  archivo_tamanio: number
  descargado_en: string
  ultima_apertura: string | null
  activa: boolean
  lectura: {
    id: string
    titulo: string
    autor: string
  }
}

interface Props {
  asignacionesActivas: Asignacion[]
  historial: Historial[]
  descargasOffline: Descarga[]
  stats: { leidas: number; enProgreso: number; promedio: number }
  estudianteId: string
}

const MAX_STORAGE = 500 * 1024 * 1024 // 500 MB

function estadoColor(estado: string): string {
  if (estado === 'completado') return '#10B981'
  if (estado === 'en_progreso') return '#4F46E5'
  if (estado === 'revisando') return '#F59E0B'
  return '#9CA3AF'
}

function EstadoBadge({ estado, nota }: { estado: string, nota: number | null }) {
  if (estado === 'completado') return (
    <div style={{ background: '#D1FAE5', color: '#065F46', padding: '4px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', textAlign: 'center' }}>
      Listo
    </div>
  )
  if (estado === 'en_progreso') return (
    <div style={{ background: '#DBEAFE', color: '#1D4ED8', padding: '4px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', textAlign: 'center' }}>
      En curso
    </div>
  )
  if (estado === 'revisando') return (
    <div style={{ background: '#FEF3C7', color: '#92400E', padding: '4px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', textAlign: 'center' }}>
      Revisión
    </div>
  )
  return (
    <div style={{ background: '#F3F4F6', color: '#9CA3AF', padding: '4px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', textAlign: 'center' }}>
      Pendiente
    </div>
  )
}

export default function MisLibrosContent({
  asignacionesActivas,
  historial,
  descargasOffline,
  stats,
  estudianteId
}: Props) {
  const router = useRouter()
  const [tabActiva, setTabActiva] = useState<'activas' | 'historial' | 'offline'>('activas')
  const [busqueda, setBusqueda] = useState('')
  const [espacioUsado, setEspacioUsado] = useState(0)

  useEffect(() => {
    calcularEspacioIDB().then(setEspacioUsado)
  }, [descargasOffline])

  const asignacionesFiltradas = asignacionesActivas.filter(a => 
    a.lectura.titulo.toLowerCase().includes(busqueda.toLowerCase()) || 
    a.lectura.autor.toLowerCase().includes(busqueda.toLowerCase())
  )

  const proximasVencer = asignacionesFiltradas.filter(a => a.fecha_limite && diasRestantes(a.fecha_limite) <= 3 && a.estado !== 'completado')

  const abrirPDFOffline = (desc: Descarga) => {
    router.push(`/lectura/${desc.lectura_id}`)
  }

  return (
    <div style={{ paddingBottom: 'calc(64px + env(safe-area-inset-bottom, 0px))' }}>
      <div style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: 'rgba(245,243,255,0.97)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(79,70,229,0.06)',
      }}>
        <div className="estudiante-container">
          <div style={{ padding: '24px 20px 16px' }}>
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <h1 style={{
                fontSize: '32px', fontWeight: '800', color: '#111827',
              }}>
                Mis Libros
              </h1>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{
                  fontSize: '13px', fontWeight: '700',
                  color: '#4F46E5', background: '#EEF2FF',
                  borderRadius: '99px', padding: '5px 14px',
                }}>
                  {stats.leidas} leídas
                </span>
                <span className="hide-mobile" style={{
                  fontSize: '13px', fontWeight: '700',
                  color: '#0EA5E9', background: '#E0F2FE',
                  borderRadius: '99px', padding: '5px 14px',
                }}>
                  Promedio: {stats.promedio.toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          <div style={{
            display: 'flex', gap: '0',
            paddingLeft: '20px', paddingRight: '20px',
          }}>
            {[
              { key: 'activas', label: '📋 Asignadas' },
              { key: 'historial', label: '✅ Historial' },
              { key: 'offline', label: '⬇️ Offline' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setTabActiva(tab.key as any)}
                style={{
                  flex: 1, height: '48px', border: 'none',
                  background: 'transparent', cursor: 'pointer',
                  fontSize: '14px', fontWeight: '700',
                  color: tabActiva === tab.key ? '#4F46E5' : '#64748B',
                  fontFamily: 'inherit',
                  borderBottom: tabActiva === tab.key
                    ? '3px solid #4F46E5'
                    : '3px solid transparent',
                  transition: 'all 0.2s',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="estudiante-container" style={{ padding: '24px 20px' }}>
        {/* TABS CONTENT */}
        <div style={{ display: tabActiva === 'activas' ? 'block' : 'none' }}>
          <div style={{
            background: 'white', borderRadius: '18px',
            display: 'flex', alignItems: 'center', padding: '0 20px',
            height: '56px', marginBottom: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            border: '2px solid #E2E8F0',
          }}>
            <Search size={20} color="#94A3B8" />
            <input 
              value={busqueda} onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar por título o autor..."
              style={{
                flex: 1, border: 'none', background: 'transparent', outline: 'none',
                padding: '0 16px', fontSize: '16px', color: '#111827',
                fontWeight: 500,
              }}
            />
            {busqueda && <X size={20} color="#94A3B8" onClick={() => setBusqueda('')} style={{ cursor: 'pointer' }} />}
          </div>

          {proximasVencer.length > 0 && (
            <div style={{
              margin: '0 0 24px',
              background: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)',
              border: '2px solid #FDE68A',
              borderRadius: '20px', padding: '20px',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                marginBottom: '14px',
              }}>
                <AlertTriangle size={18} color="#D97706" strokeWidth={2.5} />
                <p style={{ fontSize: '15px', fontWeight: '800', color: '#92400E' }}>
                  Próximas a vencer
                </p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }} className="proximas-vencer-grid">
                {proximasVencer.map(asig => (
                  <div key={asig.id} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '10px 0',
                    borderTop: '1px solid rgba(217,119,6,0.1)',
                  }}>
                    <div style={{
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: '#D97706', flexShrink: 0,
                    }} />
                    <p style={{
                      flex: 1, fontSize: '14px', fontWeight: '700', color: '#78350F',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {asig.lectura.titulo}
                    </p>
                    <span style={{
                      fontSize: '12px', fontWeight: '800',
                      color: diasRestantes(asig.fecha_limite) === 0 ? '#F43F5E' : '#D97706',
                      flexShrink: 0,
                      background: 'white', padding: '2px 8px', borderRadius: '6px'
                    }}>
                      {diasRestantes(asig.fecha_limite) === 0 ? '¡Hoy!' : `${diasRestantes(asig.fecha_limite)} días`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {asignacionesFiltradas.length === 0 ? (
            <EmptyState icon={BookOpen} title="No hay libros asignados" description="Las asignaciones de tus profesores aparecerán aquí." />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }} className="mis-libros-grid">
              {asignacionesFiltradas.map((asig) => (
                <div key={asig.id} style={{
                  background: 'white', borderRadius: '24px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                  border: '1px solid rgba(0,0,0,0.03)',
                  display: 'flex', flexDirection: 'column',
                }}>
                  <div style={{ height: '5px', background: estadoColor(asig.estado) }} />
                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', gap: '18px', alignItems: 'flex-start' }}>
                      <div style={{
                        width: '80px', height: '108px', borderRadius: '14px',
                        overflow: 'hidden', flexShrink: 0, position: 'relative',
                        boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
                        background: obtenerGradientePortada(asig.lectura_id),
                      }}>
                        {asig.lectura.portada_url && (
                          <Image src={asig.lectura.portada_url} alt=""
                            fill style={{ objectFit: 'cover' }} />
                        )}
                        {descargasOffline.some(d => d.lectura_id === asig.lectura_id) && (
                          <div style={{
                            position: 'absolute', top: '6px', right: '6px',
                            width: '22px', height: '22px',
                            background: '#10B981', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: '1.5px solid white',
                          }}>
                            <WifiOff size={11} color="white" strokeWidth={2.5} />
                          </div>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{
                          fontSize: '11px', fontWeight: '800', letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                          color: asig.lectura.materia?.color ?? '#4F46E5',
                          background: (asig.lectura.materia?.color ?? '#4F46E5') + '15',
                          borderRadius: '6px', padding: '3px 9px',
                        }}>
                          {asig.lectura.materia?.nombre ?? 'General'}
                        </span>
                        <h3 style={{
                          fontSize: '18px', fontWeight: '800', color: '#111827',
                          marginTop: '8px', lineHeight: '1.3',
                          display: '-webkit-box', WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        }}>
                          {asig.lectura.titulo}
                        </h3>
                        <p style={{ fontSize: '13px', color: '#64748B', marginTop: '4px', fontWeight: 500 }}>
                          {asig.lectura.autor}
                        </p>
                        {asig.fecha_limite && (
                          <div style={{
                            display: 'flex', alignItems: 'center', gap: '5px',
                            marginTop: '10px',
                          }}>
                            <Calendar size={14} color={diasRestantes(asig.fecha_limite) <= 1 ? '#F43F5E' : '#94A3B8'} strokeWidth={2} />
                            <span style={{
                              fontSize: '12px', fontWeight: '700',
                              color: diasRestantes(asig.fecha_limite) <= 1 ? '#F43F5E' : '#64748B',
                            }}>
                              {fechaLimiteLabel(asig.fecha_limite)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div style={{ flexShrink: 0 }}>
                        <EstadoBadge estado={asig.estado} nota={asig.nota} />
                      </div>
                    </div>

                    {asig.estado === 'en_progreso' && (
                      <div style={{ marginTop: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '700' }}>Progreso</span>
                          <span style={{ fontSize: '12px', color: '#4F46E5', fontWeight: '800' }}>{asig.porcentaje_progreso ?? 0}%</span>
                        </div>
                        <div style={{ height: '8px', background: '#F1F5F9', borderRadius: '99px', overflow: 'hidden' }}>
                          <div className="progress-bar-animated" style={{
                            height: '100%', borderRadius: '99px',
                            background: 'linear-gradient(90deg, #4F46E5, #818CF8)',
                            width: `${asig.porcentaje_progreso ?? 0}%`,
                          }} />
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                      <Button 
                        variant={asig.estado === 'completado' ? 'outline' : 'primary'}
                        className="flex-1"
                        size="md"
                        onClick={() => router.push(`/lectura/${asig.id}`)}
                        leftIcon={asig.estado === 'completado' ? <BarChart3 size={18} /> : <BookOpen size={18} />}
                      >
                        {asig.estado === 'completado' ? 'Ver resultado' : 'Continuar leyendo'}
                      </Button>

                      {asig.lectura.pdf_url && (
                        <BtnDescargar
                          lecturaId={asig.lectura_id}
                          lecturaTitulo={asig.lectura.titulo}
                          pdfUrl={asig.lectura.pdf_url}
                          descargada={descargasOffline.some(d => d.lectura_id === asig.lectura_id)}
                          estudianteId={estudianteId}
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* HISTORIAL */}
        <div style={{ display: tabActiva === 'historial' ? 'block' : 'none' }}>
          {historial.length === 0 ? (
            <EmptyState icon={BarChart3} title="Aún no completaste ninguna lectura" description="Tus evaluaciones completadas aparecerán aquí." />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }} className="historial-grid">
              {historial.map((intento) => (
                <div key={intento.id} style={{
                  display: 'flex', gap: '16px', alignItems: 'center',
                  background: 'white', borderRadius: '20px', padding: '16px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                  border: '1px solid #F1F5F9',
                }}>
                  <div style={{
                    width: '52px', height: '68px', borderRadius: '10px',
                    overflow: 'hidden', flexShrink: 0, position: 'relative',
                    background: obtenerGradientePortada(intento.lectura_id),
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                  }}>
                    {intento.lectura.portada_url && (
                      <Image src={intento.lectura.portada_url}
                        alt="" fill style={{ objectFit: 'cover' }} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: '15px', fontWeight: '800', color: '#111827',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {intento.lectura.titulo}
                    </p>
                    <p style={{ fontSize: '13px', color: '#94A3B8', marginTop: '2px', fontWeight: 500 }}>
                      Completado el {formatFechaCorta(intento.updated_at)}
                    </p>
                  </div>
                  <div style={{
                    width: '54px', height: '54px', borderRadius: '14px', flexShrink: 0,
                    background: notaGradiente(intento.nota_final ?? intento.nota_automatica),
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}>
                    <p style={{ fontSize: '18px', fontWeight: '900', color: 'white', lineHeight: '1' }}>
                      {(intento.nota_final ?? intento.nota_automatica ?? 0).toFixed(0)}
                    </p>
                    <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.9)', fontWeight: '700' }}>
                      /20
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* OFFLINE */}
        <div style={{ display: tabActiva === 'offline' ? 'block' : 'none' }}>
          <div style={{
            background: 'white', borderRadius: '22px', padding: '20px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
            marginBottom: '20px', border: '1.5px solid #F1F5F9',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <HardDrive size={20} color="#4F46E5" strokeWidth={2.5} />
                <p style={{ fontSize: '15px', fontWeight: '800', color: '#111827' }}>Almacenamiento local</p>
              </div>
              <p style={{ fontSize: '15px', fontWeight: '900', color: '#4F46E5' }}>{formatBytes(espacioUsado)}</p>
            </div>
            <div style={{ height: '10px', background: '#F1F5F9', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: '99px',
                background: 'linear-gradient(90deg, #4F46E5, #818CF8)',
                width: `${Math.min((espacioUsado / MAX_STORAGE) * 100, 100)}%`,
                transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
              }} />
            </div>
            <p style={{ fontSize: '12px', color: '#64748B', marginTop: '10px', fontWeight: '600' }}>
              {descargasOffline.length} libros disponibles sin conexión · Límite de 500 MB
            </p>
          </div>

          {descargasOffline.length === 0 ? (
            <EmptyState icon={HardDrive} title="No hay descargas offline" description="Descarga tus libros favoritos para leerlos en cualquier lugar." />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }} className="offline-grid">
              {descargasOffline.map((desc) => (
                <div key={desc.id} style={{
                  display: 'flex', gap: '16px', alignItems: 'center',
                  background: 'white', borderRadius: '20px', padding: '16px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1.5px solid #F1F5F9',
                }}>
                  <div style={{
                    width: '56px', height: '56px', borderRadius: '14px', flexShrink: 0,
                    background: 'linear-gradient(135deg, #EF4444, #B91C1C)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 6px 12px rgba(239,68,68,0.25)',
                  }}>
                    <FileText size={26} color="white" strokeWidth={2} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: '15px', fontWeight: '800', color: '#111827',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {desc.lectura.titulo}
                    </p>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '4px', alignItems: 'center' }}>
                      <span style={{
                        fontSize: '11px', color: '#059669', fontWeight: '800',
                        background: '#D1FAE5', borderRadius: '6px', padding: '2px 8px',
                      }}>
                        Disponible offline
                      </span>
                      <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '600' }}>
                        {formatBytes(desc.archivo_tamanio ?? 0)}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    <button onClick={() => abrirPDFOffline(desc)} style={{
                      width: '42px', height: '42px', borderRadius: '12px',
                      background: '#F5F3FF', border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 2px 6px rgba(79,70,229,0.1)',
                    }}>
                      <BookOpen size={18} color="#4F46E5" strokeWidth={2.5} />
                    </button>
                    <button style={{
                      width: '42px', height: '42px', borderRadius: '12px',
                      background: '#FFF1F2', border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Trash2 size={18} color="#F43F5E" strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
