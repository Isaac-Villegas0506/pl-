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
      <div className="flex flex-col items-center text-center py-4">
        {/* ICONO CELEBRATORIO CON GRADIENTE */}
        <div 
          className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6"
          style={{
            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
            boxShadow: '0 10px 25px rgba(255, 165, 0, 0.3)',
            transform: 'rotate(-3deg)',
          }}
        >
          <Trophy size={52} color="white" strokeWidth={2.5} />
        </div>

        <h2 className="text-2xl font-black text-[#0F172A] tracking-tight">
          ¡Lectura Completada!
        </h2>
        
        <p className="text-base text-[#475569] mt-3 leading-relaxed px-4">
          Increíble trabajo. Has terminado de leer <br />
          <span className="font-bold text-[#4F46E5]">&ldquo;{titulo}&rdquo;</span>
        </p>

        <div className="w-full mt-8 space-y-3">
          {tienePreguntas && asignacionId ? (
            <>
              <Button 
                variant="primary" 
                fullWidth 
                onClick={onEvaluar}
                className="h-14 text-base shadow-[0_6px_20px_rgba(79,70,229,0.3)]"
              >
                Comenzar Evaluación
              </Button>
              <Button 
                variant="ghost" 
                fullWidth 
                onClick={onVolver}
                className="text-[#64748B]"
              >
                Volver después
              </Button>
            </>
          ) : (
            <Button 
              variant="primary" 
              fullWidth 
              onClick={onVolver}
              className="h-14 text-base shadow-[0_6px_20px_rgba(79,70,229,0.3)]"
            >
              ¡Genial! Volver al inicio
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}
