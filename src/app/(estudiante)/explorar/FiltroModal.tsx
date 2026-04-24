'use client'

import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { Modal, Button } from '@/components/ui'

interface FiltroModalProps {
  isOpen: boolean
  onClose: () => void
  titulo: string
  opciones: { id: string; nombre: string }[]
  valorActual: string | undefined
  onSeleccionar: (id: string | undefined) => void
}

export default function FiltroModal({
  isOpen,
  onClose,
  titulo,
  opciones,
  valorActual,
  onSeleccionar,
}: FiltroModalProps) {
  const [seleccion, setSeleccion] = useState<string | undefined>(valorActual)

  function handleAplicar() {
    onSeleccionar(seleccion)
    onClose()
  }

  function handleLimpiar() {
    setSeleccion(undefined)
    onSeleccionar(undefined)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={titulo} size="md">
      <div className="max-h-[50vh] overflow-y-auto -mx-1 px-1">
        {opciones.map((opcion, index) => (
          <button
            key={opcion.id}
            onClick={() => setSeleccion(opcion.id)}
            className={`w-full flex items-center justify-between py-3.5 cursor-pointer ${
              index < opciones.length - 1 ? 'border-b border-[#F1F5F9]' : ''
            }`}
          >
            <span className="text-sm text-[#0F172A]">{opcion.nombre}</span>
            {seleccion === opcion.id ? (
              <CheckCircle2 size={20} className="text-[#2563EB] shrink-0" />
            ) : (
              <div className="w-5 h-5 rounded-full border-[1.5px] border-[#E2E8F0] shrink-0" />
            )}
          </button>
        ))}
      </div>
      <div className="mt-4 space-y-2">
        <Button variant="primary" fullWidth onClick={handleAplicar}>
          Aplicar
        </Button>
        <Button variant="ghost" fullWidth onClick={handleLimpiar}>
          Limpiar
        </Button>
      </div>
    </Modal>
  )
}
