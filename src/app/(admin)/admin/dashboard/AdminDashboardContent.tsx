'use client'

import { useRouter } from 'next/navigation'
import {
  Shield, Users, BookOpen, ClipboardList, TrendingUp,
  Clock, AlertTriangle, UserPlus, BarChart3, Settings,
  Minus, ChevronRight
} from 'lucide-react'
import { formatFecha, tiempoRelativo } from '@/lib/utils'
import type { UsuarioSesion } from '@/types/app.types'
import type { ActividadReciente } from '../types'
import BtnCerrarSesion from '@/components/ui/BtnCerrarSesion'

interface Props {
  admin: UsuarioSesion
  stats: {
    totalUsuarios: number
    totalAdmins: number
    totalProfesores: number
    totalEstudiantes: number
    totalLecturas: number
    lecturasPublicadas: number
    asignacionesActivas: number
    completadosMes: number
    pendientesRevision: number
    usuariosNuevosMes: number
  }
  actividadReciente: ActividadReciente[]
}

export default function AdminDashboardContent({ admin, stats, actividadReciente }: Props) {
  const router = useRouter()

  const metrics = [
    {
      label: 'Total Usuarios', value: stats.totalUsuarios,
      Icon: Users, iconBg: '#E6DEFF', iconColor: '#4F46E5',
      sub: `+${stats.usuariosNuevosMes} este mes`, subColor: '#006B5F', trending: true,
    },
    {
      label: 'Lecturas Publicadas', value: stats.lecturasPublicadas,
      Icon: BookOpen, iconBg: '#62FAE3', iconColor: '#00201C',
      sub: `+${stats.totalLecturas - stats.lecturasPublicadas} borradores`, subColor: '#006B5F', trending: true,
    },
    {
      label: 'Asignaciones Activas', value: stats.asignacionesActivas,
      Icon: ClipboardList, iconBg: '#FFDADC', iconColor: '#400010',
      sub: 'Estable', subColor: '#484555', trending: false,
    },
    {
      label: 'Completados este mes', value: stats.completadosMes,
      Icon: TrendingUp, iconBg: '#7858F5', iconColor: '#FFFFFF',
      sub: stats.completadosMes > 0 ? `+${((stats.completadosMes / Math.max(stats.asignacionesActivas, 1)) * 100).toFixed(1)}%` : '0%',
      subColor: '#006B5F', trending: stats.completadosMes > 0,
    },
  ]

  const quickActions = [
    { label: 'Nuevo Usuario', Icon: UserPlus, bg: '#5E3BDB', color: '#FFFFFF', href: '/admin/usuarios/nuevo' },
    { label: 'Nueva Lectura', Icon: BookOpen, bg: '#006B5F', color: '#FFFFFF', href: '/admin/contenido' },
    { label: 'Ver Reportes', Icon: BarChart3, bg: '#A63047', color: '#FFFFFF', href: '/admin/reportes' },
    { label: 'Configuración', Icon: Settings, bg: '#F7F9FB', color: '#191C1E', href: '/admin/configuracion', border: true },
  ]

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 16px 32px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

      {/* HEADER */}
      <section>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(129,140,248,0.12)', border: '1px solid rgba(129,140,248,0.25)', borderRadius: '99px', padding: '4px 14px', marginBottom: '12px' }}>
          <Shield size={12} color="#5E3BDB" />
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#5E3BDB', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Administrador</span>
        </div>
        <h1 style={{ fontSize: '30px', fontWeight: 700, color: '#191C1E', lineHeight: '38px' }}>
          Resumen del Sistema
        </h1>
        <p style={{ fontSize: '16px', color: '#484555', marginTop: '4px', lineHeight: '24px' }}>
          Monitoreo general de la plataforma · {formatFecha(new Date())}
        </p>
      </section>

      {/* METRICS GRID */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
        {metrics.map((m, i) => (
          <div key={i} style={{
            background: 'white', borderRadius: '12px', border: '1px solid #C9C4D7',
            padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            transition: 'transform 0.3s', cursor: 'default',
          }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-4px)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#484555', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{m.label}</span>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: m.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <m.Icon size={20} color={m.iconColor} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: '30px', fontWeight: 700, color: '#191C1E', lineHeight: '38px' }}>
                {m.value.toLocaleString()}
              </div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: m.subColor, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {m.trending ? <TrendingUp size={14} /> : <Minus size={14} />}
                {m.sub}
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* ALERTA PENDIENTES */}
      {stats.pendientesRevision > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
          border: '1px solid #FCD34D', borderRadius: '12px', padding: '16px 20px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Clock size={22} color="#D97706" />
            <div>
              <p style={{ fontSize: '14px', fontWeight: 700, color: '#92400E' }}>
                {stats.pendientesRevision} evaluaciones pendientes
              </p>
              <p style={{ fontSize: '12px', color: '#B45309', marginTop: '2px' }}>
                Llevan más de 3 días sin revisar
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push('/profesor/resultados')}
            style={{
              fontSize: '12px', fontWeight: 700, color: '#92400E',
              background: 'rgba(146,64,14,0.12)', border: 'none',
              borderRadius: '99px', padding: '8px 16px', cursor: 'pointer',
            }}
          >
            Revisar
          </button>
        </div>
      )}

      {/* MAIN CONTENT: Activity + Quick Actions */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }} className="admin-dashboard-grid">
        
        {/* Actividad Reciente */}
        <div style={{
          background: 'white', borderRadius: '12px', border: '1px solid #C9C4D7',
          padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E0E3E5', paddingBottom: '12px', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#191C1E' }}>Actividad Reciente</h2>
            <button onClick={() => router.push('/admin/usuarios')} style={{ fontSize: '12px', fontWeight: 600, color: '#5E3BDB', background: 'none', border: 'none', cursor: 'pointer' }}>Ver todo</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {actividadReciente.length === 0 ? (
              <p style={{ padding: '20px 0', fontSize: '14px', color: '#797586', textAlign: 'center' }}>Sin actividad reciente</p>
            ) : actividadReciente.map((item, idx) => (
              <div key={item.id + idx} style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                padding: '12px', borderRadius: '8px',
                cursor: 'pointer', transition: 'background 0.15s',
              }}
                onMouseEnter={e => (e.currentTarget.style.background = '#F2F4F6')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{
                  width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0,
                  background: item.tipo === 'usuario' ? '#62FAE3' : '#E6DEFF',
                  border: '1px solid #C9C4D7',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {item.tipo === 'usuario'
                    ? <UserPlus size={20} color="#005047" />
                    : <BookOpen size={20} color="#481BC6" />
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '14px', color: '#191C1E', fontWeight: 500 }}>
                    {item.descripcion}
                  </p>
                  <p style={{ fontSize: '12px', color: '#484555', marginTop: '4px', fontWeight: 600 }}>
                    {tiempoRelativo(item.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div style={{
          background: '#F2F4F6', borderRadius: '12px', border: '1px solid #E0E3E5',
          padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#191C1E', borderBottom: '1px solid #E0E3E5', paddingBottom: '12px', marginBottom: '16px' }}>Acciones Rápidas</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {quickActions.map(a => (
              <button
                key={a.href}
                onClick={() => router.push(a.href)}
                style={{
                  width: '100%', background: a.bg, color: a.color,
                  borderRadius: '99px', padding: '16px 24px',
                  border: a.border ? '1px solid #797586' : 'none',
                  cursor: 'pointer', display: 'flex', justifyContent: 'flex-start',
                  alignItems: 'center', gap: '12px',
                  fontSize: '12px', fontWeight: 600, letterSpacing: '0.02em',
                  transition: 'all 0.2s', fontFamily: 'inherit',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(0.98)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <a.Icon size={18} />
                {a.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Sistema alerts */}
      {stats.pendientesRevision > 5 && (
        <div style={{
          background: '#FFDAD6', border: '1px solid #F43F5E',
          borderRadius: '12px', padding: '16px 20px',
          display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          <AlertTriangle size={22} color="#93000A" />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#93000A' }}>
              {stats.pendientesRevision} alertas activas
            </p>
            <p style={{ fontSize: '12px', color: '#BA1A1A', marginTop: '2px' }}>
              Hay evaluaciones con revisión pendiente urgente
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
