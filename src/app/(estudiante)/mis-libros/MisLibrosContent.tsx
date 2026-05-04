'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { 
  Search, ClipboardList, CheckCircle2, DownloadCloud, 
  WifiOff, Calendar, BookOpen, HardDrive, FileText, 
  Trash2, X, AlertTriangle, BarChart3
} from 'lucide-react'
import { 
  formatBytes, formatFechaCorta, diasRestantes, 
  fechaLimiteLabel, obtenerGradientePortada 
} from '@/lib/utils'
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

  const historialFiltrado = historial.filter(h => 
    h.lectura.titulo.toLowerCase().includes(busqueda.toLowerCase()) || 
    h.lectura.autor.toLowerCase().includes(busqueda.toLowerCase())
  )

  const offlineFiltrado = descargasOffline.filter(d => 
    d.lectura.titulo.toLowerCase().includes(busqueda.toLowerCase()) || 
    d.lectura.autor.toLowerCase().includes(busqueda.toLowerCase())
  )

  const proximasVencer = asignacionesFiltradas.filter(a => a.fecha_limite && diasRestantes(a.fecha_limite) <= 3 && a.estado !== 'completado')

  return (
    <div style={{ background: '#FDFDFF', minHeight: '100vh', paddingBottom: '100px' }}>
      
      {/* HEADER SECTION */}
      <div style={{ background: 'white', padding: '32px 0 0' }}>
        <div className="estudiante-container" style={{ padding: '0 24px' }}>
          <div className="mis-libros-header" style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#0F172A', fontFamily: 'var(--font-nunito)' }}>
              Mis Libros
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ color: '#818CF8', fontSize: '14px', fontWeight: 700 }}>
                {stats.leidas} leídas
              </span>
              <div style={{ 
                background: '#E0F2FE', color: '#0EA5E9', padding: '6px 16px', 
                borderRadius: '99px', fontSize: '14px', fontWeight: 700 
              }}>
                Promedio: {stats.promedio.toFixed(1)}
              </div>
            </div>
          </div>

          {/* TABS */}
          <div style={{ display: 'flex', borderBottom: '1.5px solid #F1F5F9', gap: '40px' }}>
            {[
              { key: 'activas', label: 'Asignadas', Icon: ClipboardList },
              { key: 'historial', label: 'Historial', Icon: CheckCircle2 },
              { key: 'offline', label: 'Offline', Icon: DownloadCloud },
            ].map((tab) => {
              const active = tabActiva === tab.key
              return (
                <button
                  key={tab.key}
                  onClick={() => setTabActiva(tab.key as any)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '12px 0', border: 'none', background: 'transparent',
                    cursor: 'pointer', fontSize: '15px', fontWeight: 700,
                    color: active ? '#4F46E5' : '#94A3B8',
                    borderBottom: active ? '3px solid #4F46E5' : '3px solid transparent',
                    transition: 'all 0.2s',
                    marginBottom: '-1.5px'
                  }}
                >
                  <tab.Icon size={18} strokeWidth={active ? 2.5 : 2} />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="estudiante-container" style={{ padding: '32px 24px' }}>
        
        {/* SEARCH BAR */}
        <div style={{
          background: 'white', borderRadius: '20px', border: '1.5px solid #F1F5F9',
          display: 'flex', alignItems: 'center', padding: '0 20px',
          height: '60px', marginBottom: '32px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
        }}>
          <Search size={20} color="#CBD5E1" />
          <input 
            value={busqueda} 
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por título o autor..."
            style={{
              flex: 1, border: 'none', background: 'transparent', outline: 'none',
              padding: '0 16px', fontSize: '16px', color: '#0F172A', fontWeight: 600
            }}
          />
          {busqueda && (
            <X 
              size={20} color="#94A3B8" 
              onClick={() => setBusqueda('')} 
              style={{ cursor: 'pointer' }} 
            />
          )}
        </div>

        {/* CONTENT AREA */}
        {tabActiva === 'activas' && (
          <div>
            {proximasVencer.length > 0 && (
              <div style={{
                background: '#FFFBEB', border: '1.5px solid #FDE68A',
                borderRadius: '24px', padding: '24px', marginBottom: '32px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <AlertTriangle size={18} color="#D97706" strokeWidth={2.5} />
                  <p style={{ fontSize: '15px', fontWeight: 800, color: '#92400E' }}>Próximas a vencer</p>
                </div>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {proximasVencer.map(asig => (
                    <div key={asig.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#D97706' }} />
                      <p style={{ flex: 1, fontSize: '14px', fontWeight: 700, color: '#78350F' }}>{asig.lectura.titulo}</p>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: '#D97706' }}>
                        {diasRestantes(asig.fecha_limite) === 0 ? 'Hoy' : `${diasRestantes(asig.fecha_limite)} días`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {asignacionesFiltradas.length === 0 ? (
              <CustomEmptyState 
                title="No hay libros asignados" 
                description="Las asignaciones de tus profesores aparecerán aquí." 
              />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                {asignacionesFiltradas.map((asig) => (
                  <BookCard 
                    key={asig.id} asig={asig} 
                    onAction={() => router.push(`/lectura/${asig.lectura_id}`)} 
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {tabActiva === 'historial' && (
          <div>
            {historialFiltrado.length === 0 ? (
              <CustomEmptyState 
                title="Historial vacío" 
                description="Aquí verás las lecturas que ya has completado." 
              />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                {historialFiltrado.map(h => (
                  <div key={h.id} style={{
                    background: 'white', borderRadius: '24px', padding: '16px',
                    display: 'flex', gap: '16px', alignItems: 'center',
                    border: '1.5px solid #F1F5F9'
                  }}>
                    <div style={{ 
                      width: '60px', height: '80px', borderRadius: '12px', overflow: 'hidden',
                      position: 'relative', background: obtenerGradientePortada(h.lectura_id) 
                    }}>
                      {h.lectura.portada_url && <Image src={h.lectura.portada_url} alt="" fill style={{ objectFit: 'cover' }} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>{h.lectura.titulo}</h4>
                      <p style={{ fontSize: '13px', color: '#94A3B8', fontWeight: 600 }}>{formatFechaCorta(h.updated_at)}</p>
                    </div>
                    <div style={{ 
                      width: '48px', height: '48px', borderRadius: '12px', background: '#F0FDF4',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981', fontWeight: 900
                    }}>
                      {h.nota_final || h.nota_automatica || 0}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tabActiva === 'offline' && (
          <div>
            <div style={{
              background: 'white', borderRadius: '24px', padding: '24px',
              border: '1.5px solid #F1F5F9', marginBottom: '32px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <p style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>Almacenamiento Offline</p>
                <p style={{ fontSize: '15px', fontWeight: 900, color: '#4F46E5' }}>{formatBytes(espacioUsado)}</p>
              </div>
              <div style={{ height: '10px', background: '#F1F5F9', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', background: '#4F46E5', borderRadius: '99px',
                  width: `${(espacioUsado / MAX_STORAGE) * 100}%`, transition: 'width 0.5s' 
                }} />
              </div>
            </div>

            {offlineFiltrado.length === 0 ? (
              <CustomEmptyState 
                title="Sin descargas" 
                description="Los libros que descargues para leer sin internet aparecerán aquí." 
              />
            ) : (
              <div style={{ display: 'grid', gap: '12px' }}>
                {offlineFiltrado.map(d => (
                  <div key={d.id} style={{
                    background: 'white', borderRadius: '20px', padding: '16px',
                    display: 'flex', alignItems: 'center', gap: '16px', border: '1.5px solid #F1F5F9'
                  }}>
                    <div style={{ 
                      width: '48px', height: '48px', borderRadius: '12px', background: '#EEF2FF',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4F46E5'
                    }}>
                      <FileText size={24} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>{d.lectura.titulo}</p>
                      <p style={{ fontSize: '13px', color: '#94A3B8', fontWeight: 600 }}>{formatBytes(d.archivo_tamanio)}</p>
                    </div>
                    <button 
                      onClick={() => router.push(`/lectura/${d.lectura_id}`)}
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#4F46E5' }}
                    >
                      <BookOpen size={20} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function CustomEmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '80px 0', textAlign: 'center'
    }}>
      <div style={{
        width: '80px', height: '80px', background: '#F5F5FF',
        borderRadius: '24px', display: 'flex', alignItems: 'center',
        justifyContent: 'center', marginBottom: '24px', color: '#4F46E5'
      }}>
        <BookOpen size={40} strokeWidth={1.5} />
      </div>
      <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
        {title}
      </h3>
      <p style={{ fontSize: '15px', color: '#94A3B8', fontWeight: 500 }}>
        {description}
      </p>
    </div>
  )
}

function BookCard({ asig, onAction }: { asig: Asignacion, onAction: () => void }) {
  return (
    <div style={{
      background: 'white', borderRadius: '32px', padding: '20px',
      border: '1.5px solid #F1F5F9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
      display: 'flex', gap: '20px'
    }}>
      <div style={{ 
        width: '100px', height: '140px', borderRadius: '20px', overflow: 'hidden',
        position: 'relative', flexShrink: 0, boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
        background: obtenerGradientePortada(asig.lectura_id)
      }}>
        {asig.lectura.portada_url && <Image src={asig.lectura.portada_url} alt="" fill style={{ objectFit: 'cover' }} />}
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', marginBottom: '4px', lineHeight: '1.2' }}>
          {asig.lectura.titulo}
        </h3>
        <p style={{ fontSize: '14px', color: '#64748B', fontWeight: 600, marginBottom: '12px' }}>
          {asig.lectura.autor}
        </p>
        
        {asig.estado === 'en_progreso' ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#4F46E5' }}>{asig.porcentaje_progreso}%</span>
            </div>
            <div style={{ height: '8px', background: '#F1F5F9', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: '#4F46E5', borderRadius: '99px', width: `${asig.porcentaje_progreso}%` }} />
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
             <Calendar size={14} color="#94A3B8" />
             <span style={{ fontSize: '12px', fontWeight: 700, color: '#94A3B8' }}>{fechaLimiteLabel(asig.fecha_limite)}</span>
          </div>
        )}

        <button 
          onClick={onAction}
          style={{
            marginTop: '16px', background: '#F5F5FF', border: 'none',
            padding: '8px 16px', borderRadius: '12px', color: '#4F46E5',
            fontSize: '13px', fontWeight: 800, cursor: 'pointer', width: 'fit-content'
          }}
        >
          {asig.estado === 'completado' ? 'Ver resultado' : 'Continuar'}
        </button>
      </div>
    </div>
  )
}
