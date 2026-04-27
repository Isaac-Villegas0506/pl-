'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ChevronLeft, ChevronRight, User, Lock, Mail, 
  Bell, BellRing, Palette, LogOut 
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { UsuarioPerfil } from '../types'

export default function ConfiguracionContent({ usuario }: { usuario: UsuarioPerfil }) {
  const router = useRouter()
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error al cerrar sesión', error)
      setIsLoggingOut(false)
    }
  }

  const FilaConfiguracion = ({ 
    icono: Icono, colorFondo, colorIcono, label, sublabel, valor, onClick, noArrow 
  }: any) => (
    <button
      onClick={onClick}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: '14px',
        padding: '16px 20px',
        background: 'transparent', border: 'none', cursor: onClick ? 'pointer' : 'default',
        borderBottom: '1px solid #F3F4F6',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <div style={{
        width: '38px', height: '38px', borderRadius: '12px',
        background: colorFondo, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icono size={18} color={colorIcono} strokeWidth={2} />
      </div>
      <div style={{ flex: 1, textAlign: 'left' }}>
        <p style={{ fontSize: '15px', fontWeight: '600', color: '#111827' }}>
          {label}
        </p>
        {sublabel && (
          <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '1px' }}>
            {sublabel}
          </p>
        )}
      </div>
      {valor ? (
        <span style={{ fontSize: '13px', color: '#9CA3AF', fontWeight: '500' }}>
          {valor}
        </span>
      ) : !noArrow ? (
        <ChevronRight size={18} color="#D1D5DB" strokeWidth={2} />
      ) : null}
    </button>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
      {/* HEADER */}
      <div style={{
        background: 'white',
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '16px 20px',
        borderBottom: '1px solid #F3F4F6',
        position: 'sticky', top: 0, zIndex: 40,
      }}>
        <button
          onClick={() => router.back()}
          style={{
            width: '36px', height: '36px', borderRadius: '10px',
            border: 'none', background: '#F3F4F6',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <ChevronLeft size={20} color="#374151" strokeWidth={2.5} />
        </button>
        <h1 style={{ fontSize: '18px', fontWeight: '800', color: '#111827' }}>
          Configuración
        </h1>
      </div>

      <div style={{ paddingBottom: '40px' }}>
        {/* SECCIÓN CUENTA */}
        <div style={{ marginTop: '24px' }}>
          <p style={{ fontSize: '13px', fontWeight: '700', color: '#9CA3AF', 
            textTransform: 'uppercase', letterSpacing: '0.05em', 
            padding: '0 20px', marginBottom: '8px' }}>
            Cuenta
          </p>
          <div style={{ background: 'white', borderTop: '1px solid #F3F4F6', borderBottom: '1px solid #F3F4F6' }}>
            <FilaConfiguracion 
              icono={User} colorFondo="#EEF2FF" colorIcono="#4F46E5" 
              label="Editar perfil" onClick={() => router.push('/perfil/editar')} 
            />
            <FilaConfiguracion 
              icono={Lock} colorFondo="#F0FDF4" colorIcono="#10B981" 
              label="Cambiar contraseña" onClick={() => router.push('/perfil/cambiar-password')} 
            />
            <FilaConfiguracion 
              icono={Mail} colorFondo="#F0F9FF" colorIcono="#0EA5E9" 
              label="Correo electrónico" valor={usuario.email} noArrow 
            />
          </div>
        </div>

        {/* SECCIÓN NOTIFICACIONES */}
        <div style={{ marginTop: '24px' }}>
          <p style={{ fontSize: '13px', fontWeight: '700', color: '#9CA3AF', 
            textTransform: 'uppercase', letterSpacing: '0.05em', 
            padding: '0 20px', marginBottom: '8px' }}>
            Notificaciones
          </p>
          <div style={{ background: 'white', borderTop: '1px solid #F3F4F6', borderBottom: '1px solid #F3F4F6' }}>
            {/* Aquí irían toggles, usamos FilaConfiguracion temporalmente con valor On */}
            <FilaConfiguracion 
              icono={Bell} colorFondo="#FFF7ED" colorIcono="#F97316" 
              label="Notificaciones push" valor="Activado" noArrow 
            />
            <FilaConfiguracion 
              icono={BellRing} colorFondo="#FFF7ED" colorIcono="#F97316" 
              label="Notificaciones en la app" valor="Activado" noArrow 
            />
          </div>
        </div>

        {/* SECCIÓN APARIENCIA */}
        <div style={{ marginTop: '24px' }}>
          <p style={{ fontSize: '13px', fontWeight: '700', color: '#9CA3AF', 
            textTransform: 'uppercase', letterSpacing: '0.05em', 
            padding: '0 20px', marginBottom: '8px' }}>
            Apariencia
          </p>
          <div style={{ background: 'white', borderTop: '1px solid #F3F4F6', borderBottom: '1px solid #F3F4F6' }}>
            <FilaConfiguracion 
              icono={Palette} colorFondo="#F5F3FF" colorIcono="#8B5CF6" 
              label="Tema" valor="Automático" noArrow 
            />
          </div>
        </div>

        {/* SECCIÓN INFORMACIÓN */}
        <div style={{ marginTop: '24px' }}>
          <p style={{ fontSize: '13px', fontWeight: '700', color: '#9CA3AF', 
            textTransform: 'uppercase', letterSpacing: '0.05em', 
            padding: '0 20px', marginBottom: '8px' }}>
            Información
          </p>
          <div style={{ background: 'white', borderTop: '1px solid #F3F4F6', borderBottom: '1px solid #F3F4F6' }}>
            <FilaConfiguracion 
              icono={User} colorFondo="#F3F4F6" colorIcono="#6B7280" 
              label="Versión de la app" valor="1.0.0" noArrow 
            />
            <FilaConfiguracion 
              icono={User} colorFondo="#F3F4F6" colorIcono="#6B7280" 
              label="Términos de uso" 
            />
            <FilaConfiguracion 
              icono={User} colorFondo="#F3F4F6" colorIcono="#6B7280" 
              label="Política de privacidad" 
            />
          </div>
        </div>

        {/* SECCIÓN SESIÓN */}
        <div style={{ marginTop: '24px' }}>
          <div style={{ background: 'white', borderTop: '1px solid #F3F4F6', borderBottom: '1px solid #F3F4F6' }}>
            <button
              onClick={() => setShowLogoutModal(true)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '14px',
                padding: '16px 20px',
                background: 'transparent', border: 'none', cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <div style={{
                width: '38px', height: '38px', borderRadius: '12px',
                background: '#FFF1F2', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <LogOut size={18} color="#F43F5E" strokeWidth={2} />
              </div>
              <p style={{ flex: 1, textAlign: 'left', fontSize: '15px', fontWeight: '600', color: '#F43F5E' }}>
                Cerrar sesión
              </p>
            </button>
          </div>
        </div>
      </div>

      {/* MODAL CERRAR SESIÓN */}
      {showLogoutModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        }}>
          <div style={{
            width: '100%', maxWidth: '400px',
            background: 'white',
            borderRadius: '24px 24px 0 0',
            padding: '32px 24px 40px',
            textAlign: 'center',
            animation: 'slideUp 0.3s ease-out',
          }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: '#FFF1F2', margin: '0 auto 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <LogOut size={32} color="#F43F5E" />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#111827', marginBottom: '8px' }}>
              ¿Cerrar sesión?
            </h2>
            <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '32px' }}>
              Tendrás que volver a ingresar tus datos
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                style={{
                  width: '100%', height: '52px',
                  background: '#F43F5E', color: 'white',
                  border: 'none', borderRadius: '14px',
                  fontSize: '16px', fontWeight: '700',
                  cursor: isLoggingOut ? 'not-allowed' : 'pointer',
                  opacity: isLoggingOut ? 0.7 : 1,
                }}
              >
                {isLoggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                disabled={isLoggingOut}
                style={{
                  width: '100%', height: '52px',
                  background: 'transparent', color: '#374151',
                  border: '1.5px solid #E5E7EB', borderRadius: '14px',
                  fontSize: '16px', fontWeight: '700',
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
