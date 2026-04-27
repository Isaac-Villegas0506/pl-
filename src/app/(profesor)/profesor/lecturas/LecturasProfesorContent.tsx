'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Plus, MoreVertical, Search, BookOpen, Globe } from 'lucide-react'
import ProfesorTopBar from '@/components/layout/ProfesorTopBar'
import { obtenerGradientePortada } from '@/lib/utils'
import { archivarLecturaAction } from '../actions'
import type { LecturaConRelaciones } from '@/types/app.types'

interface LecturasProfesorContentProps {
  misLecturas: LecturaConRelaciones[]
  lecturasGlobales: LecturaConRelaciones[]
  profesorId: string
}

export default function LecturasProfesorContent({
  misLecturas,
  lecturasGlobales,
  profesorId,
}: LecturasProfesorContentProps) {
  const router = useRouter()
  const [tabActiva, setTabActiva] = useState<'mis_lecturas' | 'globales'>('mis_lecturas')
  const [searchQuery, setSearchQuery] = useState('')
  const [menuAbierto, setMenuAbierto] = useState<string | null>(null)

  const lista = tabActiva === 'mis_lecturas' ? misLecturas : lecturasGlobales
  const filtrada = lista.filter(l =>
    l.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.autor.toLowerCase().includes(searchQuery.toLowerCase())
  )

  async function handleArchivar(lecturaId: string) {
    if (!confirm('¿Archivar esta lectura?')) return
    await archivarLecturaAction(lecturaId, profesorId)
    setMenuAbierto(null)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F5F3FF' }}>
      <ProfesorTopBar title="Lecturas" />

      {/* Búsqueda */}
      <div style={{ padding: '12px 16px 0' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          background: 'white', borderRadius: '14px', padding: '0 14px',
          height: '46px', border: '1.5px solid #E5E7EB',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}>
          <Search size={16} color="#9CA3AF" strokeWidth={2} />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar lectura o autor..."
            style={{
              flex: 1, border: 'none', outline: 'none',
              fontSize: '14px', color: '#111827',
              background: 'transparent', fontFamily: 'inherit',
            }}
          />
        </div>
      </div>

      {/* TABS */}
      <div style={{
        display: 'flex', borderBottom: '1px solid #E5E7EB',
        padding: '0 16px', marginTop: '12px',
      }}>
        {([
          { key: 'mis_lecturas', label: `Mis lecturas (${misLecturas.length})` },
          { key: 'globales', label: `Globales (${lecturasGlobales.length})` },
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

      {/* LISTA */}
      <div style={{ padding: '12px 16px 100px' }}>
        {filtrada.length === 0 ? (
          <div style={{
            background: 'white', borderRadius: '16px', padding: '32px',
            textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}>
            <BookOpen size={32} color="#D1D5DB" style={{ margin: '0 auto 8px' }} />
            <p style={{ fontSize: '14px', color: '#9CA3AF' }}>
              {searchQuery ? 'Sin resultados.' : 'No hay lecturas aquí.'}
            </p>
          </div>
        ) : (
          filtrada.map((lectura) => (
            <div key={lectura.id} style={{
              background: 'white', borderRadius: '16px', padding: '14px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              marginBottom: '10px',
              display: 'flex', gap: '12px', alignItems: 'center',
              position: 'relative',
            }}>
              {/* Portada */}
              <div style={{
                width: '48px', height: '60px', borderRadius: '10px',
                overflow: 'hidden', flexShrink: 0,
                background: obtenerGradientePortada(lectura.id),
                position: 'relative',
              }}>
                {lectura.portada_url && (
                  <Image src={lectura.portada_url} alt="" fill style={{ objectFit: 'cover' }} />
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: '14px', fontWeight: 700, color: '#111827',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {lectura.titulo}
                </p>
                <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>
                  {lectura.autor}
                </p>
                <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                  {lectura.materias && (
                    <span style={{
                      fontSize: '10px', fontWeight: 700,
                      background: '#F3F4F6', color: '#6B7280',
                      borderRadius: '4px', padding: '2px 6px',
                    }}>
                      {lectura.materias.nombre}
                    </span>
                  )}
                  {lectura.es_global && (
                    <span style={{
                      fontSize: '10px', fontWeight: 700,
                      background: '#EEF2FF', color: '#4F46E5',
                      borderRadius: '4px', padding: '2px 6px',
                      display: 'flex', alignItems: 'center', gap: '3px',
                    }}>
                      <Globe size={9} /> Global
                    </span>
                  )}
                </div>
              </div>

              {/* Menú */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <button
                  onClick={(e) => { e.stopPropagation(); setMenuAbierto(menuAbierto === lectura.id ? null : lectura.id) }}
                  style={{
                    width: '32px', height: '32px', border: 'none',
                    background: 'transparent', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '8px',
                  }}
                >
                  <MoreVertical size={16} color="#9CA3AF" />
                </button>

                {menuAbierto === lectura.id && (
                  <div style={{
                    position: 'absolute', top: '36px', right: 0,
                    zIndex: 200, background: 'white',
                    borderRadius: '12px', padding: '4px 0',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    border: '1px solid #F3F4F6',
                    minWidth: '180px',
                  }}>
                    {[
                      { label: 'Asignar lectura', action: () => router.push(`/profesor/asignaciones/nueva?lectura_id=${lectura.id}`) },
                      { label: 'Ver resultados', action: () => router.push(`/profesor/resultados?lectura_id=${lectura.id}`) },
                    ].map(item => (
                      <button key={item.label} onClick={item.action} style={{
                        width: '100%', padding: '12px 16px',
                        background: 'none', border: 'none',
                        fontSize: '14px', color: '#374151',
                        textAlign: 'left', cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}>
                        {item.label}
                      </button>
                    ))}
                    {tabActiva === 'mis_lecturas' && <>
                      <div style={{ height: '1px', background: '#F3F4F6', margin: '4px 0' }} />
                      <button
                        onClick={() => handleArchivar(lectura.id)}
                        style={{
                          width: '100%', padding: '12px 16px',
                          background: 'none', border: 'none',
                          fontSize: '14px', color: '#F43F5E',
                          textAlign: 'left', cursor: 'pointer',
                          fontFamily: 'inherit',
                        }}
                      >
                        Archivar
                      </button>
                    </>}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => router.push('/profesor/lecturas/nueva')}
        style={{
          position: 'fixed', bottom: '80px', right: '20px',
          zIndex: 100, width: '56px', height: '56px',
          borderRadius: '50%', border: 'none',
          background: 'linear-gradient(135deg, #4F46E5, #6D28D9)',
          boxShadow: '0 6px 20px rgba(79,70,229,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        <Plus size={24} color="white" strokeWidth={2.5} />
      </button>

      {/* Overlay para cerrar menú */}
      {menuAbierto && (
        <div
          onClick={() => setMenuAbierto(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 150 }}
        />
      )}
    </div>
  )
}
