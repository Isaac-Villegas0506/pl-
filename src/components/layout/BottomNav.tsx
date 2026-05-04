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

  const isReadingPage = pathname.includes('/lectura/')
  
  if (isReadingPage) return null

  function isActive(item: NavItem): boolean {
    if (item.exactMatch) return pathname === item.href
    return pathname.startsWith(item.href)
  }

  return (
    <nav
      className="bottom-nav-mobile"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 10000,
        background: 'white',
        borderTop: '1px solid #F1F5F9',
        paddingBottom: 'max(12px, env(safe-area-inset-bottom, 0px))',
        paddingTop: '10px',
      }}
    >
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '0 24px',
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
                gap: '4px',
                cursor: 'pointer',
                padding: '4px',
                transition: 'all 0.2s ease',
                outline: 'none',
              }}
            >
              <item.Icon
                size={24}
                color={active ? '#4F46E5' : '#94A3B8'}
                strokeWidth={active ? 2.5 : 2}
                style={{
                  transition: 'transform 0.2s',
                  transform: active ? 'scale(1.1)' : 'scale(1)',
                }}
              />
              <span style={{
                fontSize: '10px',
                fontWeight: active ? 800 : 600,
                color: active ? '#4F46E5' : '#94A3B8',
                textTransform: 'capitalize',
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
