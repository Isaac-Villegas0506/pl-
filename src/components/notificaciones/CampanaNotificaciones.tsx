'use client'
import { useRouter } from 'next/navigation'
import { Bell } from 'lucide-react'

interface Props {
  noLeidas: number
}

export default function CampanaNotificaciones({ noLeidas }: Props) {
  const router = useRouter()
  return (
    <button
      onClick={() => router.push('/notificaciones')}
      style={{
        position: 'relative', width: '38px', height: '38px',
        background: noLeidas > 0 ? '#EEF2FF' : '#F5F3FF',
        border: noLeidas > 0 ? '1.5px solid #C7D2FE' : '1.5px solid transparent',
        borderRadius: '12px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', transition: 'all 0.2s',
      }}
      aria-label={`Notificaciones${noLeidas > 0 ? `, ${noLeidas} sin leer` : ''}`}
    >
      <Bell
        size={20}
        color={noLeidas > 0 ? '#4F46E5' : '#9CA3AF'}
        strokeWidth={noLeidas > 0 ? 2.5 : 1.8}
      />
      {noLeidas > 0 && (
        <span style={{
          position: 'absolute', top: '-5px', right: '-5px',
          minWidth: '18px', height: '18px',
          background: '#F43F5E', borderRadius: '99px', border: '2px solid white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '10px', fontWeight: '800', color: 'white', padding: '0 4px',
        }}>
          {noLeidas > 99 ? '99+' : noLeidas}
        </span>
      )}
    </button>
  )
}
