'use client'

import { useRouter } from 'next/navigation'
import {
  Shield, Users, BookOpen, ClipboardList, TrendingUp,
  Clock, AlertTriangle, UserPlus, BarChart3, Settings,
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

function StatCard({
  icon: Icon,
  iconColor,
  iconBg,
  label,
  value,
  sub,
}: {
  icon: React.ElementType
  iconColor: string
  iconBg: string
  label: string
  value: number
  sub?: string
}) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '18px',
      padding: '16px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      border: '1px solid rgba(0,0,0,0.04)',
    }}>
      <div style={{
        width: '36px', height: '36px', borderRadius: '10px',
        background: iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '10px',
      }}>
        <Icon size={18} color={iconColor} strokeWidth={2} />
      </div>
      <p style={{ fontSize: '26px', fontWeight: '800', color: '#111827', lineHeight: 1 }}>
        {value.toLocaleString()}
      </p>
      <p style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280', marginTop: '4px' }}>
        {label}
      </p>
      {sub && (
        <p style={{ fontSize: '11px', color: '#10B981', fontWeight: '600', marginTop: '3px' }}>
          {sub}
        </p>
      )}
    </div>
  )
}

export default function AdminDashboardContent({ admin, stats, actividadReciente }: Props) {
  const router = useRouter()

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>

      {/* HERO HEADER */}
      <div style={{
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 60%, #334155 100%)',
        padding: '28px 20px 44px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: 'radial-gradient(circle, rgba(129,140,248,0.15) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />
        <div style={{
          position: 'absolute', top: '-60px', right: '-60px', zIndex: 0,
          width: '200px', height: '200px',
          background: 'rgba(79,70,229,0.25)',
          borderRadius: '50%', filter: 'blur(40px)',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'rgba(129,140,248,0.15)',
            border: '1px solid rgba(129,140,248,0.3)',
            borderRadius: '99px', padding: '4px 12px',
            fontSize: '11px', fontWeight: '700',
            color: '#818CF8', letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>
            <Shield size={11} color="#818CF8" />
            Panel de Administrador
          </span>
          <h1 style={{
            fontSize: '24px', fontWeight: '800', color: 'white',
            marginTop: '10px', lineHeight: '1.2',
          }}>
            {admin.nombre} {admin.apellido}
          </h1>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
            {formatFecha(new Date())} · Bienvenido al sistema
          </p>
        </div>
      </div>

      {/* STATS GRID */}
      <div style={{ padding: '0 16px', marginTop: '-24px', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <StatCard
            icon={Users} iconColor="#4F46E5" iconBg="#EEF2FF"
            label="Total usuarios" value={stats.totalUsuarios}
            sub={`+${stats.usuariosNuevosMes} este mes`}
          />
          <StatCard
            icon={BookOpen} iconColor="#10B981" iconBg="#D1FAE5"
            label="Lecturas publicadas" value={stats.lecturasPublicadas}
            sub={`de ${stats.totalLecturas} totales`}
          />
          <StatCard
            icon={ClipboardList} iconColor="#0EA5E9" iconBg="#E0F2FE"
            label="Asignaciones activas" value={stats.asignacionesActivas}
          />
          <StatCard
            icon={TrendingUp} iconColor="#8B5CF6" iconBg="#F5F3FF"
            label="Completados este mes" value={stats.completadosMes}
          />
        </div>

        {/* ALERTA PENDIENTES */}
        {stats.pendientesRevision > 0 && (
          <div style={{
            marginTop: '10px',
            background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
            border: '1px solid #FCD34D',
            borderRadius: '16px', padding: '14px 16px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Clock size={20} color="#D97706" />
              <div>
                <p style={{ fontSize: '13px', fontWeight: '700', color: '#92400E' }}>
                  Evaluaciones pendientes
                </p>
                <p style={{ fontSize: '11px', color: '#B45309', marginTop: '1px' }}>
                  Llevan más de 3 días sin revisar
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
              <span style={{ fontSize: '24px', fontWeight: '800', color: '#92400E' }}>
                {stats.pendientesRevision}
              </span>
              <button
                onClick={() => router.push('/profesor/resultados')}
                style={{
                  fontSize: '11px', fontWeight: '700', color: '#92400E',
                  background: 'rgba(146,64,14,0.12)', border: 'none',
                  borderRadius: '8px', padding: '4px 10px', cursor: 'pointer',
                }}
              >
                Revisar
              </button>
            </div>
          </div>
        )}

        {/* DISTRIBUCIÓN DE USUARIOS */}
        <div style={{ marginTop: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#111827' }}>
              Usuarios del sistema
            </h2>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { label: 'estudiantes', value: stats.totalEstudiantes, bg: '#D1FAE5', color: '#065F46' },
              { label: 'profesores', value: stats.totalProfesores, bg: '#EEF2FF', color: '#4F46E5' },
              { label: 'admins', value: stats.totalAdmins, bg: '#0F172A', color: 'white' },
            ].map(chip => (
              <div key={chip.label} style={{
                flex: 1, height: '64px', borderRadius: '14px',
                background: chip.bg,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: '2px',
              }}>
                <span style={{ fontSize: '22px', fontWeight: '800', color: chip.color }}>
                  {chip.value}
                </span>
                <span style={{ fontSize: '10px', fontWeight: '700', color: chip.color, opacity: 0.8 }}>
                  {chip.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ACTIVIDAD RECIENTE */}
        <div style={{ marginTop: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#111827', marginBottom: '12px' }}>
            Actividad reciente
          </h2>
          <div style={{
            background: 'white', borderRadius: '18px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
            border: '1px solid rgba(0,0,0,0.04)',
            overflow: 'hidden',
          }}>
            {actividadReciente.length === 0 ? (
              <p style={{ padding: '20px 16px', fontSize: '13px', color: '#9CA3AF', textAlign: 'center' }}>
                Sin actividad reciente
              </p>
            ) : actividadReciente.map((item, idx) => (
              <div key={item.id + idx} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 16px',
                borderBottom: idx < actividadReciente.length - 1 ? '1px solid #F9FAFB' : 'none',
              }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: item.tipo === 'usuario' ? '#EEF2FF' : '#F0FDF4',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  {item.tipo === 'usuario'
                    ? <UserPlus size={14} color="#4F46E5" />
                    : <BookOpen size={14} color="#10B981" />
                  }
                </div>
                <p style={{ flex: 1, fontSize: '13px', fontWeight: '600', color: '#374151' }}>
                  {item.descripcion}
                </p>
                <span style={{ fontSize: '11px', color: '#9CA3AF', flexShrink: 0 }}>
                  {tiempoRelativo(item.created_at)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ACCIONES RÁPIDAS */}
        <div style={{ marginTop: '24px', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#111827', marginBottom: '12px' }}>
            Acciones rápidas
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {[
              {
                label: 'Nuevo usuario', icon: UserPlus,
                bg: 'linear-gradient(135deg, #4F46E5, #6D28D9)',
                color: 'white', href: '/admin/usuarios/nuevo',
              },
              {
                label: 'Nueva lectura', icon: BookOpen,
                bg: 'linear-gradient(135deg, #0F172A, #1E293B)',
                color: 'white', href: '/admin/contenido',
              },
              {
                label: 'Ver reportes', icon: BarChart3,
                bg: 'linear-gradient(135deg, #10B981, #059669)',
                color: 'white', href: '/admin/reportes',
              },
              {
                label: 'Configuración', icon: Settings,
                bg: 'linear-gradient(135deg, #64748B, #475569)',
                color: 'white', href: '/admin/configuracion',
              },
            ].map(action => (
              <button
                key={action.href}
                onClick={() => router.push(action.href)}
                style={{
                  background: action.bg, borderRadius: '16px',
                  padding: '16px', border: 'none', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                }}
              >
                <action.icon size={20} color={action.color} />
                <span style={{ fontSize: '13px', fontWeight: '700', color: action.color }}>
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Alerta de sistema si hay datos problemáticos */}
        {stats.pendientesRevision > 5 && (
          <div style={{
            marginTop: '10px',
            background: '#FFF1F2', border: '1px solid #FDA4AF',
            borderRadius: '16px', padding: '14px 16px',
            display: 'flex', alignItems: 'center', gap: '12px',
          }}>
            <AlertTriangle size={20} color="#F43F5E" />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '13px', fontWeight: '700', color: '#BE123C' }}>
                {stats.pendientesRevision} alertas activas
              </p>
              <p style={{ fontSize: '11px', color: '#E11D48', marginTop: '2px' }}>
                Hay evaluaciones con revisión pendiente urgente
              </p>
            </div>
          </div>
        )}

        {/* LOGOUT */}
        <div style={{ marginTop: '24px', paddingBottom: '32px' }}>
          <BtnCerrarSesion variant="menuItem" />
        </div>
      </div>
    </div>
  )
}
