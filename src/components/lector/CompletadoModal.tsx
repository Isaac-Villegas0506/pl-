'use client'

import { Trophy } from 'lucide-react'
import { Modal, Button } from '@/components/ui'

interface CompletadoModalProps {
  isOpen: boolean
  titulo: string
  tienePreguntas: boolean
  asignacionId: string | null
  onEvaluar: () => void
  onVolver: () => void
}

export default function CompletadoModal({
  isOpen,
  titulo,
  tienePreguntas,
  asignacionId,
  onEvaluar,
  onVolver,
}: CompletadoModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onVolver} title="" size="sm">
      <div className="flex flex-col items-center text-center py-2">
        <div className="w-20 h-20 rounded-full bg-[#FFF8E1] flex items-center justify-center mb-4">
          <Trophy size={48} className="text-[#F59E0B]" />
        </div>
        <h2 className="text-xl font-bold text-[#0F172A]">¡Felicitaciones!</h2>
        <p className="text-sm text-[#475569] mt-2">
          Completaste &ldquo;{titulo}&rdquo;
        </p>
        <div className="w-full mt-6 space-y-2">
          {tienePreguntas && asignacionId && (
            <Button variant="primary" fullWidth onClick={onEvaluar}>
              Responder evaluación
            </Button>
          )}
          <Button variant="outline" fullWidth onClick={onVolver}>
            Volver a la biblioteca
          </Button>
        </div>
      </div>
    </Modal>
  )
}
