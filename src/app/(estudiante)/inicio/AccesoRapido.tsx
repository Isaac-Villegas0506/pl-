'use client'

import { BookOpen, Compass, Heart, Download } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface QuickAccessItem {
  id: string
  label: string
  icon: LucideIcon
  bgColor: string
  iconColor: string
  textColor: string
  ruta: string
}

const ITEMS: QuickAccessItem[] = [
  {
    id: 'explorar',
    label: 'Explorar',
    icon: Compass,
    bgColor: '#EEF2FF', // Indigo 50
    iconColor: '#4F46E5', // Indigo 600
    textColor: '#312E81', // Indigo 900
    ruta: '/explorar',
  },
  {
    id: 'mis-libros',
    label: 'Mis Libros',
    icon: BookOpen,
    bgColor: '#FFF7ED', // Orange 50
    iconColor: '#F97316', // Orange 600
    textColor: '#7C2D12', // Orange 900
    ruta: '/mis-libros',
  },
  {
    id: 'favoritos',
    label: 'Favoritos',
    icon: Heart,
    bgColor: '#FFF1F2', // Rose 50
    iconColor: '#F43F5E', // Rose 600
    textColor: '#881337', // Rose 900
    ruta: '/favoritos',
  },
  {
    id: 'descargas',
    label: 'Descargas',
    icon: Download,
    bgColor: '#ECFDF5', // Emerald 50
    iconColor: '#10B981', // Emerald 600
    textColor: '#064E3B', // Emerald 900
    ruta: '/mis-libros?tab=offline',
  },
]

interface AccesoRapidoProps {
  onNavegar: (ruta: string) => void
}

export default function AccesoRapido({ onNavegar }: AccesoRapidoProps) {
  return (
    <div className="acceso-rapido-grid">
      {ITEMS.map((item) => {
        const Icon = item.icon
        return (
          <button
            key={item.id}
            onClick={() => onNavegar(item.ruta)}
            className="soft-shadow-hover"
            style={{
              background: item.bgColor,
              border: 'none',
              borderRadius: '20px', // Slightly smaller radius
              padding: '20px 16px', // Restored original padding
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              textAlign: 'left',
              width: '100%',
            }}
          >
            {/* Círculo del ícono */}
            <div style={{
              width: '42px', height: '42px', // Slightly smaller
              background: 'white',
              borderRadius: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}>
              <Icon size={20} color={item.iconColor} strokeWidth={2} />
            </div>
            {/* Texto */}
            <span style={{
              fontSize: '14px', fontWeight: 800, // Slightly smaller font
              color: item.textColor, lineHeight: '1.2',
            }}>
              {item.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
