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

  // Para mostrar todos los logros (fusionando desbloqueados y un mock de disponibles para el ejemplo)
  // Idealmente, se pasarían todos los logros desde el servidor.
  const logrosMuestra = logrosDesbloqueados.map(ld => ({...ld.logro, id: ld.logro_id}))
  const desbloqueadosIds = new Set(logrosDesbloqueados.map(l => l.logro_id))


  return (
    <div style={{ minHeight: '100vh', background: '#F5F3FF', paddingBottom: '80px' }}>
      {/* ═══════════════════════════════════════ */}
      {/* SECCIÓN 1: HERO DEL PERFIL */}
      {/* ═══════════════════════════════════════ */}
      <div style={{
        background: `linear-gradient(160deg, ${colorPerfilBase}CC 0%, ${colorPerfilBase}88 100%)`,
        padding: '28px 20px 80px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Patrón decorativo de ondas */}
        <div style={{
          position: 'absolute', bottom: '-2px', left: 0, right: 0, zIndex: 0,
          height: '48px',
          background: '#F5F3FF',
          borderRadius: '50% 50% 0 0 / 100% 100% 0 0',
        }} />

        {/* Brillo decorativo */}
        <div style={{
          position: 'absolute', top: '-80px', right: '-80px', zIndex: 0,
          width: '220px', height: '220px',
          background: 'rgba(255,255,255,0.15)',
          borderRadius: '50%', filter: 'blur(30px)',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Fila superior */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
            <button
              onClick={() => router.push('/perfil/configuracion')}
              style={{
                width: '38px', height: '38px',
                background: 'rgba(255,255,255,0.25)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <Settings size={18} color="white" strokeWidth={2} />
            </button>
          </div>

          {/* Avatar + info */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px' }}>
            <div
              onClick={() => router.push('/perfil/editar')}
              style={{
                position: 'relative', cursor: 'pointer', flexShrink: 0,
              }}
            >
              <div style={{
                width: '88px', height: '88px', borderRadius: '26px',
                overflow: 'hidden', position: 'relative',
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                border: '3px solid rgba(255,255,255,0.8)',
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
                    background: 'rgba(255,255,255,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{
                      fontSize: '32px', fontWeight: '800', color: 'white',
                      fontFamily: 'var(--font-playfair, serif)',
                    }}>
                      {usuario.nombre?.[0]}{usuario.apellido?.[0]}
                    </span>
                  </div>
                )}
              </div>
              <div style={{
                position: 'absolute', bottom: '-4px', right: '-4px',
                width: '26px', height: '26px',
                background: 'white', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}>
                <Camera size={13} color="#4F46E5" strokeWidth={2.5} />
              </div>
            </div>

            {/* Nombre + nivel */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{
                fontSize: '22px', fontWeight: '800', color: 'white',
                lineHeight: '1.2', textShadow: '0 1px 4px rgba(0,0,0,0.15)',
              }}>
                {usuario.nombre} {usuario.apellido}
              </h1>
              {(() => {
                const nivel = getInfoNivel(stats.total_puntos_logros)
                const IconoNivel = nivel.Icon
                return (
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    background: 'rgba(255,255,255,0.25)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: '99px', padding: '4px 12px', marginTop: '6px',
                  }}>
                    <IconoNivel size={14} color="white" strokeWidth={2.5} />
                    <span style={{
                      fontSize: '12px', fontWeight: '800', color: 'white',
                    }}>
                      {nivel.nombre}
                    </span>
                  </div>
                )
              })()}
              {usuario.bio && (
                <p style={{
                  fontSize: '13px', color: 'rgba(255,255,255,0.8)',
                  marginTop: '6px', lineHeight: '1.4',
                }}>
                  {usuario.bio}
                </p>
              )}
            </div>
          </div>

          {/* Barra de XP */}
          <div style={{ marginTop: '16px' }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', marginBottom: '6px',
            }}>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)',
                fontWeight: '600' }}>
                {stats.total_puntos_logros} XP
              </span>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)',
                fontWeight: '600' }}>
                {siguienteNivelXP(stats.total_puntos_logros)} XP para subir
              </span>
            </div>
            <div style={{
              height: '6px', background: 'rgba(255,255,255,0.25)',
              borderRadius: '99px', overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${porcentajeNivel(stats.total_puntos_logros)}%`,
                background: 'white',
                borderRadius: '99px',
                transition: 'width 1s cubic-bezier(0.16,1,0.3,1)',
                boxShadow: '0 0 8px rgba(255,255,255,0.5)',
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════ */}
      {/* SECCIÓN 2: MINI STATS */}
      {/* ═══════════════════════════════════════ */}
      <div style={{
        marginTop: '-30px', padding: '0 16px', position: 'relative', zIndex: 10,
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px',
      }}>
        {[
          { valor: stats.total_lecturas_completadas, label: 'Leídas', Icon: Book, color: '#4F46E5' },
          { valor: stats.total_evaluaciones, label: 'Evaluac.', Icon: PenTool, color: '#10B981' },
          { valor: `${stats.promedio_notas > 0 ? stats.promedio_notas.toFixed(1) : '—'}`, label: 'Promedio', Icon: Target, color: '#F59E0B' },
          { valor: rachaActual, label: 'Racha', Icon: Flame, color: '#F43F5E' },
        ].map((item) => (
          <div key={item.label} style={{
            background: 'white', borderRadius: '16px', padding: '12px 8px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            display: 'flex', flexDirection: 'column', alignItems: 'center'
          }}>
            <item.Icon size={18} color={item.color} strokeWidth={2.5} />
            <p style={{
              fontSize: '18px', fontWeight: '800', color: '#111827',
              lineHeight: '1.1', marginTop: '6px',
            }}>
              {item.valor}
            </p>
            <p style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: '600',
              marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {item.label}
            </p>
          </div>
        ))}
      </div>

      {/* ═══════════════════════════════════════ */}
      {/* SECCIÓN 3: TABS */}
      {/* ═══════════════════════════════════════ */}
      <div style={{
        display: 'flex', gap: '4px',
        background: '#E5E7EB', borderRadius: '14px',
        padding: '4px', margin: '20px 16px 0',
      }}>
        {['stats', 'logros', 'racha'].map((tab) => {
          const TabIcon = tab === 'stats' ? BarChart3 : tab === 'logros' ? Trophy : Flame
          return (
            <button
              key={tab}
              onClick={() => setTabActiva(tab as typeof tabActiva)}
              style={{
                flex: 1, height: '36px', border: 'none', borderRadius: '10px',
                fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                fontFamily: 'inherit',
                background: tabActiva === tab ? 'white' : 'transparent',
                color: tabActiva === tab ? '#111827' : '#6B7280',
                boxShadow: tabActiva === tab ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.2s',
                textTransform: 'capitalize',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
              }}
            >
              <TabIcon size={14} strokeWidth={2.5} />
              {tab === 'stats' ? 'Stats' : tab === 'logros' ? 'Logros' : 'Racha'}
            </button>
          )
        })}
      </div>

      {/* ═══════════════════════════════════════ */}
      {/* TAB 1: ESTADÍSTICAS */}
      {/* ═══════════════════════════════════════ */}
      {tabActiva === 'stats' && (
        <div style={{ padding: '16px' }}>
          <div style={{
            background: 'white', borderRadius: '20px', padding: '18px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '12px',
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#111827',
              marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Target size={18} color="#F59E0B" strokeWidth={2.5} />
              Rendimiento en evaluaciones
            </h3>
            <div style={{ display: 'flex', gap: '0', marginBottom: '16px' }}>
              {[
                { val: stats.promedio_notas > 0 ? stats.promedio_notas.toFixed(1) : '—',
                  label: 'Promedio', color: notaColor(stats.promedio_notas) },
                { val: stats.mejor_nota > 0 ? stats.mejor_nota.toFixed(1) : '—',
                  label: 'Mejor nota', color: '#10B981' },
                { val: stats.total_evaluaciones.toString(),
                  label: 'Completadas', color: '#4F46E5' },
              ].map((s, i) => (
                <div key={i} style={{
                  flex: 1, textAlign: 'center',
                  borderRight: i < 2 ? '1px solid #F3F4F6' : 'none',
                  padding: '0 12px',
                }}>
                  <p style={{ fontSize: '28px', fontWeight: '800', color: s.color,
                    lineHeight: '1' }}>{s.val}</p>
                  <p style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '600',
                    marginTop: '4px' }}>{s.label}</p>
                </div>
              ))}
            </div>

            {topNotas.length > 0 && (
              <>
                <p style={{ fontSize: '12px', fontWeight: '700', color: '#9CA3AF',
                  textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
                  Mejores notas
                </p>
                {topNotas.map((n, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '8px 0',
                    borderBottom: i < topNotas.length - 1 ? '1px solid #F9FAFB' : 'none',
                  }}>
                    <Medal 
                      size={18} 
                      color={i === 0 ? '#F59E0B' : i === 1 ? '#94A3B8' : '#B45309'} 
                      strokeWidth={2.5} 
                    />
                    <p style={{ flex: 1, fontSize: '13px', fontWeight: '600',
                      color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap' }}>{n.titulo}</p>
                    <span style={{
                      fontSize: '16px', fontWeight: '800',
                      color: n.nota >= 16 ? '#10B981' : n.nota >= 11 ? '#4F46E5' : '#F43F5E',
                    }}>{n.nota}/20</span>
                  </div>
                ))}
              </>
            )}
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #FFF7ED, #FEF3C7)',
            border: '1.5px solid #FCD34D',
            borderRadius: '20px', padding: '18px',
            boxShadow: '0 2px 8px rgba(245,158,11,0.12)', marginBottom: '12px',
            display: 'flex', gap: '0',
          }}>
            <div style={{ flex: 1, textAlign: 'center',
              borderRight: '1px solid rgba(245,158,11,0.2)', paddingRight: '16px',
              display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Flame size={36} color="#F59E0B" strokeWidth={2} />
              <p style={{ fontSize: '32px', fontWeight: '800', color: '#D97706',
                lineHeight: '1', marginTop: '8px' }}>{rachaActual}</p>
              <p style={{ fontSize: '12px', color: '#92400E', fontWeight: '700',
                marginTop: '4px' }}>Racha actual</p>
            </div>
            <div style={{ flex: 1, textAlign: 'center', paddingLeft: '16px',
              display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Zap size={36} color="#F59E0B" strokeWidth={2} />
              <p style={{ fontSize: '32px', fontWeight: '800', color: '#D97706',
                lineHeight: '1', marginTop: '8px' }}>{rachaMaxima}</p>
              <p style={{ fontSize: '12px', color: '#92400E', fontWeight: '700',
                marginTop: '4px' }}>Mejor racha</p>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════ */}
      {/* TAB 2: LOGROS */}
      {/* ═══════════════════════════════════════ */}
      {tabActiva === 'logros' && (
        <>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px',
          }}>
            <div>
              <p style={{ fontSize: '14px', fontWeight: '700', color: '#111827' }}>
                {logrosDesbloqueados.length} de {totalLogrosDisponibles} logros
              </p>
              <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>
                {stats.total_puntos_logros} XP acumulados
              </p>
            </div>
            <div style={{
              width: '80px', height: '8px', borderRadius: '99px',
              background: '#E5E7EB', overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', borderRadius: '99px',
                background: 'linear-gradient(90deg, #4F46E5, #6D28D9)',
                width: `${Math.min(100, (logrosDesbloqueados.length / Math.max(1, totalLogrosDisponibles)) * 100)}%`,
              }} />
            </div>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: '10px', padding: '0 16px',
          }}>
            {logrosMuestra.map((logro) => {
              const desbloqueado = true // desbloqueadosIds.has(logro.id) // Mostramos solo los que tiene para simplificar
              const coloresRareza = {
                comun:      { bg: '#F9FAFB', border: '#E5E7EB', text: '#6B7280' },
                raro:       { bg: '#EEF2FF', border: '#C7D2FE', text: '#4F46E5' },
                epico:      { bg: '#F5F3FF', border: '#DDD6FE', text: '#7C3AED' },
                legendario: { bg: '#FFFBEB', border: '#FCD34D', text: '#D97706' },
              }
              const colores = desbloqueado
                ? coloresRareza[logro.rareza]
                : { bg: '#FAFAFA', border: '#F3F4F6', text: '#D1D5DB' }

              return (
                <div key={logro.id} style={{
                  background: colores.bg,
                  border: `1.5px solid ${colores.border}`,
                  borderRadius: '18px', padding: '16px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: '8px', textAlign: 'center',
                  position: 'relative', overflow: 'hidden',
                  boxShadow: desbloqueado
                    ? `0 4px 12px ${colores.border}66`
                    : '0 1px 4px rgba(0,0,0,0.04)',
                  transition: 'all 0.2s',
                  opacity: desbloqueado ? 1 : 0.5,
                  filter: desbloqueado ? 'none' : 'grayscale(80%)',
                }}>
                  {desbloqueado && (
                    <Circle 
                      size={10} 
                      fill={colores.text} 
                      color={colores.text} 
                      style={{ position: 'absolute', top: '10px', right: '10px', opacity: 0.8 }} 
                    />
                  )}

                  <div style={{
                    padding: '12px',
                    borderRadius: '14px',
                    background: desbloqueado ? 'white' : 'rgba(0,0,0,0.03)',
                    color: colores.text,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    animation: desbloqueado ? 'float 3s ease-in-out infinite' : 'none',
                    animationDelay: `${Math.random() * 2}s`,
                  }}>
                    {(() => {
                      const Icono = desbloqueado ? getLogroIcon(logro.icono) : Lock
                      return <Icono size={desbloqueado ? 32 : 24} strokeWidth={2.5} />
                    })()}
                  </div>

                  <p style={{
                    fontSize: '12px', fontWeight: '800',
                    color: desbloqueado ? '#111827' : '#D1D5DB',
                    lineHeight: '1.2',
                  }}>
                    {logro.nombre}
                  </p>

                  <p style={{
                    fontSize: '11px', color: desbloqueado ? '#9CA3AF' : '#E5E7EB',
                    lineHeight: '1.3',
                  }}>
                    {logro.descripcion}
                  </p>

                  {desbloqueado ? (
                    <span style={{
                      fontSize: '11px', fontWeight: '700',
                      color: colores.text, background: colores.border,
                      borderRadius: '6px', padding: '2px 8px',
                    }}>
                      +{logro.puntos} XP
                    </span>
                  ) : (
                    <span style={{
                      fontSize: '11px', color: '#D1D5DB', fontWeight: '600',
                    }}>
                      Bloqueado
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* ═══════════════════════════════════════ */}
      {/* TAB 3: RACHA */}
      {/* ═══════════════════════════════════════ */}
      {tabActiva === 'racha' && (
        <div style={{ padding: '16px' }}>
          <div style={{
            background: 'white', borderRadius: '20px', padding: '20px 16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '12px',
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#111827',
              marginBottom: '16px', textAlign: 'center' }}>
              Tu semana lectora
            </h3>
            <div style={{
              display: 'flex', gap: '8px', justifyContent: 'center',
            }}>
              {ultimos7.map((fecha, i) => {
                const tieneActividad = diasRacha.includes(fecha)
                const esHoy = fecha === new Date().toISOString().split('T')[0]
                const diasSemana = ['D', 'L', 'M', 'X', 'J', 'V', 'S']
                const diaSemana = diasSemana[new Date(fecha + 'T12:00:00').getDay()]
                return (
                  <div key={fecha} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                    flex: 1,
                  }}>
                    <span style={{ fontSize: '11px', fontWeight: '700',
                      color: esHoy ? '#4F46E5' : '#9CA3AF' }}>
                      {diaSemana}
                    </span>
                    <div style={{
                      width: '38px', height: '38px', borderRadius: '12px',
                      background: tieneActividad
                        ? 'linear-gradient(135deg, #F59E0B, #D97706)'
                        : esHoy
                          ? '#EEF2FF'
                          : '#F3F4F6',
                      border: esHoy && !tieneActividad ? '2px solid #4F46E5' : '2px solid transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '18px',
                      boxShadow: tieneActividad ? '0 4px 10px rgba(245,158,11,0.3)' : 'none',
                      transition: 'all 0.2s',
                    }}>
                      {tieneActividad ? <Flame size={20} color="white" strokeWidth={2.5} /> : esHoy ? <BookOpen size={20} color="#4F46E5" strokeWidth={2.5} /> : null}
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: '600',
                      color: tieneActividad ? '#D97706' : '#D1D5DB' }}>
                      {new Date(fecha + 'T12:00:00').getDate()}
                    </span>
                  </div>
                )
              })}
            </div>
            <div style={{ marginTop: '20px', textAlign: 'center', padding: '16px',
              background: '#FFFBEB', borderRadius: '14px', border: '1px solid #FEF3C7' }}>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#D97706' }}>
                {rachaActual === 0 ? "Hoy es un buen día para empezar tu racha" :
                 rachaActual <= 2 ? "¡Buen inicio! Sigue así" :
                 rachaActual <= 6 ? `¡Vas muy bien! Ya llevas ${rachaActual} días` :
                 rachaActual <= 13 ? "¡Una semana completa! Eres increíble" :
                 rachaActual <= 29 ? "¡Dos semanas de racha! No pares ahora" :
                 `¡LEYENDA LECTORA! ${rachaActual} días consecutivos`}
              </p>
            </div>
          </div>
        </div>
      )}
      {/* BOTÓN DE CERRAR SESIÓN */}
      <div style={{ padding: '24px 16px' }}>
        <BtnCerrarSesion variant="menuItem" />
      </div>
    </div>
  )
}
