'use client'

import type { OpcionRespuesta } from '@/app/(evaluacion)/evaluacion/[id]/types'

interface OpcionMultipleProps {
  opciones: OpcionRespuesta[]
  seleccionada: string | null
  onSeleccionar: (id: string) => void
  letras?: string[]
  readOnly?: boolean
}

const LETRAS_DEFAULT = ['A', 'B', 'C', 'D', 'E', 'F']

export default function OpcionMultiple({
  opciones,
  seleccionada,
  onSeleccionar,
  letras = LETRAS_DEFAULT,
  readOnly = false,
}: OpcionMultipleProps) {
  return (
    <div style={{ marginTop: '20px' }}>
      {opciones.map((opcion, index) => {
        const activo = seleccionada === opcion.id
        const letra = letras[index] ?? String(index + 1)

        return (
          <button
            key={opcion.id}
            onClick={() => !readOnly && onSeleccionar(opcion.id)}
            disabled={readOnly}
            style={{
              width: '100%',
              marginTop: index === 0 ? 0 : '10px',
              background: activo ? '#EEF2FF' : 'white',
              border: activo ? '2px solid #4F46E5' : '1.5px solid #E5E7EB',
              borderRadius: '16px',
              padding: '16px',
              display: 'flex', gap: '12px', alignItems: 'center',
              boxShadow: activo
                ? '0 4px 12px rgba(79,70,229,0.15)'
                : '0 1px 4px rgba(0,0,0,0.04)',
              cursor: readOnly ? 'default' : 'pointer',
              transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)',
              transform: activo ? 'scale(1.01)' : 'scale(1)',
              textAlign: 'left',
              fontFamily: 'inherit',
            }}
          >
            {/* Indicador circular */}
            <div style={{
              width: '22px', height: '22px',
              borderRadius: '50%',
              flexShrink: 0,
              border: activo ? 'none' : '1.5px solid #D1D5DB',
              background: activo ? '#4F46E5' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
            }}>
              {activo && (
                <div style={{
                  width: '8px', height: '8px',
                  borderRadius: '50%',
                  background: 'white',
                  animation: 'scaleIn 0.2s cubic-bezier(0.16,1,0.3,1)',
                }} />
              )}
            </div>

            {/* Letra identificadora */}
            <span style={{
              width: '28px', height: '28px',
              borderRadius: '8px',
              flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: activo ? '#4F46E5' : '#F3F4F6',
              color: activo ? 'white' : '#6B7280',
              fontWeight: 700,
              fontSize: '13px',
              transition: 'all 0.2s',
            }}>
              {letra}
            </span>

            {/* Texto */}
            <span style={{
              flex: 1,
              fontSize: '15px',
              color: activo ? '#4F46E5' : '#111827',
              fontWeight: activo ? 700 : 500,
              lineHeight: '1.4',
              transition: 'color 0.2s, font-weight 0.2s',
            }}>
              {opcion.texto}
            </span>
          </button>
        )
      })}
    </div>
  )
}
