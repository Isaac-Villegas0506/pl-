'use client'
import { useEffect, useState } from 'react'

interface Props {
  activo: boolean
  onFin?: () => void
}

const COLORES = ['#4F46E5','#6D28D9','#10B981','#F59E0B','#EC4899','#0EA5E9']
const CANTIDAD = 40

export default function ConfettiLogro({ activo, onFin }: Props) {
  const [particulas, setParticulas] = useState<{
    id: number; x: number; color: string;
    size: number; delay: number; duration: number
  }[]>([])

  useEffect(() => {
    if (!activo) { setParticulas([]); return }
    const items = Array.from({ length: CANTIDAD }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: COLORES[Math.floor(Math.random() * COLORES.length)],
      size: 6 + Math.random() * 8,
      delay: Math.random() * 0.5,
      duration: 0.8 + Math.random() * 0.6,
    }))
    setParticulas(items)
    const t = setTimeout(() => {
      setParticulas([])
      onFin?.()
    }, 2000)
    return () => clearTimeout(t)
  }, [activo, onFin])

  if (!particulas.length) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      pointerEvents: 'none', overflow: 'hidden',
    }}>
      {particulas.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          left: `${p.x}%`,
          top: '-10px',
          width: p.size,
          height: p.size,
          background: p.color,
          borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          animation: `confetti-fall ${p.duration}s ${p.delay}s ease-in forwards`,
        }} />
      ))}
    </div>
  )
}
