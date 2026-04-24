'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Home, Compass, BookMarked, User } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface NavItem {
  label: string
  href: string
  Icon: LucideIcon
  exactMatch?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Inicio',     href: '/inicio',     Icon: Home,      exactMatch: true },
  { label: 'Explorar',   href: '/explorar',   Icon: Compass },
  { label: 'Mis Libros', href: '/mis-libros', Icon: BookMarked },
  { label: 'Perfil',     href: '/perfil',     Icon: User },
]

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()

  function isActive(item: NavItem): boolean {
    if (item.exactMatch) return pathname === item.href
    return pathname.startsWith(item.href)
  }

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 9999,
      height: '64px',
      background: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(229,231,235,0.8)',
      boxShadow: '0 -4px 20px rgba(0,0,0,0.06)',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
    }}>
      <div style={{
        maxWidth: '480px',
        margin: '0 auto',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        padding: '0 8px',
      }}>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item)
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              style={{
                flex: 1,
                border: 'none',
                background: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '3px',
                cursor: 'pointer',
                padding: '8px 4px',
                position: 'relative',
                outline: 'none',
              }}
            >
              {/* Indicador activo arriba */}
              <div style={{
                position: 'absolute',
                top: 0,
                width: '32px',
                height: '3px',
                borderRadius: '0 0 4px 4px',
                background: active ? '#4F46E5' : 'transparent',
                transition: 'background 0.2s',
              }} />
              <item.Icon
                size={22}
                color={active ? '#4F46E5' : '#9CA3AF'}
                strokeWidth={active ? 2.5 : 1.8}
              />
              <span style={{
                fontSize: '10px',
                fontWeight: active ? 700 : 600,
                color: active ? '#4F46E5' : '#9CA3AF',
                letterSpacing: '0.01em',
                lineHeight: 1,
              }}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
