'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  BookOpen,
  User,
  ChevronLeft,
  AlertCircle,
  CheckCircle,
  Loader2,
} from 'lucide-react'
import InputField from '@/components/ui/InputField'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

export default function RecuperarPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const isValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!email.trim() || !isValidEmail(email)) {
      setError('Ingresa un email válido.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/actualizar-password`,
        }
      )

      if (resetError) {
        setError('Ocurrió un error. Intenta nuevamente.')
        setIsLoading(false)
        return
      }

      setSent(true)
    } catch {
      setError('Ocurrió un error inesperado. Intenta nuevamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm animate-fade-in-up">
      {/* Flecha de regreso */}
      <Link
        href="/login"
        className="inline-flex items-center gap-1 text-sm text-[#475569] hover:text-[#0F172A] transition-colors mb-6"
      >
        <ChevronLeft size={18} />
        Volver al inicio
      </Link>

      {/* Logo */}
      <div className="flex justify-center">
        <div className="w-[100px] h-[100px] rounded-[20px] bg-[#B2D8D0] flex flex-col items-center justify-center gap-1">
          <BookOpen size={48} className="text-[#2F7A6E]" />
          <span className="text-[10px] font-semibold tracking-wider text-[#2F7A6E] uppercase">
            Plan de Lectura
          </span>
        </div>
      </div>

      {sent ? (
        /* Estado de éxito */
        <div className="text-center mt-8 animate-fade-in">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-[#D1FAE5] flex items-center justify-center">
              <CheckCircle size={32} className="text-[#10B981]" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-[#0F172A]">
            ¡Revisa tu email!
          </h2>
          <p className="text-sm text-[#475569] mt-2 leading-relaxed">
            Si el email existe en el sistema, recibirás las instrucciones en
            breve.
          </p>
          <Link
            href="/login"
            className="inline-block mt-6 text-sm text-[#2563EB] hover:underline font-medium"
          >
            Volver al login
          </Link>
        </div>
      ) : (
        <>
          {/* Títulos */}
          <h1 className="text-2xl font-bold text-[#0F172A] text-center mt-6">
            Recuperar acceso
          </h1>
          <p className="text-sm text-[#475569] text-center mt-2">
            Ingresa tu email institucional y te enviaremos instrucciones
          </p>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <InputField
              label="Email institucional"
              type="email"
              placeholder="ejemplo@escuela.edu"
              value={email}
              onChange={setEmail}
              icon={User}
              disabled={isLoading}
            />

            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                'w-full py-3.5 rounded-[12px] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-150 mt-6',
                isLoading
                  ? 'bg-[#2563EB]/70 cursor-not-allowed'
                  : 'bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-[0.98]'
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar instrucciones'
              )}
            </button>

            {error && (
              <div className="flex items-start gap-2.5 bg-[#FEF2F2] border border-[#FECACA] rounded-lg px-3.5 py-2.5 animate-fade-in">
                <AlertCircle
                  size={16}
                  className="text-[#EF4444] shrink-0 mt-0.5"
                />
                <p className="text-sm text-[#DC2626]">{error}</p>
              </div>
            )}

            <p className="text-center mt-4">
              <Link
                href="/login"
                className="text-sm text-[#2563EB] hover:underline"
              >
                Volver al login
              </Link>
            </p>
          </form>
        </>
      )}
    </div>
  )
}
