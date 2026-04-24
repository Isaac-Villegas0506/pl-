'use client'

import { ChevronDown, X } from 'lucide-react'
import { truncar } from '@/lib/utils'
import type { FiltrosOpciones, FiltrosActivos } from './types'

type FiltroKey = 'grado' | 'materia' | 'nivel' | 'autor'

interface FiltrosBarraProps {
  filtros: FiltrosActivos
  filtrosOpciones: FiltrosOpciones
  onLimpiarTodo: () => void
  onAbrirDropdown: (filtro: FiltroKey) => void
  onLimpiarFiltro: (key: FiltroKey) => void
}

function getNombreFiltro(
  key: FiltroKey,
  value: string | undefined,
  opciones: FiltrosOpciones
): string | null {
  if (!value) return null
  if (key === 'grado')   return opciones.grados.find((g) => g.id === value)?.nombre ?? null
  if (key === 'materia') return opciones.materias.find((m) => m.id === value)?.nombre ?? null
  if (key === 'nivel')   return opciones.niveles.find((n) => n.id === value)?.nombre ?? null
  if (key === 'autor')   return value
  return null
}

const FILTROS_CONFIG: { key: FiltroKey; label: string }[] = [
  { key: 'grado',   label: 'Grado' },
  { key: 'materia', label: 'Materia' },
  { key: 'autor',   label: 'Autor' },
]

export default function FiltrosBarra({
  filtros,
  filtrosOpciones,
  onLimpiarTodo,
  onAbrirDropdown,
  onLimpiarFiltro,
}: FiltrosBarraProps) {
  const hayFiltrosActivos = !!(
    filtros.grado || filtros.materia || filtros.nivel || filtros.autor
  )

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      overflowX: 'auto',
      scrollbarWidth: 'none',
      WebkitOverflowScrolling: 'touch',
      paddingBottom: '2px',
    }}>

      {/* CHIP "TODOS" */}
      <button
        onClick={onLimpiarTodo}
        style={{
          flexShrink: 0,
          height: '36px',
          padding: '0 16px',
          border: 'none',
          borderRadius: '99px',
          fontSize: '13px',
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)',
          fontFamily: 'inherit',
          background: !hayFiltrosActivos
            ? 'linear-gradient(135deg, #4F46E5, #6D28D9)'
            : '#F3F4F6',
          color: !hayFiltrosActivos ? 'white' : '#6B7280',
          boxShadow: !hayFiltrosActivos
            ? '0 2px 8px rgba(79,70,229,0.3)'
            : 'none',
        }}
      >
        Todos
      </button>

      {/* CHIPS DE FILTROS */}
      {FILTROS_CONFIG.map(({ key, label }) => {
        const valor = filtros[key]
        const nombre = getNombreFiltro(key, valor, filtrosOpciones)
        const activo = !!valor

        return (
          <button
            key={key}
            onClick={() => activo ? onLimpiarFiltro(key) : onAbrirDropdown(key)}
            style={{
              flexShrink: 0,
              height: '36px',
              padding: '0 10px 0 14px',
              display: 'flex', alignItems: 'center', gap: '5px',
              border: activo ? '1.5px solid #4F46E5' : '1.5px solid #E5E7EB',
              borderRadius: '99px',
              background: activo ? '#EEF2FF' : 'white',
              fontSize: '13px',
              fontWeight: activo ? 700 : 600,
              color: activo ? '#4F46E5' : '#6B7280',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)',
              boxShadow: activo
                ? '0 2px 8px rgba(79,70,229,0.15)'
                : '0 1px 3px rgba(0,0,0,0.06)',
              fontFamily: 'inherit',
              whiteSpace: 'nowrap',
              maxWidth: '130px',
            }}
          >
            <span style={{
              overflow: 'hidden', textOverflow: 'ellipsis',
              whiteSpace: 'nowrap', flex: 1,
            }}>
              {activo && nombre ? truncar(nombre, 9) : label}
            </span>

            {activo ? (
              <X size={13} color="#4F46E5" strokeWidth={2.5} style={{ flexShrink: 0 }} />
            ) : (
              <ChevronDown size={13} color="#9CA3AF" strokeWidth={2.5} style={{ flexShrink: 0 }} />
            )}
          </button>
        )
      })}
    </div>
  )
}
