'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  ClipboardList, Users, Clock, CheckCircle2,
  Plus, CheckSquare,
} from 'lucide-react'
import { obtenerGradientePortada } from '@/lib/utils'
import type { UsuarioSesion } from '@/types/app.types'
import type { AsignacionResumen, LecturaTopStat } from '../types'

interface DashboardContentProps {
  profesor: UsuarioSesion
  stats: {
    asignacionesActivas: number
    totalEstudiantes: number
    pendientesRevision: number
    completadosMes: number
  }
  asignacionesRecientes: AsignacionResumen[]
  topLecturas: LecturaTopStat[]
}

const STAT_CONFIG = [
  {
    key: 'asignacionesActivas' as const,
    label: 'Asignaciones activas',
    Icon: ClipboardList,
    color: '#4F46E5',
    bg: '#EEF2FF',
  },
  {
    key: 'totalEstudiantes' as const,
    label: 'Estudiantes',
    Icon: Users,
    color: '#10B981',
    bg: '#D1FAE5',
  },
  {
    key: 'pendientesRevision' as const,
    label: 'Pendiente revisión',
    Icon: Clock,
    color: '#F59E0B',
    bg: '#FEF3C7',
  },
  {
    key: 'completadosMes' as const,
    label: 'Completados este mes',
    Icon: CheckCircle2,
    color: '#0EA5E9',
    bg: '#E0F2FE',
  },
]

export default function DashboardContent({
  profesor,
  stats,
  asignacionesRecientes,
}: DashboardContentProps) {
  const router = useRouter()

  return (
    <div style={{ minHeight: '100vh', background: '#F5F3FF' }}>

      {/* HEADER GRADIENTE */}
      <div style={{
        background: 'linear-gradient(135deg, #4F46E5 0%, #6D28D9 100%)',
        padding: '20px 20px 40px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '-40px', right: '-40px',
          width: '160px', height: '160px',
          background: 'rgba(255,255,255,0.08)', borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute', bottom: '-20px', left: '30px',
          width: '100px', height: '100px',
          background: 'rgba(255,255,255,0.05)', borderRadius: '50%',
        }} />
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', fontWeight: 500, position: 'relative' }}>
          Bienvenido de vuelta 👋
        </p>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'white', marginTop: '4px', position: 'relative' }}>
          {profesor.nombre} {profesor.apellido}
        </h1>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', marginTop: '2px', position: 'relative' }}>
          Panel del Profesor
        </p>
      </div>

      {/* GRID DE STATS */}
      <div style={{
        marginTop: '-20px',
        padding: '0 16px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '10px',
        position: 'relative', zIndex: 5,
      }}>
        {STAT_CONFIG.map(({ key, label, Icon, color, bg }) => (
          <div key={key} style={{
            background: 'white', borderRadius: '16px',
            padding: '16px', position: 'relative', overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}>
            <div style={{
              position: 'absolute', top: '-10px', right: '-10px',
              width: '60px', height: '60px',
              background: bg, borderRadius: '50%', opacity: 0.5,
            }} />
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: bg, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon size={18} color={color} strokeWidth={2} />
            </div>
            <p style={{ fontSize: '28px', fontWeight: 800, color: '#111827', marginTop: '10px', lineHeight: 1 }}>
              {stats[key]}
            </p>
            <p style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 500, marginTop: '4px' }}>
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* ASIGNACIONES RECIENTES */}
      <div style={{ marginTop: '28px', padding: '0 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <p style={{ fontSize: '16px', fontWeight: 800, color: '#111827' }}>
            Asignaciones activas
          </p>
          <button
            onClick={() => router.push('/profesor/asignaciones')}
            style={{ background: 'none', border: 'none', fontSize: '13px', color: '#4F46E5', fontWeight: 700, cursor: 'pointer' }}
          >
            Ver todas
          </button>
        </div>

        {asignacionesRecientes.length === 0 ? (
          <div style={{
            background: 'white', borderRadius: '16px', padding: '24px',
            textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}>
            <p style={{ fontSize: '14px', color: '#9CA3AF' }}>No hay asignaciones activas.</p>
          </div>
        ) : (
          asignacionesRecientes.map((asig) => (
            <div key={asig.id} style={{
              background: 'white', borderRadius: '16px', padding: '14px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              marginBottom: '10px',
              display: 'flex', gap: '12px', alignItems: 'center',
            }}>
              <div style={{
                width: '48px', height: '60px', borderRadius: '10px',
                overflow: 'hidden', flexShrink: 0,
                background: obtenerGradientePortada(asig.lectura_id),
                position: 'relative',
              }}>
                {asig.portada_url && (
                  <Image src={asig.portada_url} alt="" fill style={{ objectFit: 'cover' }} />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: '14px', fontWeight: 700, color: '#111827',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {asig.titulo}
                </p>
                <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>
                  {asig.grado_nombre} {asig.aula_nombre} · {asig.completados}/{asig.total_estudiantes} completados
                </p>
                <div style={{ height: '4px', background: '#F3F4F6', borderRadius: '99px', marginTop: '8px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: '99px',
                    background: 'linear-gradient(90deg, #4F46E5, #6D28D9)',
                    width: `${asig.porcentaje}%`, transition: 'width 0.6s ease',
                  }} />
                </div>
              </div>
              <div style={{
                flexShrink: 0, background: '#EEF2FF',
                borderRadius: '8px', padding: '4px 8px',
                fontSize: '11px', fontWeight: 700, color: '#4F46E5',
              }}>
                {asig.completados}/{asig.total_estudiantes}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ACCIONES RÁPIDAS */}
      <div style={{ marginTop: '24px', padding: '0 16px 16px' }}>
        <p style={{ fontSize: '16px', fontWeight: 800, color: '#111827', marginBottom: '12px' }}>
          Acciones rápidas
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {/* Nueva asignación */}
          <button
            onClick={() => router.push('/profesor/asignaciones/nueva')}
            style={{
              background: 'linear-gradient(135deg, #4F46E5, #6D28D9)',
              border: 'none', borderRadius: '16px', padding: '20px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(79,70,229,0.35)',
              fontFamily: 'inherit',
            }}
          >
            <div style={{
              width: '44px', height: '44px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Plus size={24} color="white" strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'white' }}>
              Nueva asignación
            </span>
          </button>

          {/* Revisar evaluaciones */}
          <button
            onClick={() => router.push('/profesor/resultados?filtro=pendientes')}
            style={{
              background: 'white', border: '1.5px solid #E5E7EB',
              borderRadius: '16px', padding: '20px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
              cursor: 'pointer', position: 'relative',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              fontFamily: 'inherit',
            }}
          >
            {stats.pendientesRevision > 0 && (
              <div style={{
                position: 'absolute', top: '8px', right: '8px',
                width: '20px', height: '20px',
                background: '#F43F5E', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: 700, color: 'white',
              }}>
                {stats.pendientesRevision}
              </div>
            )}
            <div style={{
              width: '44px', height: '44px', borderRadius: '50%',
              background: '#EEF2FF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <CheckSquare size={24} color="#4F46E5" strokeWidth={2} />
            </div>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>
              Revisar eval.
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
