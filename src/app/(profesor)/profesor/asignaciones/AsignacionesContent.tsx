'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ChevronDown, Plus, Calendar } from 'lucide-react'
import ProfesorTopBar from '@/components/layout/ProfesorTopBar'
import ProgressBar from '@/components/ui/ProgressBar'
import { obtenerGradientePortada } from '@/lib/utils'
import { cerrarAsignacionAction } from '../actions'
import type { AsignacionResumen } from '../types'

interface Props {
  activas: AsignacionResumen[]
  cerradas: AsignacionResumen[]
  profesorId: string
}

export default function AsignacionesContent({ activas, cerradas, profesorId: _ }: Props) {
  const router = useRouter()
  const [tabActiva, setTabActiva] = useState<'activas' | 'cerradas'>('activas')
  const [expandida, setExpandida] = useState<string | null>(null)

  const lista = tabActiva === 'activas' ? activas : cerradas

  async function handleCerrar(id: string) {
    if (!confirm('¿Cerrar esta asignación?')) return
    await cerrarAsignacionAction(id)
    router.refresh()
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F5F3FF' }}>
      <ProfesorTopBar title="Asignaciones" />

      {/* TABS */}
      <div style={{ display: 'flex', borderBottom: '1px solid #E5E7EB', padding: '0 16px' }}>
        {([
          { key: 'activas', label: `Activas (${activas.length})` },
          { key: 'cerradas', label: `Cerradas (${cerradas.length})` },
        ] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => setTabActiva(tab.key)}
            style={{
              flex: 1, height: '40px', border: 'none',
              background: 'transparent', cursor: 'pointer',
              fontSize: '13px', fontWeight: 700,
              color: tabActiva === tab.key ? '#4F46E5' : '#9CA3AF',
              borderBottom: tabActiva === tab.key ? '2px solid #4F46E5' : '2px solid transparent',
              transition: 'all 0.2s', fontFamily: 'inherit',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ padding: '12px 16px 100px' }}>
        {lista.length === 0 && (
          <div style={{ background: 'white', borderRadius: '16px', padding: '32px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '12px' }}>
            <p style={{ fontSize: '14px', color: '#9CA3AF' }}>No hay asignaciones {tabActiva}.</p>
          </div>
        )}

        {lista.map(asig => {
          const abierta = expandida === asig.id
          const progreso = asig.total_estudiantes > 0 ? (asig.completados / asig.total_estudiantes) * 100 : 0

          return (
            <div key={asig.id} style={{
              background: 'white', borderRadius: '18px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              marginBottom: '10px', overflow: 'hidden',
            }}>
              {/* CABECERA clickeable */}
              <div
                onClick={() => setExpandida(abierta ? null : asig.id)}
                style={{ padding: '14px', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{
                    width: '44px', height: '56px', borderRadius: '10px',
                    overflow: 'hidden', flexShrink: 0,
                    background: obtenerGradientePortada(asig.lectura_id),
                    position: 'relative',
                  }}>
                    {asig.portada_url && (
                      <Image src={asig.portada_url} alt="" fill style={{ objectFit: 'cover' }} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {asig.titulo}
                    </p>
                    <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>
                      {asig.grado_nombre} {asig.aula_nombre}
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                    <span style={{
                      background: asig.estado === 'activo' ? '#ECFDF5' : '#F3F4F6',
                      color: asig.estado === 'activo' ? '#065F46' : '#6B7280',
                      fontSize: '11px', fontWeight: 700, borderRadius: '6px', padding: '3px 8px',
                    }}>
                      {asig.estado === 'activo' ? 'Activa' : 'Cerrada'}
                    </span>
                    <ChevronDown size={16} color="#9CA3AF" style={{ transform: abierta ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
                  </div>
                </div>

                <div style={{ marginTop: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px', color: '#9CA3AF' }}>Progreso del grupo</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#4F46E5' }}>
                      {asig.completados}/{asig.total_estudiantes || '?'} completados
                    </span>
                  </div>
                  <ProgressBar value={progreso} size="sm" color="primary" />
                </div>
              </div>

              {/* CONTENIDO EXPANDIBLE */}
              <div style={{
                maxHeight: abierta ? '300px' : '0px',
                overflow: 'hidden',
                transition: 'max-height 0.35s cubic-bezier(0.16,1,0.3,1)',
              }}>
                <div style={{ padding: '0 14px 14px', borderTop: '1px solid #F3F4F6' }}>
                  {asig.fecha_limite && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                      <Calendar size={14} color="#9CA3AF" />
                      <span style={{ fontSize: '12px', color: '#6B7280' }}>
                        Fecha límite: {new Date(asig.fecha_limite).toLocaleDateString('es', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                    <button
                      onClick={() => router.push(`/profesor/resultados?asignacion=${asig.id}`)}
                      style={{ height: '40px', border: '1.5px solid #4F46E5', borderRadius: '10px', background: '#EEF2FF', fontSize: '13px', fontWeight: 700, color: '#4F46E5', cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                      Ver resultados
                    </button>
                    {asig.estado === 'activo' && (
                      <button
                        onClick={() => handleCerrar(asig.id)}
                        style={{ height: '40px', border: '1.5px solid #FDA4AF', borderRadius: '10px', background: '#FFF1F2', fontSize: '13px', fontWeight: 700, color: '#F43F5E', cursor: 'pointer', fontFamily: 'inherit' }}
                      >
                        Cerrar asignación
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {/* Botón nueva asignación estilo dashed */}
        {tabActiva === 'activas' && (
          <button
            onClick={() => router.push('/profesor/asignaciones/nueva')}
            style={{
              width: '100%', border: '2px dashed #C7D2FE',
              background: '#F5F3FF', borderRadius: '16px', padding: '20px',
              display: 'flex', alignItems: 'center', gap: '12px',
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Plus size={20} color="#4F46E5" strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#4F46E5' }}>Nueva asignación</span>
          </button>
        )}
      </div>
    </div>
  )
}
