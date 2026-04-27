'use client'

import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Users, Library, BarChart3, Settings } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface NavItem {
  label: string
  href: string
  Icon: LucideIcon
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',  href: '/admin/dashboard',      Icon: LayoutDashboard },
  { label: 'Usuarios',   href: '/admin/usuarios',        Icon: Users },
  { label: 'Contenido',  href: '/admin/contenido',       Icon: Library },
  { label: 'Reportes',   href: '/admin/reportes',        Icon: BarChart3 },
  { label: 'Config',     href: '/admin/configuracion',   Icon: Settings },
]

export default function AdminNavBar() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
      height: '64px',
      background: 'rgba(15,23,42,0.97)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      boxShadow: '0 -4px 20px rgba(0,0,0,0.25)',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
    }}>
      <div style={{
        maxWidth: '480px', margin: '0 auto',
        height: '100%', display: 'flex',
        alignItems: 'center', padding: '0 8px',
      }}>
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href)
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              style={{
                flex: 1, border: 'none', background: 'none',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: '3px', cursor: 'pointer',
                padding: '8px 2px', position: 'relative', outline: 'none',
              }}
            >
              {/* Indicador activo superior */}
              <div style={{
                position: 'absolute', top: 0,
                width: '28px', height: '3px',
                borderRadius: '0 0 4px 4px',
                background: active ? '#818CF8' : 'transparent',
                transition: 'background 0.2s',
              }} />
              <item.Icon
                size={20}
                color={active ? '#818CF8' : 'rgba(255,255,255,0.4)'}
                strokeWidth={active ? 2.5 : 1.8}
              />
              <span style={{
                fontSize: '10px',
                fontWeight: 700,
                color: active ? '#818CF8' : 'rgba(255,255,255,0.4)',
                letterSpacing: '0.01em', lineHeight: 1,
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
