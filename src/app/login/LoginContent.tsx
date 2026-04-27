'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, BookOpen, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import ToastGlobal, { mostrarToast } from '@/components/ui/ToastGlobal'

export default function LoginContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [verPassword, setVerPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [montado, setMontado] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Animar entrada después de montar
    setTimeout(() => setMontado(true), 100)
  }, [])

  const handleLogin = async () => {
    if (!email || !password) return
    setIsLoading(true)
    setError(null)
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) {
      setError(err.message === 'Invalid login credentials' ? 'Correo o contraseña incorrectos' : err.message)
      setIsLoading(false)
      mostrarToast('error', 'Error al iniciar sesión')
    } else {
      router.push('/inicio')
      router.refresh()
    }
  }

  return (
    <div style={{
      minHeight: '100dvh', position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(160deg, #0F0C29 0%, #302B63 50%, #24243E 100%)',
      display: 'flex', flexDirection: 'column',
    }}>
      <ToastGlobal />

      {/* ── FONDO DECORATIVO ── */}

      {/* Orbe grande violeta (fondo) */}
      <div style={{
        position: 'absolute', top: '-120px', left: '-120px',
        width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(109,40,217,0.45) 0%, transparent 70%)',
        filter: 'blur(40px)', zIndex: 0,
        animation: 'float 6s ease-in-out infinite',
      }} />

      {/* Orbe mediano índigo (derecha) */}
      <div style={{
        position: 'absolute', top: '30%', right: '-80px',
        width: '280px', height: '280px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(79,70,229,0.35) 0%, transparent 70%)',
        filter: 'blur(32px)', zIndex: 0,
        animation: 'float 8s ease-in-out infinite',
        animationDelay: '1s',
      }} />

      {/* Orbe pequeño (inferior) */}
      <div style={{
        position: 'absolute', bottom: '10%', left: '20%',
        width: '200px', height: '200px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(129,140,248,0.25) 0%, transparent 70%)',
        filter: 'blur(24px)', zIndex: 0,
        animation: 'float 7s ease-in-out infinite',
        animationDelay: '2s',
      }} />

      {/* Partículas decorativas (puntos de luz) */}
      {[...Array(12)].map((_, i) => (
        <div key={i} style={{
          position: 'absolute', zIndex: 0,
          width: `${2 + Math.random() * 3}px`,
          height: `${2 + Math.random() * 3}px`,
          borderRadius: '50%',
          background: `rgba(255,255,255,${0.1 + Math.random() * 0.3})`,
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          animation: `pulse ${3 + Math.random() * 4}s ease-in-out infinite`,
          animationDelay: `${Math.random() * 3}s`,
        }} />
      ))}

      {/* ── CONTENIDO PRINCIPAL (flotando libremente) ── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        padding: '0 28px', justifyContent: 'center',
        position: 'relative', zIndex: 1,
      }}>

        {/* Logo + nombre de la app */}
        <div style={{
          marginBottom: '48px',
          opacity: montado ? 1 : 0,
          transform: montado ? 'translateY(0)' : 'translateY(-20px)',
          transition: 'all 0.6s cubic-bezier(0.16,1,0.3,1)',
        }}>
          {/* Ícono de la app */}
          <div style={{
            width: '64px', height: '64px', borderRadius: '18px',
            background: 'linear-gradient(135deg, #4F46E5, #6D28D9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(79,70,229,0.4)',
            marginBottom: '20px',
          }}>
            <BookOpen size={32} color="white" strokeWidth={1.5} />
          </div>

          <h1 style={{
            fontFamily: 'var(--font-playfair, serif)',
            fontSize: '36px', fontWeight: '800',
            color: 'white', lineHeight: '1.1',
            letterSpacing: '-0.02em',
          }}>
            Plan de<br />Lectura
          </h1>
          <p style={{
            fontSize: '16px', color: 'rgba(255,255,255,0.5)',
            marginTop: '10px', lineHeight: '1.5',
          }}>
            Tu biblioteca escolar digital
          </p>
        </div>

        {/* ── CAMPOS DEL FORMULARIO (flotantes, sin caja) ── */}

        <div style={{
          opacity: montado ? 1 : 0,
          transform: montado ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.7s cubic-bezier(0.16,1,0.3,1)',
          transitionDelay: '0.1s',
        }}>

          {/* Campo EMAIL */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              fontSize: '13px', fontWeight: '700',
              color: 'rgba(255,255,255,0.6)',
              letterSpacing: '0.06em', textTransform: 'uppercase',
              display: 'block', marginBottom: '8px',
            }}>
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              style={{
                width: '100%', height: '56px',
                background: 'rgba(255,255,255,0.08)',
                border: `1.5px solid ${error ? 'rgba(244,63,94,0.5)' : 'rgba(255,255,255,0.15)'}`,
                borderRadius: '16px',
                padding: '0 18px',
                fontSize: '16px', color: 'white',
                fontFamily: 'inherit', outline: 'none',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(129,140,248,0.7)'
                e.target.style.background = 'rgba(255,255,255,0.12)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = error
                  ? 'rgba(244,63,94,0.5)' : 'rgba(255,255,255,0.15)'
                e.target.style.background = 'rgba(255,255,255,0.08)'
              }}
            />
          </div>

          {/* Campo CONTRASEÑA */}
          <div style={{ marginBottom: '8px' }}>
            <label style={{
              fontSize: '13px', fontWeight: '700',
              color: 'rgba(255,255,255,0.6)',
              letterSpacing: '0.06em', textTransform: 'uppercase',
              display: 'block', marginBottom: '8px',
            }}>
              Contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={verPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="- - - - - - - - "
                style={{
                  width: '100%', height: '56px',
                  background: 'rgba(255,255,255,0.08)',
                  border: `1.5px solid ${error ? 'rgba(244,63,94,0.5)' : 'rgba(255,255,255,0.15)'}`,
                  borderRadius: '16px',
                  padding: '0 52px 0 18px',
                  fontSize: '16px', color: 'white',
                  fontFamily: 'inherit', outline: 'none',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(129,140,248,0.7)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = error
                    ? 'rgba(244,63,94,0.5)' : 'rgba(255,255,255,0.15)'
                }}
              />
              <button
                type="button"
                onClick={() => setVerPassword(!verPassword)}
                style={{
                  position: 'absolute', right: '14px', top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '4px', color: 'rgba(255,255,255,0.5)',
                }}
              >
                {verPassword
                  ? <EyeOff size={20} />
                  : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Mensaje de error */}
          {error && (
            <p style={{
              fontSize: '13px', color: '#FDA4AF',
              fontWeight: '600', marginBottom: '12px',
              padding: '8px 12px',
              background: 'rgba(244,63,94,0.1)',
              borderRadius: '10px', border: '1px solid rgba(244,63,94,0.2)',
              animation: 'slideDown 0.3s ease',
            }}>
              ⚠️ {error}
            </p>
          )}

          {/* Botón Ingresar */}
          <button
            onClick={handleLogin}
            disabled={isLoading || !email || !password}
            style={{
              width: '100%', height: '58px',
              background: isLoading || !email || !password
                ? 'rgba(255,255,255,0.1)'
                : 'linear-gradient(135deg, #4F46E5, #6D28D9)',
              border: 'none', borderRadius: '18px',
              fontSize: '17px', fontWeight: '800', color: 'white',
              cursor: isLoading || !email || !password ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', marginTop: '8px',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '8px',
              boxShadow: isLoading || !email || !password
                ? 'none' : '0 8px 24px rgba(79,70,229,0.5)',
              transition: 'all 0.2s',
            }}
          >
            {isLoading ? (
              <>
                <div style={{
                  width: '20px', height: '20px', borderRadius: '50%',
                  border: '2.5px solid rgba(255,255,255,0.3)',
                  borderTopColor: 'white',
                  animation: 'spin 0.8s linear infinite',
                }} />
                Ingresando...
              </>
            ) : (
              <>
                Ingresar
                <ArrowRight size={18} strokeWidth={2.5} />
              </>
            )}
          </button>

        </div>
      </div>

      {/* Texto inferior (versión) */}
      <div style={{
        padding: '16px 28px 32px',
        textAlign: 'center', position: 'relative', zIndex: 1,
        opacity: montado ? 0.4 : 0,
        transition: 'opacity 0.8s ease 0.4s',
      }}>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
          Plan de Lectura · v1.0 · IE NICOLÁS LA TORRE
        </p>
      </div>

    </div>
  )
}
