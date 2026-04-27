'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Eye, EyeOff } from 'lucide-react'
import ProfesorTopBar from '@/components/layout/ProfesorTopBar'
import { createClient } from '@/lib/supabase/client'
import ToastGlobal, { mostrarToast } from '@/components/ui/ToastGlobal'

export default function CambiarPasswordPage() {
  const router = useRouter()
  const supabase = createClient()
  const [password, setPassword] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [mostrar, setMostrar] = useState(false)
  const [cargando, setCargando] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) {
      mostrarToast('error', 'La contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (password !== confirmar) {
      mostrarToast('error', 'Las contraseñas no coinciden.')
      return
    }

    setCargando(true)
    const { error } = await supabase.auth.updateUser({ password })
    setCargando(false)

    if (error) {
      mostrarToast('error', error.message)
    } else {
      mostrarToast('exito', 'Contraseña actualizada correctamente')
      setTimeout(() => router.push('/profesor/perfil'), 1500)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', height: '52px',
    border: '1.5px solid #E5E7EB', borderRadius: '16px',
    padding: '0 48px 0 16px', fontSize: '15px', color: '#111827',
    background: '#F9FAFB', outline: 'none', fontFamily: 'inherit',
    boxSizing: 'border-box', transition: 'all 0.2s',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'white' }}>
      <ProfesorTopBar title="Cambiar contraseña" showBack />
      <ToastGlobal />

      <form onSubmit={handleSubmit} style={{ padding: '24px 20px', maxWidth: '400px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '24px',
            background: 'linear-gradient(135deg, #EEF2FF, #F5F3FF)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(79,70,229,0.12)'
          }}>
            <Lock size={36} color="#4F46E5" />
          </div>
        </div>

        <p style={{ fontSize: '20px', fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: '8px' }}>
          Actualiza tu seguridad
        </p>
        <p style={{ fontSize: '14px', color: '#6B7280', textAlign: 'center', marginBottom: '32px' }}>
          Ingresa una nueva contraseña para tu cuenta de profesor.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ position: 'relative' }}>
            <p style={{ fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>Nueva contraseña</p>
            <input
              type={mostrar ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={inputStyle}
              placeholder="Mínimo 6 caracteres"
              required
            />
            <button type="button" onClick={() => setMostrar(!mostrar)} style={{ position: 'absolute', right: '14px', top: '38px', background: 'none', border: 'none', cursor: 'pointer' }}>
              {mostrar ? <EyeOff size={20} color="#9CA3AF" /> : <Eye size={20} color="#9CA3AF" />}
            </button>
          </div>

          <div style={{ position: 'relative' }}>
            <p style={{ fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>Confirmar contraseña</p>
            <input
              type={mostrar ? 'text' : 'password'}
              value={confirmar}
              onChange={e => setConfirmar(e.target.value)}
              style={inputStyle}
              placeholder="Repite tu nueva contraseña"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={cargando || !password || !confirmar}
          style={{
            width: '100%', height: '56px', borderRadius: '16px', border: 'none',
            background: cargando || !password || !confirmar ? '#E5E7EB' : 'linear-gradient(135deg, #4F46E5, #6D28D9)',
            color: cargando || !password || !confirmar ? '#9CA3AF' : 'white',
            fontSize: '16px', fontWeight: '800', cursor: cargando || !password || !confirmar ? 'not-allowed' : 'pointer',
            boxShadow: cargando || !password || !confirmar ? 'none' : '0 8px 24px rgba(79,70,229,0.3)',
            marginTop: '32px', fontFamily: 'inherit', transition: 'all 0.2s',
          }}
        >
          {cargando ? 'Actualizando...' : 'Guardar contraseña'}
        </button>
      </form>
    </div>
  )
}
