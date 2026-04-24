'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, Mail, Lock, Eye, EyeOff, AlertCircle, LogIn } from 'lucide-react'
import { loginAction } from './actions'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Completa todos los campos')
      return
    }
    setIsLoading(true)
    setError(null)
    const result = await loginAction(email, password)
    if (result && !result.success) {
      const msgs: Record<string, string> = {
        credenciales: 'Credenciales incorrectas. Verifica tu email y contraseña.',
        desactivado: 'Tu cuenta está desactivada. Contacta al administrador.',
        inesperado: 'Ocurrió un error inesperado. Intenta nuevamente.',
      }
      setError(msgs[result.error] ?? msgs.inesperado)
      setIsLoading(false)
    }
  }

  return (
    // FONDO GENERAL
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #EEF2FF 0%, #F5F3FF 50%, #FAF5FF 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 20px',
    }}>
      {/* CARD PRINCIPAL */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '28px',
        boxShadow: '0 20px 60px rgba(79,70,229,0.12), 0 4px 16px rgba(0,0,0,0.06)',
        padding: '40px 28px 32px',
        width: '100%',
        maxWidth: '400px',
        animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1)',
      }}>

        {/* LOGO */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{
            width: '88px', height: '88px',
            background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
            borderRadius: '22px',
            boxShadow: '0 8px 24px rgba(79,70,229,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <BookOpen size={40} color="white" strokeWidth={1.5} />
          </div>
          <span style={{
            fontSize: '10px', fontWeight: '700', letterSpacing: '0.15em',
            color: '#9CA3AF', marginTop: '10px', textTransform: 'uppercase',
          }}>
            Plan de Lectura
          </span>
        </div>

        {/* TÍTULOS */}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <h1 style={{
            fontFamily: 'var(--font-playfair, serif)',
            fontSize: '26px', fontWeight: '800',
            color: '#111827', lineHeight: '1.2',
          }}>
            ¡Bienvenido a tu biblioteca!
          </h1>
          <p style={{
            fontSize: '14px', color: '#6B7280',
            marginTop: '8px', lineHeight: '1.5',
          }}>
            Ingresa tus credenciales para continuar explorando
          </p>
        </div>

        {/* FORMULARIO */}
        <form onSubmit={handleSubmit} style={{
          marginTop: '28px',
          display: 'flex', flexDirection: 'column', gap: '16px',
        }}>

          {/* CAMPO EMAIL */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{
              fontSize: '14px', fontWeight: '600', color: '#374151',
            }}>
              Correo electrónico
            </label>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              background: '#FAFAFA',
              border: '1.5px solid #E5E7EB',
              borderRadius: '14px',
              padding: '0 16px',
              height: '54px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}>
              <Mail size={18} color="#9CA3AF" strokeWidth={1.5} style={{ flexShrink: 0 }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@escuela.edu"
                style={{
                  flex: 1, border: 'none', outline: 'none',
                  background: 'transparent',
                  fontSize: '15px', color: '#111827',
                  fontFamily: 'inherit',
                  minWidth: 0,
                }}
              />
            </div>
          </div>

          {/* CAMPO CONTRASEÑA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{
              fontSize: '14px', fontWeight: '600', color: '#374151',
            }}>
              Contraseña
            </label>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              background: '#FAFAFA',
              border: '1.5px solid #E5E7EB',
              borderRadius: '14px',
              padding: '0 16px',
              height: '54px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            }}>
              <Lock size={18} color="#9CA3AF" strokeWidth={1.5} style={{ flexShrink: 0 }} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="- - - - - - - - "
                style={{
                  flex: 1, border: 'none', outline: 'none',
                  background: 'transparent',
                  fontSize: '15px', color: '#111827',
                  fontFamily: 'inherit',
                  minWidth: 0,
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '4px', display: 'flex', alignItems: 'center',
                  flexShrink: 0,
                }}
              >
                {showPassword
                  ? <EyeOff size={18} color="#9CA3AF" />
                  : <Eye size={18} color="#9CA3AF" />}
              </button>
            </div>
          </div>

          {/* ERROR */}
          {error && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: '8px',
              background: '#FFF1F2',
              border: '1px solid #FECDD3',
              borderRadius: '12px',
              padding: '12px 14px',
            }}>
              <AlertCircle size={16} color="#F43F5E" style={{ flexShrink: 0, marginTop: '1px' }} />
              <span style={{ fontSize: '13px', color: '#BE123C', lineHeight: '1.4' }}>
                {error}
              </span>
            </div>
          )}

          {/* BOTÓN ENTRAR */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              height: '54px',
              background: isLoading
                ? '#A5B4FC'
                : 'linear-gradient(135deg, #4F46E5, #6D28D9)',
              color: 'white',
              border: 'none',
              borderRadius: '14px',
              fontSize: '16px', fontWeight: '700',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              boxShadow: isLoading ? 'none' : '0 4px 14px rgba(79,70,229,0.35)',
              transition: 'all 0.2s',
              fontFamily: 'inherit',
              marginTop: '4px',
            }}
          >
            {isLoading ? (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" style={{ animation: 'spin 0.8s linear infinite' }}>
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3"
                    fill="none" strokeOpacity="0.3" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3"
                    fill="none" strokeLinecap="round" />
                </svg>
                Ingresando...
              </>
            ) : (
              <>
                Entrar
                <LogIn size={18} strokeWidth={2} />
              </>
            )}
          </button>

          {/* LINK RECUPERAR */}
          <a
            href="/recuperar"
            style={{
              display: 'block', textAlign: 'center',
              fontSize: '14px', fontWeight: '600', color: '#4F46E5',
              textDecoration: 'none', marginTop: '4px',
            }}
          >
            ¿Olvidaste tu contraseña?
          </a>
        </form>
      </div>

      {/* Keyframes en style tag */}
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
