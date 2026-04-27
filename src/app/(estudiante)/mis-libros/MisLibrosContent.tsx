'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Search, AlertTriangle, WifiOff, Calendar, BarChart3, BookOpen, HardDrive, FileText, Trash2, X } from 'lucide-react'
import { formatBytes, formatFecha, formatFechaCorta, formatTiempoRelativo, diasRestantes, fechaLimiteLabel, notaGradiente, obtenerGradientePortada } from '@/lib/utils'
import BtnDescargar from '@/components/mis-libros/BtnDescargar'
import { calcularEspacioIDB } from '@/hooks/useDescargaOffline'
import EmptyState from '@/components/ui/EmptyState'

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
    router.push(`/lectura/${desc.lectura_id}`) // Idealmente deberíamos pasar un flag offline, pero esto abrirá la página
  }

  return (
    <div style={{ paddingBottom: '76px' }}>
      <div style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: 'rgba(245,243,255,0.97)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(79,70,229,0.06)',
        paddingBottom: '0',
      }}>
        <div style={{ padding: '16px 20px 12px' }}>
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <h1 style={{
              fontFamily: 'var(--font-playfair, serif)',
              fontSize: '26px', fontWeight: '800', color: '#111827',
            }}>
              Mis Libros
            </h1>
            <div style={{ display: 'flex', gap: '6px' }}>
              <span style={{
                fontSize: '12px', fontWeight: '700',
                color: '#4F46E5', background: '#EEF2FF',
                borderRadius: '99px', padding: '4px 10px',
              }}>
                {stats.leidas} leídas
              </span>
              {stats.enProgreso > 0 && (
                <span style={{
                  fontSize: '12px', fontWeight: '700',
                  color: '#0EA5E9', background: '#E0F2FE',
                  borderRadius: '99px', padding: '4px 10px',
                }}>
                  {stats.enProgreso} en curso
                </span>
              )}
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex', gap: '0',
          paddingLeft: '16px', paddingRight: '16px',
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
                flex: 1, height: '42px', border: 'none',
                background: 'transparent', cursor: 'pointer',
                fontSize: '13px', fontWeight: '700',
                color: tabActiva === tab.key ? '#4F46E5' : '#9CA3AF',
                fontFamily: 'inherit',
                borderBottom: tabActiva === tab.key
                  ? '2.5px solid #4F46E5'
                  : '2.5px solid transparent',
                transition: 'all 0.2s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px', display: tabActiva === 'activas' ? 'block' : 'none' }}>
        <div style={{
          background: 'white', borderRadius: '16px',
          display: 'flex', alignItems: 'center', padding: '0 16px',
          height: '48px', marginBottom: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <Search size={18} color="#9CA3AF" />
          <input 
            value={busqueda} onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por título o autor..."
            style={{
              flex: 1, border: 'none', background: 'transparent', outline: 'none',
              padding: '0 12px', fontSize: '15px', color: '#111827'
            }}
          />
          {busqueda && <X size={18} color="#9CA3AF" onClick={() => setBusqueda('')} />}
        </div>

        {proximasVencer.length > 0 && (
          <div style={{
            margin: '0 0 16px',
            background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
            border: '1.5px solid #FCD34D',
            borderRadius: '18px', padding: '14px 16px',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              marginBottom: '10px',
            }}>
              <AlertTriangle size={16} color="#D97706" strokeWidth={2.5} />
              <p style={{ fontSize: '13px', fontWeight: '800', color: '#92400E' }}>
                Próximas a vencer
              </p>
            </div>
            {proximasVencer.map(asig => (
              <div key={asig.id} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '6px 0',
                borderTop: '1px solid rgba(217,119,6,0.15)',
              }}>
                <div style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: '#D97706', flexShrink: 0,
                }} />
                <p style={{
                  flex: 1, fontSize: '13px', fontWeight: '600', color: '#78350F',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {asig.lectura.titulo}
                </p>
                <span style={{
                  fontSize: '11px', fontWeight: '700',
                  color: diasRestantes(asig.fecha_limite) === 0 ? '#F43F5E' : '#D97706',
                  flexShrink: 0,
                }}>
                  {diasRestantes(asig.fecha_limite) === 0 ? '¡Hoy!' : `${diasRestantes(asig.fecha_limite)}d`}
                </span>
              </div>
            ))}
          </div>
        )}

        {asignacionesFiltradas.length === 0 ? (
          <EmptyState emoji="📚" titulo="No hay libros asignados" subtexto="Las asignaciones que tu profesor te envíe aparecerán aquí." />
        ) : (
          asignacionesFiltradas.map((asig) => (
            <div key={asig.id} style={{
              background: 'white', borderRadius: '20px',
              overflow: 'hidden', marginBottom: '12px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
              border: '1px solid rgba(0,0,0,0.03)',
            }}>
              <div style={{ height: '4px', background: estadoColor(asig.estado) }} />
              <div style={{ padding: '16px' }}>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '72px', height: '96px', borderRadius: '12px',
                    overflow: 'hidden', flexShrink: 0, position: 'relative',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    background: obtenerGradientePortada(asig.lectura_id),
                  }}>
                    {asig.lectura.portada_url && (
                      <Image src={asig.lectura.portada_url} alt=""
                        fill style={{ objectFit: 'cover' }} />
                    )}
                    {descargasOffline.some(d => d.lectura_id === asig.lectura_id) && (
                      <div style={{
                        position: 'absolute', top: '4px', right: '4px',
                        width: '20px', height: '20px',
                        background: '#10B981', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <WifiOff size={10} color="white" strokeWidth={2.5} />
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{
                      fontSize: '10px', fontWeight: '700', letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: asig.lectura.materia?.color ?? '#4F46E5',
                      background: (asig.lectura.materia?.color ?? '#4F46E5') + '15',
                      borderRadius: '5px', padding: '2px 7px',
                    }}>
                      {asig.lectura.materia?.nombre ?? 'General'}
                    </span>
                    <h3 style={{
                      fontFamily: 'var(--font-playfair, serif)',
                      fontSize: '16px', fontWeight: '700', color: '#111827',
                      marginTop: '6px', lineHeight: '1.3',
                      display: '-webkit-box', WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                      {asig.lectura.titulo}
                    </h3>
                    <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>
                      {asig.lectura.autor}
                    </p>
                    {asig.fecha_limite && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        marginTop: '6px',
                      }}>
                        <Calendar size={12} color={diasRestantes(asig.fecha_limite) <= 1 ? '#F43F5E' : diasRestantes(asig.fecha_limite) <= 3 ? '#D97706' : '#9CA3AF'} strokeWidth={2} />
                        <span style={{
                          fontSize: '11px', fontWeight: '600',
                          color: diasRestantes(asig.fecha_limite) <= 1 ? '#F43F5E' : diasRestantes(asig.fecha_limite) <= 3 ? '#D97706' : '#9CA3AF',
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
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '600' }}>Progreso de lectura</span>
                      <span style={{ fontSize: '11px', color: '#4F46E5', fontWeight: '700' }}>{asig.porcentaje_progreso ?? 0}%</span>
                    </div>
                    <div style={{ height: '6px', background: '#F3F4F6', borderRadius: '99px', overflow: 'hidden' }}>
                      <div className="progress-bar-animated" style={{
                        height: '100%', borderRadius: '99px',
                        background: 'linear-gradient(90deg, #4F46E5, #818CF8)',
                        width: `${asig.porcentaje_progreso ?? 0}%`,
                      }} />
                    </div>
                  </div>
                )}

                {asig.estado === 'completado' && asig.nota !== null && (
                  <div style={{
                    marginTop: '12px', padding: '10px 14px',
                    background: asig.nota >= 11 ? '#ECFDF5' : '#FFF1F2',
                    borderRadius: '12px',
                    display: 'flex', alignItems: 'center', gap: '8px',
                  }}>
                    <span style={{ fontSize: '20px' }}>
                      {asig.nota >= 16 ? '🥇' : asig.nota >= 11 ? '✅' : '📝'}
                    </span>
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: '700', color: asig.nota >= 11 ? '#065F46' : '#9F1239' }}>
                        Nota final: {asig.nota}/20
                      </p>
                      <p style={{ fontSize: '11px', color: asig.nota >= 11 ? '#6EE7B7' : '#FDA4AF' }}>
                        {asig.nota >= 16 ? 'Excelente' : asig.nota >= 11 ? 'Aprobado' : 'Por mejorar'}
                      </p>
                    </div>
                    <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#9CA3AF', fontWeight: '500' }}>
                      {formatFecha(asig.completado_en ?? new Date())}
                    </span>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                  <button onClick={() => router.push(`/lectura/${asig.id}`)} style={{
                    flex: 1, height: '42px', borderRadius: '12px',
                    background: asig.estado === 'completado' ? '#F5F3FF' : 'linear-gradient(135deg, #4F46E5, #6D28D9)',
                    color: asig.estado === 'completado' ? '#4F46E5' : 'white',
                    border: asig.estado === 'completado' ? '1.5px solid #C7D2FE' : 'none',
                    fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    boxShadow: asig.estado === 'completado' ? 'none' : '0 4px 12px rgba(79,70,229,0.3)',
                  }}>
                    {asig.estado === 'completado' ? <><BarChart3 size={16} /> Ver resultado</> : asig.estado === 'en_progreso' ? <><BookOpen size={16} /> Continuar</> : <><BookOpen size={16} /> Empezar</>}
                  </button>

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
          ))
        )}
      </div>

      <div style={{ padding: '16px', display: tabActiva === 'historial' ? 'block' : 'none' }}>
        {historial.length === 0 ? (
          <EmptyState emoji="🏆" titulo="Aún no completaste ninguna lectura" subtexto="Tus evaluaciones completadas aparecerán aquí." botonLabel="Ver lecturas asignadas" onBoton={() => setTabActiva('activas')} />
        ) : (
          historial.map((intento) => (
            <div key={intento.id} style={{
              display: 'flex', gap: '12px', alignItems: 'center',
              background: 'white', borderRadius: '16px', padding: '12px',
              marginBottom: '8px',
              boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
            }}>
              <div style={{
                width: '44px', height: '58px', borderRadius: '8px',
                overflow: 'hidden', flexShrink: 0, position: 'relative',
                background: obtenerGradientePortada(intento.lectura_id),
              }}>
                {intento.lectura.portada_url && (
                  <Image src={intento.lectura.portada_url}
                    alt="" fill style={{ objectFit: 'cover' }} />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: '14px', fontWeight: '700', color: '#111827',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {intento.lectura.titulo}
                </p>
                <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>
                  {formatFechaCorta(intento.updated_at)}
                </p>
              </div>
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px', flexShrink: 0,
                background: notaGradiente(intento.nota_final ?? intento.nota_automatica),
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <p style={{ fontSize: '16px', fontWeight: '800', color: 'white', lineHeight: '1' }}>
                  {(intento.nota_final ?? intento.nota_automatica ?? 0).toFixed(0)}
                </p>
                <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.8)', fontWeight: '600' }}>
                  /20
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{ display: tabActiva === 'offline' ? 'block' : 'none' }}>
        <div style={{
          margin: '12px 16px', background: 'white', borderRadius: '18px', padding: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HardDrive size={18} color="#4F46E5" strokeWidth={2} />
              <p style={{ fontSize: '14px', fontWeight: '700', color: '#111827' }}>Almacenamiento offline</p>
            </div>
            <p style={{ fontSize: '13px', fontWeight: '700', color: '#4F46E5' }}>{formatBytes(espacioUsado)}</p>
          </div>
          <div style={{ height: '6px', background: '#F3F4F6', borderRadius: '99px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: '99px',
              background: 'linear-gradient(90deg, #4F46E5, #818CF8)',
              width: `${Math.min((espacioUsado / MAX_STORAGE) * 100, 100)}%`,
              transition: 'width 0.6s ease',
            }} />
          </div>
          <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '6px', fontWeight: '500' }}>
            {descargasOffline.length} PDF{descargasOffline.length !== 1 ? 's' : ''} guardados · Máx. 500 MB
          </p>
        </div>

        {descargasOffline.length === 0 ? (
          <EmptyState emoji="⬇️" titulo="No hay descargas offline" subtexto="Descarga PDFs para leerlos sin conexión a internet." botonLabel="Ver lecturas asignadas" onBoton={() => setTabActiva('activas')} />
        ) : (
          descargasOffline.map((desc) => (
            <div key={desc.id} style={{
              display: 'flex', gap: '12px', alignItems: 'center',
              background: 'white', borderRadius: '16px', padding: '14px',
              marginBottom: '8px', marginLeft: '16px', marginRight: '16px',
              boxShadow: '0 1px 6px rgba(0,0,0,0.05)', border: '1.5px solid #F3F4F6',
            }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px', flexShrink: 0,
                background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(239,68,68,0.3)',
              }}>
                <FileText size={22} color="white" strokeWidth={1.5} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: '14px', fontWeight: '700', color: '#111827',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {desc.lectura.titulo}
                </p>
                <div style={{ display: 'flex', gap: '8px', marginTop: '3px', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '11px', color: '#10B981', fontWeight: '700',
                    background: '#D1FAE5', borderRadius: '5px', padding: '1px 6px',
                  }}>
                    Offline ✓
                  </span>
                  <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '500' }}>
                    {formatBytes(desc.archivo_tamanio ?? 0)}
                  </span>
                  {desc.ultima_apertura && (
                    <span style={{ fontSize: '11px', color: '#9CA3AF' }}>
                      · {formatTiempoRelativo(desc.ultima_apertura)}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                <button onClick={() => abrirPDFOffline(desc)} style={{
                  width: '38px', height: '38px', borderRadius: '10px',
                  background: '#EEF2FF', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <BookOpen size={16} color="#4F46E5" strokeWidth={2} />
                </button>
                <button style={{
                  width: '38px', height: '38px', borderRadius: '10px',
                  background: '#FFF1F2', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Trash2 size={16} color="#F43F5E" strokeWidth={2} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
