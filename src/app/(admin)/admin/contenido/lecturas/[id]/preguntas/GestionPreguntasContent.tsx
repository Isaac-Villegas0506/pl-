'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import AdminTopBar from '@/components/layout/AdminTopBar'
import ModalPregunta from '@/components/admin/ModalPregunta'
import { eliminarPreguntaAction, reordenarPreguntasAction } from '@/app/(admin)/admin/actions'
import type { PreguntaConOpciones } from '@/types/app.types'

const TIPO_LABEL: Record<string, { label: string; bg: string; color: string }> = {
  opcion_multiple: { label: 'Opción múltiple', bg: '#EEF2FF', color: '#4F46E5' },
  verdadero_falso: { label: 'V o F',           bg: '#FEF3C7', color: '#D97706' },
  abierta:         { label: 'Abierta',          bg: '#F0FDF4', color: '#10B981' },
}

interface Props {
  lectura: { id: string; titulo: string }
  preguntas: PreguntaConOpciones[]
}

export default function GestionPreguntasContent({ lectura, preguntas: preguntasIniciales }: Props) {
  const [preguntas, setPreguntas] = useState(preguntasIniciales)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [preguntaEditando, setPreguntaEditando] = useState<PreguntaConOpciones | null>(null)
  const [ordenCambiado, setOrdenCambiado] = useState(false)
  const [guardandoOrden, setGuardandoOrden] = useState(false)

  const totalPuntaje = preguntas.reduce((sum, p) => sum + p.puntaje, 0)

  function mover(idx: number, dir: -1 | 1) {
    const nuevas = [...preguntas]
    const target = idx + dir
    if (target < 0 || target >= nuevas.length) return
    ;[nuevas[idx], nuevas[target]] = [nuevas[target], nuevas[idx]]
    setPreguntas(nuevas.map((p, i) => ({ ...p, orden: i + 1 })))
    setOrdenCambiado(true)
  }

  async function handleEliminar(id: string) {
    if (!confirm('¿Eliminar esta pregunta?')) return
    await eliminarPreguntaAction(id)
    setPreguntas(prev => prev.filter(p => p.id !== id).map((p, i) => ({ ...p, orden: i + 1 })))
    setOrdenCambiado(true)
  }

  async function guardarOrden() {
    setGuardandoOrden(true)
    await reordenarPreguntasAction(preguntas.map(p => ({ id: p.id, orden: p.orden })))
    setOrdenCambiado(false)
    setGuardandoOrden(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>
      <AdminTopBar title="Preguntas" subtitle={lectura.titulo} showBack />

      <div style={{ display: 'flex', gap: '8px', padding: '12px 16px 4px' }}>
        {[
          { label: 'Total', value: String(preguntas.length) },
          { label: 'Puntaje', value: `${totalPuntaje} pts` },
          { label: 'Tipos', value: String(new Set(preguntas.map(p => p.tipo)).size) },
        ].map(chip => (
          <div key={chip.label} style={{
            flex: 1, background: 'white', borderRadius: '12px', padding: '10px',
            textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          }}>
            <p style={{ fontSize: '18px', fontWeight: '800', color: '#111827' }}>{chip.value}</p>
            <p style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '600' }}>{chip.label}</p>
          </div>
        ))}
      </div>

      <div style={{ padding: '12px 16px' }}>
        {preguntas.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF', fontSize: '14px' }}>
            Sin preguntas. Usa el botón + para agregar la primera.
          </div>
        )}
        {preguntas.map((pregunta, idx) => {
          const tipoC = TIPO_LABEL[pregunta.tipo] ?? TIPO_LABEL.abierta
          return (
            <div key={pregunta.id} style={{
              background: 'white', borderRadius: '16px', padding: '14px',
              marginBottom: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              border: '1px solid rgba(0,0,0,0.03)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '10px', fontWeight: '800', color: '#4F46E5', background: '#EEF2FF', borderRadius: '6px', padding: '2px 8px' }}>
                    #{pregunta.orden}
                  </span>
                  <span style={{ fontSize: '10px', fontWeight: '700', background: tipoC.bg, color: tipoC.color, borderRadius: '6px', padding: '2px 8px' }}>
                    {tipoC.label}
                  </span>
                </div>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#4F46E5' }}>{pregunta.puntaje} pts</span>
              </div>

              <p style={{ fontSize: '14px', fontWeight: '600', color: '#111827', marginTop: '8px', lineHeight: '1.4', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {pregunta.enunciado}
              </p>

              {pregunta.tipo !== 'abierta' && pregunta.opciones.length > 0 && (
                <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {pregunta.opciones.map(op => (
                    <span key={op.id} style={{ fontSize: '11px', fontWeight: '600', color: op.es_correcta ? '#065F46' : '#6B7280', background: op.es_correcta ? '#D1FAE5' : '#F3F4F6', borderRadius: '6px', padding: '2px 8px' }}>
                      {op.es_correcta && '✓ '}{op.texto}
                    </span>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button onClick={() => { setPreguntaEditando(pregunta); setModalAbierto(true) }} style={{ flex: 1, height: '34px', borderRadius: '10px', background: '#F5F3FF', border: '1px solid #C7D2FE', color: '#4F46E5', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <Pencil size={12} /> Editar
                </button>
                <button onClick={() => handleEliminar(pregunta.id)} style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#FFF1F2', border: '1px solid #FDA4AF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Trash2 size={14} color="#F43F5E" />
                </button>
                <button onClick={() => mover(idx, -1)} disabled={idx === 0} style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#F9FAFB', border: '1px solid #E5E7EB', cursor: idx === 0 ? 'default' : 'pointer', opacity: idx === 0 ? 0.3 : 1, fontWeight: '700', color: '#6B7280', fontSize: '14px' }}>↑</button>
                <button onClick={() => mover(idx, 1)} disabled={idx === preguntas.length - 1} style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#F9FAFB', border: '1px solid #E5E7EB', cursor: idx === preguntas.length - 1 ? 'default' : 'pointer', opacity: idx === preguntas.length - 1 ? 0.3 : 1, fontWeight: '700', color: '#6B7280', fontSize: '14px' }}>↓</button>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ position: 'fixed', bottom: '80px', right: '20px', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
        {ordenCambiado && (
          <button onClick={guardarOrden} disabled={guardandoOrden} style={{ height: '40px', padding: '0 20px', borderRadius: '99px', background: 'white', border: '2px solid #4F46E5', color: '#4F46E5', fontSize: '13px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(79,70,229,0.2)' }}>
            {guardandoOrden ? 'Guardando...' : 'Guardar orden'}
          </button>
        )}
        <button onClick={() => { setPreguntaEditando(null); setModalAbierto(true) }} style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #4F46E5, #6D28D9)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(79,70,229,0.4)' }}>
          <Plus size={24} color="white" strokeWidth={2.5} />
        </button>
      </div>

      {modalAbierto && (
        <ModalPregunta
          isOpen={modalAbierto}
          onClose={() => { setModalAbierto(false); setPreguntaEditando(null) }}
          lecturaId={lectura.id}
          pregunta={preguntaEditando ?? undefined}
          siguienteOrden={preguntas.length + 1}
          onGuardado={() => { setModalAbierto(false); setPreguntaEditando(null); window.location.reload() }}
        />
      )}
    </div>
  )
}
