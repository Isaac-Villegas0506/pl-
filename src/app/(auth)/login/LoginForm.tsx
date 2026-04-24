'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BookOpen, Mail, Lock, Eye, EyeOff, AlertCircle, LogIn, Loader2 } from 'lucide-react'
import InputField from '@/components/ui/InputField'
import { loginAction } from './actions'

const ERROR_MESSAGES: Record<string, string> = {
  credenciales: 'Credenciales incorrectas. Verifica tu email y contraseña.',
  desactivado:  'Tu cuenta está desactivada. Contacta al administrador.',
  inesperado:   'Ocurrió un error inesperado. Intenta nuevamente.',
}

export default function LoginForm() {
  const [email, setEmail]             = useState('')
  const [password, setPassword]       = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading]     = useState(false)
  const [error, setError]             = useState<string | null>(null)

  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!email.trim() || !password.trim() || !isValidEmail(email)) {
      setError('credenciales')
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const result = await loginAction(email, password)
      if (!result.success) { setError(result.error); setIsLoading(false) }
    } catch {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="w-full max-w-[400px] animate-slide-up"
      style={{
        background: 'white',
        borderRadius: '28px',
        boxShadow: '0 20px 60px rgba(79,70,229,0.12), 0 4px 16px rgba(0,0,0,0.06)',
        padding: '36px 28px',
      }}
    >
      {/* Logo */}
      <div className="flex flex-col items-center">
        <div
          className="w-[88px] h-[88px] rounded-[22px] flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
            boxShadow: '0 8px 24px rgba(79,70,229,0.35)',
          }}
        >
          <BookOpen size={40} className="text-white" />
        </div>
        <p className="text-[10px] font-bold tracking-[0.15em] text-[#6B7280] mt-2 uppercase">
          Plan de Lectura
        </p>
      </div>

      {/* Title */}
      <h1
        className="text-[26px] font-extrabold text-[#111827] text-center mt-5 leading-[1.2]"
        style={{ fontFamily: 'var(--font-playfair)' }}
      >
        ¡Bienvenido a tu biblioteca!
      </h1>
      <p className="text-sm text-[#6B7280] text-center mt-2 leading-relaxed">
        Ingresa tus credenciales para continuar explorando
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4">
        <InputField
          label="Correo electrónico"
          type="email"
          placeholder="ejemplo@escuela.edu"
          value={email}
          onChange={setEmail}
          icon={Mail}
          disabled={isLoading}
        />

        <InputField
          label="Contraseña"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          value={password}
          onChange={setPassword}
          icon={Lock}
          disabled={isLoading}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-[#9CA3AF] hover:text-[#4F46E5] transition-colors cursor-pointer"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
        />

        {/* Error banner */}
        {error && (
          <div
            className="flex items-start gap-2 rounded-[12px] px-3.5 py-3"
            style={{
              background: '#FFF1F2',
              border: '1px solid #FECDD3',
            }}
          >
            <AlertCircle size={16} className="text-[#F43F5E] shrink-0 mt-0.5" />
            <p className="text-sm text-[#BE123C]">{ERROR_MESSAGES[error] ?? ERROR_MESSAGES.inesperado}</p>
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-[54px] rounded-[14px] text-white font-bold text-base flex items-center justify-center gap-2 mt-2 transition-all duration-200 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.97]"
          style={{
            background: 'linear-gradient(135deg, #4F46E5, #6D28D9)',
            boxShadow: isLoading ? 'none' : '0 4px 14px rgba(79,70,229,0.35)',
          }}
        >
          {isLoading ? (
            <><Loader2 size={18} className="animate-spin" /> Ingresando...</>
          ) : (
            <><span>Entrar</span><LogIn size={18} /></>
          )}
        </button>

        {/* Forgot password */}
        <p className="text-center mt-2">
          <Link href="/recuperar" className="text-sm font-semibold text-[#4F46E5] hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        </p>
      </form>
    </div>
  )
}
