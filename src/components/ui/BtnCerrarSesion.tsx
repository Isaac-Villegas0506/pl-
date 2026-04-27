'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  variant?: 'menuItem' | 'button'
}

export default function BtnCerrarSesion({ variant = 'menuItem' }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleCerrarSesion() {
    setIsLoading(true)
    await supabase.auth.signOut()
    router.push('/login')
  }

  const menuItemStyle = {
    display: 'flex', alignItems: 'center', gap: '14px',
    padding: '16px', background: 'white', borderRadius: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: '12px',
    cursor: 'pointer', border: 'none', width: '100%', textAlign: 'left' as const,
    color: '#F43F5E',
  }

  const btnStyle = {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '10px 16px', background: '#FFF1F2', borderRadius: '12px',
    border: 'none', cursor: 'pointer', color: '#F43F5E', fontWeight: '700',
    fontSize: '14px', fontFamily: 'inherit'
  }

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)} 
        style={variant === 'menuItem' ? menuItemStyle : btnStyle}
      >
        {variant === 'menuItem' ? (
          <>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#FFF1F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LogOut size={18} color="#F43F5E" />
            </div>
            <p style={{ fontSize: '15px', fontWeight: '700', margin: 0 }}>Cerrar sesión</p>
          </>
        ) : (
          <>
            <LogOut size={16} /> Cerrar sesión
          </>
        )}
      </button>

      {isModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99999,   // FIX 4
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'flex-end',   // FIX 4: el sheet sube desde abajo
          justifyContent: 'center',
        }}>
          <div style={{
            width: '100%',
            maxWidth: '480px',
            background: 'white',
            borderRadius: '28px 28px 0 0',
            padding: '32px 20px',
            paddingBottom: 'calc(32px + env(safe-area-inset-bottom, 0px))', // FIX 4
            boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
            animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '16px', background: '#FFF1F2',
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px',
            }}>
              <LogOut size={28} color="#F43F5E" />
            </div>
            
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#111827', margin: '0 0 8px' }}>
              ¿Cerrar sesión?
            </h3>
            <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 24px', lineHeight: 1.5 }}>
              ¿Estás seguro de que deseas salir de tu cuenta? Tendrás que volver a ingresar tus credenciales para acceder.
            </p>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={isLoading}
                style={{
                  flex: 1, height: '48px', borderRadius: '14px', border: 'none', background: '#F3F4F6',
                  color: '#4B5563', fontSize: '15px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleCerrarSesion}
                disabled={isLoading}
                style={{
                  flex: 1, height: '48px', borderRadius: '14px', border: 'none', background: '#F43F5E',
                  color: 'white', fontSize: '15px', fontWeight: '800', cursor: 'pointer', fontFamily: 'inherit',
                  opacity: isLoading ? 0.7 : 1
                }}
              >
                {isLoading ? 'Saliendo...' : 'Sí, salir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
