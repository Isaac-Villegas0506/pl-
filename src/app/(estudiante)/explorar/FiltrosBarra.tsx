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

const FILTROS_CONFIG: { key: FiltroKey; label: string }[] = [
  { key: 'grado', label: 'Grado' },
  { key: 'materia', label: 'Materia' },
  { key: 'autor', label: 'Autor' },
]

function getNombreFiltro(
  key: FiltroKey,
  value: string | undefined,
  opciones: FiltrosOpciones
): string | null {
  if (!value) return null
  if (key === 'grado') return opciones.grados.find((g) => g.id === value)?.nombre ?? null
  if (key === 'materia') return opciones.materias.find((m) => m.id === value)?.nombre ?? null
  if (key === 'nivel') return opciones.niveles.find((n) => n.id === value)?.nombre ?? null
  if (key === 'autor') return value
  return null
}

export default function FiltrosBarra({
  filtros,
  filtrosOpciones,
  onLimpiarTodo,
  onAbrirDropdown,
  onLimpiarFiltro,
}: FiltrosBarraProps) {
  const hayFiltrosActivos = !!(filtros.grado || filtros.materia || filtros.nivel || filtros.autor)

  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
      {/* Chip "Todos" */}
      <button
        onClick={onLimpiarTodo}
        className={`shrink-0 rounded-full px-[18px] py-2 text-sm font-medium transition-colors cursor-pointer ${
          !hayFiltrosActivos
            ? 'bg-[#2563EB] text-white'
            : 'bg-white border-[1.5px] border-[#E2E8F0] text-[#475569]'
        }`}
      >
        Todos
      </button>

      {/* Dropdown chips */}
      {FILTROS_CONFIG.map(({ key, label }) => {
        const valor = filtros[key]
        const nombre = getNombreFiltro(key, valor, filtrosOpciones)
        const activo = !!valor

        return (
          <button
            key={key}
            onClick={() => (activo ? onLimpiarFiltro(key) : onAbrirDropdown(key))}
            className={`shrink-0 flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-medium transition-colors cursor-pointer ${
              activo
                ? 'bg-[#EFF6FF] border-[1.5px] border-[#2563EB] text-[#2563EB]'
                : 'bg-white border-[1.5px] border-[#E2E8F0] text-[#475569]'
            }`}
          >
            <span>{activo && nombre ? truncar(nombre, 10) : label}</span>
            {activo ? (
              <X size={14} className="text-[#2563EB]" />
            ) : (
              <ChevronDown size={14} className="text-[#94A3B8]" />
            )}
          </button>
        )
      })}
    </div>
  )
}
