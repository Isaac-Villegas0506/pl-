'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { 
  Settings, Camera, Sprout, BookOpen, Flame, Zap, Star, Trophy, 
  Diamond, Book, PenTool, Target, BarChart3, Medal, Sparkles, Lock, Circle,
  Lightbulb, Shield, Sword, GraduationCap
} from 'lucide-react'
import { UsuarioPerfil, EstadisticasEstudiante, LogroDesbloqueado } from './types'
import BtnCerrarSesion from '@/components/ui/BtnCerrarSesion'

interface Props {
  usuario: UsuarioPerfil
  stats: EstadisticasEstudiante
  logrosDesbloqueados: LogroDesbloqueado[]
  totalLogrosDisponibles: number
  rachaActual: number
  rachaMaxima: number
  diasRacha: string[]
  topNotas: { titulo: string; nota: number; fecha: string }[]
}

const NIVELES = [
  { min: 0,   nombre: 'Lector Principiante', Icon: Sprout,  color: '#10B981' },
  { min: 30,  nombre: 'Lector Curioso',      Icon: BookOpen, color: '#3B82F6' },
  { min: 80,  nombre: 'Lector Activo',       Icon: Flame,    color: '#F97316' },
  { min: 150, nombre: 'Lector Comprometido', Icon: Zap,      color: '#F59E0B' },
  { min: 300, nombre: 'Gran Lector',         Icon: Star,     color: '#8B5CF6' },
  { min: 500, nombre: 'Maestro Lector',      Icon: Trophy,   color: '#EC4899' },
  { min: 800, nombre: 'Leyenda Lectora',     Icon: Diamond,  color: '#06B6D4' },
]

function getInfoNivel(puntos: number) {
  let nivel = NIVELES[0]
  for (const n of NIVELES) { if (puntos >= n.min) nivel = n }
  return nivel
}

function siguienteNivelXP(puntos: number): number {
  for (let i = 0; i < NIVELES.length - 1; i++) {
    if (puntos < NIVELES[i + 1].min) return NIVELES[i + 1].min - puntos
  }
  return 0
}

function porcentajeNivel(puntos: number): number {
  for (let i = 0; i < NIVELES.length - 1; i++) {
    if (puntos < NIVELES[i + 1].min) {
      const base = NIVELES[i].min
      const siguiente = NIVELES[i + 1].min
      return ((puntos - base) / (siguiente - base)) * 100
    }
  }
  return 100
}

function getLogroIcon(emoji: string) {
  switch (emoji) {
    case '📚': return Book
    case '🔥': return Flame
    case '🏆': return Trophy
    case '⭐': return Star
    case '🌟': return Star
    case '🚀': return Zap
    case '⚡': return Zap
    case '💡': return Lightbulb
    case '🎓': return GraduationCap
    case '💎': return Diamond
    case '🛡️': return Shield
    case '⚔️': return Sword
    case '✨': return Sparkles
    default: return Sparkles
  }
}

function notaColor(nota: number): string {
  if (nota >= 16) return '#10B981'
  if (nota >= 11) return '#4F46E5'
  return '#F43F5E'
}

export default function PerfilContent({
  usuario,
  stats,
  logrosDesbloqueados,
  totalLogrosDisponibles,
  rachaActual,
  rachaMaxima,
  diasRacha,
  topNotas,
}: Props) {
  const router = useRouter()
  const [tabActiva, setTabActiva] = useState<'stats' | 'logros' | 'racha'>('stats')
  
  const colorPerfilBase = usuario.color_perfil || '#4F46E5'

  const hoy = new Date()
  const ultimos7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(hoy)
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })

  const logrosMuestra = logrosDesbloqueados.map(ld => ({...ld.logro, id: ld.logro_id}))

  return (
    <div style={{ minHeight: '100vh', background: '#F5F3FF', paddingBottom: '80px' }}>
      {/* ═══════════════════════════════════════ */}
      {/* SECCIÓN 1: HERO DEL PERFIL */}
      {/* ═══════════════════════════════════════ */}
      <div style={{
        background: `linear-gradient(160deg, ${colorPerfilBase}CC 0%, ${colorPerfilBase} 100%)`,
        padding: '32px 0 80px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', bottom: '-2px', left: 0, right: 0, zIndex: 0,
          height: '48px',
          background: '#F5F3FF',
          borderRadius: '50% 50% 0 0 / 100% 100% 0 0',
        }} />

        <div className="estudiante-container" style={{ position: 'relative', zIndex: 1, padding: '0 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
            <button
              onClick={() => router.push('/perfil/configuracion')}
              style={{
                width: '44px', height: '44px',
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(12px)',
                border: '1.5px solid rgba(255,255,255,0.3)',
                borderRadius: '14px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              <Settings size={20} color="white" strokeWidth={2} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            <div
              onClick={() => router.push('/perfil/editar')}
              style={{
                position: 'relative', cursor: 'pointer', flexShrink: 0,
              }}
            >
              <div style={{
                width: '110px', height: '110px', borderRadius: '32px',
                overflow: 'hidden', position: 'relative',
                boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
                border: '4px solid white',
              }}>
                {usuario.avatar_url ? (
                  <Image
                    src={usuario.avatar_url}
                    alt="Avatar"
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{
                    width: '100%', height: '100%',
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{
                      fontSize: '40px', fontWeight: '900', color: 'white',
                      fontFamily: 'var(--font-nunito)',
                    }}>
                      {usuario.nombre?.[0]}{usuario.apellido?.[0]}
                    </span>
                  </div>
                )}
              </div>
              <div style={{
                position: 'absolute', bottom: '2px', right: '2px',
                width: '32px', height: '32px',
                background: 'white', borderRadius: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}>
                <Camera size={16} color={colorPerfilBase} strokeWidth={2.5} />
              </div>
            </div>

            <div style={{ flex: 1, minWidth: '240px' }}>
              <h1 style={{
                fontSize: '32px', fontWeight: '900', color: 'white',
                lineHeight: '1.1', textShadow: '0 2px 8px rgba(0,0,0,0.2)',
              }}>
                {usuario.nombre} {usuario.apellido}
              </h1>
              {(() => {
                const nivel = getInfoNivel(stats.total_puntos_logros)
                const IconoNivel = nivel.Icon
                return (
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    background: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '12px', padding: '6px 16px', marginTop: '10px',
                  }}>
                    <IconoNivel size={16} color="white" strokeWidth={2.5} />
                    <span style={{
                      fontSize: '14px', fontWeight: '800', color: 'white',
                    }}>
                      {nivel.nombre}
                    </span>
                  </div>
                )
              })()}
              {usuario.bio && (
                <p style={{
                  fontSize: '15px', color: 'rgba(255,255,255,0.9)',
                  marginTop: '12px', lineHeight: '1.5', maxWidth: '500px',
                  fontWeight: 500,
                }}>
                  {usuario.bio}
                </p>
              )}
            </div>
          </div>

          <div style={{ marginTop: '24px', maxWidth: '600px' }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', marginBottom: '8px',
            }}>
              <span style={{ fontSize: '13px', color: 'white', fontWeight: '800' }}>
                {stats.total_puntos_logros} XP
              </span>
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', fontWeight: '700' }}>
                Faltan {siguienteNivelXP(stats.total_puntos_logros)} XP
              </span>
            </div>
            <div style={{
              height: '10px', background: 'rgba(255,255,255,0.2)',
              borderRadius: '99px', overflow: 'hidden',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)',
            }}>
              <div style={{
                height: '100%',
                width: `${porcentajeNivel(stats.total_puntos_logros)}%`,
                background: 'white',
                borderRadius: '99px',
                transition: 'width 1s cubic-bezier(0.16,1,0.3,1)',
                boxShadow: '0 0 12px rgba(255,255,255,0.6)',
              }} />
            </div>
          </div>
        </div>
      </div>

      <div className="estudiante-container" style={{ padding: '0 20px' }}>
        {/* MINI STATS */}
        <div style={{
          marginTop: '-30px', position: 'relative', zIndex: 10,
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px',
        }} className="perfil-stats-grid">
          {[
            { valor: stats.total_lecturas_completadas, label: 'Leídas', Icon: Book, color: '#4F46E5' },
            { valor: stats.total_evaluaciones, label: 'Evaluac.', Icon: PenTool, color: '#10B981' },
            { valor: `${stats.promedio_notas > 0 ? stats.promedio_notas.toFixed(1) : '—'}`, label: 'Promedio', Icon: Target, color: '#F59E0B' },
            { valor: rachaActual, label: 'Racha', Icon: Flame, color: '#F43F5E' },
          ].map((item) => (
            <div key={item.label} style={{
              background: 'white', borderRadius: '20px', padding: '16px 12px',
              textAlign: 'center',
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              border: '1px solid #F1F5F9',
            }}>
              <div style={{ padding: '8px', background: item.color + '15', borderRadius: '12px', marginBottom: '8px' }}>
                <item.Icon size={20} color={item.color} strokeWidth={2.5} />
              </div>
              <p style={{ fontSize: '22px', fontWeight: '900', color: '#111827', lineHeight: '1' }}>
                {item.valor}
              </p>
              <p style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', marginTop: '4px', textTransform: 'uppercase' }}>
                {item.label}
              </p>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div style={{
          display: 'flex', gap: '8px',
          background: '#F1F5F9', borderRadius: '18px',
          padding: '6px', margin: '32px 0 24px',
        }}>
          {['stats', 'logros', 'racha'].map((tab) => {
            const TabIcon = tab === 'stats' ? BarChart3 : tab === 'logros' ? Trophy : Flame
            const labels = { stats: 'Estadísticas', logros: 'Mis Logros', racha: 'Racha Semanal' }
            return (
              <button
                key={tab}
                onClick={() => setTabActiva(tab as typeof tabActiva)}
                style={{
                  flex: 1, height: '44px', border: 'none', borderRadius: '14px',
                  fontSize: '14px', fontWeight: '800', cursor: 'pointer',
                  fontFamily: 'inherit',
                  background: tabActiva === tab ? 'white' : 'transparent',
                  color: tabActiva === tab ? '#111827' : '#64748B',
                  boxShadow: tabActiva === tab ? '0 4px 12px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}
              >
                <TabIcon size={16} strokeWidth={2.5} />
                <span className="hide-mobile">{labels[tab as keyof typeof labels]}</span>
                {tab === 'stats' && <span className="hide-desktop">Stats</span>}
                {tab === 'logros' && <span className="hide-desktop">Logros</span>}
                {tab === 'racha' && <span className="hide-desktop">Racha</span>}
              </button>
            )
          })}
        </div>

        {/* CONTENIDO DE TABS */}
        <div style={{ minHeight: '300px' }}>
          {tabActiva === 'stats' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }} className="perfil-tab-stats-grid">
              <div style={{
                background: 'white', borderRadius: '24px', padding: '24px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.04)', border: '1px solid #F1F5F9',
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#111827',
                  marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Target size={20} color="#F59E0B" strokeWidth={2.5} />
                  Rendimiento Académico
                </h3>
                <div style={{ display: 'flex', gap: '0', marginBottom: '24px', borderBottom: '1.5px solid #F8FAFC', paddingBottom: '24px' }}>
                  {[
                    { val: stats.promedio_notas > 0 ? stats.promedio_notas.toFixed(1) : '—',
                      label: 'Promedio', color: notaColor(stats.promedio_notas) },
                    { val: stats.mejor_nota > 0 ? stats.mejor_nota.toFixed(1) : '—',
                      label: 'Máxima', color: '#10B981' },
                    { val: stats.total_evaluaciones.toString(),
                      label: 'Evaluaciones', color: '#4F46E5' },
                  ].map((s, i) => (
                    <div key={i} style={{
                      flex: 1, textAlign: 'center',
                      borderRight: i < 2 ? '1.5px solid #F1F5F9' : 'none',
                      padding: '0 10px',
                    }}>
                      <p style={{ fontSize: '32px', fontWeight: '900', color: s.color,
                        lineHeight: '1' }}>{s.val}</p>
                      <p style={{ fontSize: '12px', color: '#94A3B8', fontWeight: '700',
                        marginTop: '6px', textTransform: 'uppercase' }}>{s.label}</p>
                    </div>
                  ))}
                </div>

                {topNotas.length > 0 && (
                  <>
                    <p style={{ fontSize: '12px', fontWeight: '800', color: '#94A3B8',
                      textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
                      Lecturas con mayor puntaje
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                      {topNotas.map((n, i) => (
                        <div key={i} style={{
                          display: 'flex', alignItems: 'center', gap: '14px',
                          padding: '12px 16px', borderRadius: '16px',
                          background: '#F8FAFC',
                        }}>
                          <Medal 
                            size={20} 
                            color={i === 0 ? '#F59E0B' : i === 1 ? '#94A3B8' : '#B45309'} 
                            strokeWidth={2.5} 
                          />
                          <p style={{ flex: 1, fontSize: '14px', fontWeight: '700',
                            color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap' }}>{n.titulo}</p>
                          <span style={{
                            fontSize: '18px', fontWeight: '900',
                            color: n.nota >= 16 ? '#10B981' : n.nota >= 11 ? '#4F46E5' : '#F43F5E',
                          }}>{n.nota.toFixed(0)}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div style={{
                background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
                border: '2px solid #FED7AA',
                borderRadius: '24px', padding: '24px',
                boxShadow: '0 8px 24px rgba(249,115,22,0.1)',
                display: 'flex', gap: '16px', alignItems: 'center'
              }}>
                <div style={{ flex: 1, textAlign: 'center',
                  borderRight: '1.5px solid rgba(249,115,22,0.2)', paddingRight: '16px' }}>
                  <Flame size={40} color="#F97316" strokeWidth={2.5} />
                  <p style={{ fontSize: '40px', fontWeight: '900', color: '#C2410C',
                    lineHeight: '1', marginTop: '8px' }}>{rachaActual}</p>
                  <p style={{ fontSize: '13px', color: '#9A3412', fontWeight: '800',
                    marginTop: '4px', textTransform: 'uppercase' }}>Días seguidos</p>
                </div>
                <div style={{ flex: 1, textAlign: 'center', paddingLeft: '16px' }}>
                  <Zap size={40} color="#F97316" strokeWidth={2.5} />
                  <p style={{ fontSize: '40px', fontWeight: '900', color: '#C2410C',
                    lineHeight: '1', marginTop: '8px' }}>{rachaMaxima}</p>
                  <p style={{ fontSize: '13px', color: '#9A3412', fontWeight: '800',
                    marginTop: '4px', textTransform: 'uppercase' }}>Mejor marca</p>
                </div>
              </div>
            </div>
          )}

          {tabActiva === 'logros' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
              {logrosMuestra.map((logro) => {
                const coloresRareza = {
                  comun:      { bg: '#F8FAFC', border: '#E2E8F0', text: '#64748B' },
                  raro:       { bg: '#EFF6FF', border: '#DBEAFE', text: '#2563EB' },
                  epico:      { bg: '#F5F3FF', border: '#EDE9FE', text: '#7C3AED' },
                  legendario: { bg: '#FFFBEB', border: '#FEF3C7', text: '#D97706' },
                }
                const colores = coloresRareza[logro.rareza]

                return (
                  <div key={logro.id} style={{
                    background: 'white',
                    border: `2px solid ${colores.border}`,
                    borderRadius: '24px', padding: '20px 16px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: '12px', textAlign: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                    transition: 'all 0.3s ease',
                  }}>
                    <div style={{
                      width: '64px', height: '64px',
                      borderRadius: '20px',
                      background: colores.bg,
                      color: colores.text,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: `0 8px 16px ${colores.bg}`,
                    }}>
                      {(() => {
                        const Icono = getLogroIcon(logro.icono)
                        return <Icono size={32} strokeWidth={2.5} />
                      })()}
                    </div>

                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '15px', fontWeight: '800', color: '#111827', lineHeight: '1.2' }}>
                        {logro.nombre}
                      </p>
                      <p style={{ fontSize: '12px', color: '#64748B', marginTop: '6px', lineHeight: '1.4', fontWeight: 500 }}>
                        {logro.descripcion}
                      </p>
                    </div>

                    <span style={{
                      fontSize: '11px', fontWeight: '900',
                      color: 'white', background: colores.text,
                      borderRadius: '8px', padding: '4px 12px',
                    }}>
                      +{logro.puntos} XP
                    </span>
                  </div>
                )
              })}
            </div>
          )}

          {tabActiva === 'racha' && (
            <div style={{
              background: 'white', borderRadius: '24px', padding: '32px 24px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)', border: '1px solid #F1F5F9',
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#111827',
                marginBottom: '24px', textAlign: 'center' }}>
                Tu Progreso Semanal
              </h3>
              <div style={{
                display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap'
              }}>
                {ultimos7.map((fecha, i) => {
                  const tieneActividad = diasRacha.includes(fecha)
                  const esHoy = fecha === new Date().toISOString().split('T')[0]
                  const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
                  const diaSemana = diasSemana[new Date(fecha + 'T12:00:00').getDay()]
                  return (
                    <div key={fecha} style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
                      width: '64px',
                    }}>
                      <span style={{ fontSize: '13px', fontWeight: '800',
                        color: esHoy ? '#4F46E5' : '#94A3B8' }}>
                        {diaSemana}
                      </span>
                      <div style={{
                        width: '52px', height: '52px', borderRadius: '18px',
                        background: tieneActividad
                          ? 'linear-gradient(135deg, #F97316, #EA580C)'
                          : esHoy ? '#F1F5F9' : '#F8FAFC',
                        border: esHoy && !tieneActividad ? '2.5px solid #4F46E5' : '2.5px solid #F1F5F9',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: tieneActividad ? '0 8px 16px rgba(234,88,12,0.25)' : 'none',
                        transition: 'all 0.3s ease',
                      }}>
                        {tieneActividad ? <Flame size={28} color="white" strokeWidth={2.5} /> : esHoy ? <BookOpen size={24} color="#4F46E5" strokeWidth={2} /> : null}
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: '800',
                        color: tieneActividad ? '#C2410C' : '#CBD5E1' }}>
                        {new Date(fecha + 'T12:00:00').getDate()}
                      </span>
                    </div>
                  )
                })}
              </div>
              <div style={{ marginTop: '32px', textAlign: 'center', padding: '24px',
                background: '#FFF7ED', borderRadius: '20px', border: '2px solid #FFEDD5' }}>
                <p style={{ fontSize: '16px', fontWeight: '800', color: '#9A3412', lineHeight: '1.4' }}>
                  {rachaActual === 0 ? "¡Hoy es un gran día para retomar tu hábito lector!" :
                   `¡Increíble! Has mantenido tu racha por ${rachaActual} días.`}
                </p>
                <p style={{ fontSize: '14px', color: '#C2410C', marginTop: '8px', fontWeight: 600 }}>
                  Tu récord personal es de {rachaMaxima} días.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* BOTÓN DE CERRAR SESIÓN */}
        <div style={{ padding: '40px 0', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: '300px' }}>
            <BtnCerrarSesion variant="menuItem" />
          </div>
        </div>
      </div>
    </div>
  )
}
