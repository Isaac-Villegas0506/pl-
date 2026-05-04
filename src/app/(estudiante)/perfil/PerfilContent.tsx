'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { 
  Settings, Camera, Sprout, BookOpen, Flame, Zap, Star, Trophy, 
  Diamond, Book, PenTool, Target, BarChart3, Medal, Sparkles, 
  Shield, Sword, GraduationCap, Check, Calendar
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

export default function PerfilContent({
  usuario,
  stats,
  rachaActual,
  diasRacha,
}: Props) {
  const router = useRouter()
  
  const hoy = new Date()
  const ultimos7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(hoy)
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })

  const nivel = getInfoNivel(stats.total_puntos_logros)
  const xpPorcentaje = porcentajeNivel(stats.total_puntos_logros)

  return (
    <div style={{ background: '#FDFDFF', minHeight: '100vh', paddingBottom: '100px' }}>
      <div className="estudiante-container" style={{ padding: '32px 24px' }}>
        
        {/* HEADER SECTION */}
        <section style={{
          background: 'white', borderRadius: '32px', padding: '40px',
          border: '1.5px solid #F1F5F9', position: 'relative', overflow: 'hidden',
          boxShadow: '0 10px 40px rgba(0,0,0,0.02)', marginBottom: '32px',
          display: 'flex', flexDirection: 'column', alignItems: 'center'
        }}>
          {/* Settings Button */}
          <button 
            onClick={() => router.push('/perfil/configuracion')}
            style={{
              position: 'absolute', top: '24px', right: '24px',
              width: '44px', height: '44px', background: '#F8FAFC',
              border: '1.5px solid #F1F5F9', borderRadius: '14px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', zIndex: 20, color: '#64748B',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#F1F5F9')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#F8FAFC')}
          >
            <Settings size={20} />
          </button>

          {/* Decorative Blob */}
          <div style={{
            position: 'absolute', top: 0, right: 0, width: '256px', height: '256px',
            background: 'rgba(79, 70, 229, 0.05)', borderRadius: '50%',
            filter: 'blur(64px)', transform: 'translate(30%, -30%)', pointerEvents: 'none'
          }} />

          {/* Profile Picture */}
          <div 
            onClick={() => router.push('/perfil/editar')}
            style={{ position: 'relative', cursor: 'pointer', marginBottom: '24px', zIndex: 10 }}
          >
            <div style={{
              width: '128px', height: '128px', borderRadius: '50%', border: '4px solid white',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)', overflow: 'hidden', background: '#F1F5F9'
            }}>
              {usuario.avatar_url ? (
                <Image src={usuario.avatar_url} alt="" fill style={{ objectFit: 'cover' }} />
              ) : (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', fontWeight: 900, color: '#4F46E5' }}>
                  {usuario.nombre?.[0]}{usuario.apellido?.[0]}
                </div>
              )}
            </div>
            <div style={{
              position: 'absolute', bottom: '4px', right: '4px', background: 'white',
              border: '1.5px solid #F1F5F9', borderRadius: '50%', padding: '8px',
              color: '#4F46E5', boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
            }}>
              <Camera size={16} strokeWidth={2.5} />
            </div>
          </div>

          {/* User Info */}
          <div style={{ textAlign: 'center', marginBottom: '32px', zIndex: 10 }}>
            <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#0F172A', marginBottom: '8px' }}>
              {usuario.nombre} {usuario.apellido}
            </h2>
            <span style={{
              display: 'inline-block', padding: '6px 20px', background: '#EEF2FF',
              color: '#4F46E5', borderRadius: '99px', fontSize: '12px',
              fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em'
            }}>
              {nivel.nombre}
            </span>
          </div>

          {/* XP Progress */}
          <div style={{ width: '100%', maxWidth: '480px', zIndex: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
              <span style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>Progreso de nivel</span>
              <span style={{ fontSize: '16px', fontWeight: 900, color: '#4F46E5' }}>{xpPorcentaje.toFixed(0)}%</span>
            </div>
            <div style={{ height: '12px', background: '#F1F5F9', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{ 
                height: '100%', background: '#4F46E5', borderRadius: '99px',
                width: `${xpPorcentaje}%`, transition: 'width 1s' 
              }} />
            </div>
            <p style={{ textAlign: 'right', fontSize: '13px', color: '#94A3B8', marginTop: '8px', fontWeight: 600 }}>
              Faltan <span style={{ color: '#0F172A', fontWeight: 800 }}>{siguienteNivelXP(stats.total_puntos_logros)} XP</span> para el siguiente nivel
            </p>
          </div>
        </section>

        {/* STATISTICS GRID */}
        <section style={{
          display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px', marginBottom: '32px'
        }}>
          {[
            { label: 'Leídas', valor: stats.total_lecturas_completadas, Icon: Book, color: '#4F46E5' },
            { label: 'Evaluaciones', valor: stats.total_evaluaciones, Icon: PenTool, color: '#10B981' },
            { label: 'Promedio', valor: `${(stats.promedio_notas * 5).toFixed(0)}%`, Icon: Target, color: '#4F46E5' },
            { label: 'Racha', valor: `${rachaActual} días`, Icon: Flame, color: '#F97316', highlight: true },
          ].map((item, i) => (
            <div key={i} style={{
              background: 'white', borderRadius: '20px', padding: '16px',
              border: '1.5px solid #F1F5F9', boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
              position: 'relative', overflow: 'hidden'
            }}>
              {item.highlight && (
                <div style={{
                  position: 'absolute', top: 0, right: 0, width: '64px', height: '64px',
                  background: 'rgba(249, 115, 22, 0.1)', borderRadius: '50%',
                  filter: 'blur(24px)', transform: 'translate(40%, -40%)'
                }} />
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ 
                  padding: '8px', background: item.color + '15', borderRadius: '10px', color: item.color
                }}>
                  <item.Icon size={20} strokeWidth={2.5} />
                </div>
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#64748B' }}>{item.label}</h3>
              </div>
              <p style={{ fontSize: '24px', fontWeight: 900, color: '#0F172A' }}>{item.valor}</p>
            </div>
          ))}
        </section>

        {/* DETAILED CONTENT AREA */}
        <section style={{
          display: 'grid', gridTemplateColumns: '1fr',
          gap: '24px'
        }} className="perfil-detailed-grid">
          
          {/* Rendimiento Académico */}
          <div style={{
            background: 'white', borderRadius: '24px', padding: '20px',
            border: '1.5px solid #F1F5F9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
          }}>
            <h3 style={{ 
              fontSize: '18px', fontWeight: 900, color: '#0F172A', 
              display: 'flex', alignItems: 'center', gap: '12px',
              borderBottom: '1.5px solid #F8FAFC', paddingBottom: '20px', marginBottom: '24px'
            }}>
              <BarChart3 size={24} color="#4F46E5" strokeWidth={2.5} />
              Rendimiento Académico
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#0F172A', fontWeight: 600 }}>
                  <span>Promedio General</span>
                  <span style={{ fontWeight: 800 }}>{(stats.promedio_notas * 5).toFixed(0)}%</span>
                </div>
                <div style={{ height: '10px', background: '#F1F5F9', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: '#4F46E5', borderRadius: '99px', width: `${stats.promedio_notas * 5}%` }} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#0F172A', fontWeight: 600 }}>
                  <span>Calificación Máxima</span>
                  <span style={{ fontWeight: 800, color: '#10B981' }}>{(stats.mejor_nota * 5).toFixed(0)}%</span>
                </div>
                <div style={{ height: '10px', background: '#F1F5F9', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: '#10B981', borderRadius: '99px', width: `${stats.mejor_nota * 5}%` }} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#0F172A', fontWeight: 600 }}>
                  <span>Libros Completados vs Evaluaciones</span>
                  <span style={{ fontWeight: 800 }}>{stats.total_lecturas_completadas} / {stats.total_evaluaciones}</span>
                </div>
                <div style={{ height: '10px', background: '#F1F5F9', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{ 
                    height: '100%', background: '#EEF2FF', borderRadius: '99px', 
                    width: `${stats.total_evaluaciones > 0 ? (stats.total_lecturas_completadas / stats.total_evaluaciones) * 100 : 0}%` 
                  }} />
                </div>
              </div>
            </div>
          </div>

          {/* Racha Semanal */}
          <div style={{
            background: 'white', borderRadius: '32px', padding: '32px',
            border: '1.5px solid #F1F5F9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
            position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column'
          }}>
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%',
              background: 'linear-gradient(to top, rgba(249, 115, 22, 0.05), transparent)',
              pointerEvents: 'none'
            }} />
            
            <h3 style={{ 
              fontSize: '18px', fontWeight: 900, color: '#0F172A', 
              display: 'flex', alignItems: 'center', gap: '12px',
              borderBottom: '1.5px solid #F8FAFC', paddingBottom: '20px', marginBottom: '24px',
              position: 'relative', zIndex: 1
            }}>
              <Calendar size={24} color="#F97316" strokeWidth={2.5} />
              Racha Semanal
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '32px', position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', color: '#F97316' }}>
                <Flame size={48} strokeWidth={2.5} fill="#F97316" />
                <h4 style={{ fontSize: '48px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.04em' }}>{rachaActual}</h4>
                <span style={{ fontSize: '18px', color: '#64748B', fontWeight: 700 }}>días seguidos</span>
              </div>

              {/* Days Indicator */}
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '360px' }}>
                {ultimos7.map((fecha, i) => {
                  const tieneActividad = diasRacha.includes(fecha)
                  const esHoy = fecha === hoy.toISOString().split('T')[0]
                  const inicial = ['D', 'L', 'M', 'M', 'J', 'V', 'S'][new Date(fecha + 'T12:00:00').getDay()]
                  
                  return (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: esHoy ? '#F97316' : '#94A3B8' }}>{inicial}</span>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '50%',
                        background: tieneActividad ? '#F97316' : esHoy ? '#FFEDD5' : '#F1F5F9',
                        border: esHoy && !tieneActividad ? '2px solid #F97316' : 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: tieneActividad ? 'white' : '#94A3B8',
                        boxShadow: tieneActividad ? '0 4px 12px rgba(249,115,22,0.3)' : 'none'
                      }}>
                        {tieneActividad ? (
                          <Check size={16} strokeWidth={3} />
                        ) : esHoy ? (
                          <Flame size={16} strokeWidth={2.5} />
                        ) : null}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* CERRAR SESIÓN */}
        <div style={{ marginTop: '48px', display: 'flex', justifyContent: 'center' }}>
          <BtnCerrarSesion variant="menuItem" />
        </div>
      </div>
    </div>
  )
}
