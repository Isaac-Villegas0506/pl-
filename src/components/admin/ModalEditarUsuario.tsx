'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { editarUsuarioAction } from '@/app/(admin)/admin/actions'
import type { UsuarioConDetalle, EditarUsuarioInput } from '@/app/(admin)/admin/types'

type Rol = 'administrador' | 'profesor' | 'estudiante'

const BADGE_ESTILOS: Record<Rol, { background: string; color: string }> = {
  administrador: { background: '#0F172A', color: 'white' },
  profesor:      { background: '#4F46E5', color: 'white' },
  estudiante:    { background: '#10B981', color: 'white' },
}

interface Props {
  usuario: UsuarioConDetalle
  isOpen: boolean
  onClose: () => void
  onGuardado: (u: UsuarioConDetalle) => void
}

export default function ModalEditarUsuario({ usuario, isOpen, onClose, onGuardado }: Props) {
  const [nombre, setNombre] = useState(usuario.nombre)
  const [apellido, setApellido] = useState(usuario.apellido)
  const [email, setEmail] = useState(usuario.email)
  const [dni, setDni] = useState(usuario.dni ?? '')
  const [rol, setRol] = useState<Rol>(usuario.rol)
  const [activo, setActivo] = useState(usuario.activo)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  async function handleGuardar() {
    setError(null)
    if (!nombre.trim() || !apellido.trim() || !email.trim()) {
      setError('Nombre, apellido y email son obligatorios.')
      return
    }
    setCargando(true)

    const datos: EditarUsuarioInput = {
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      email: email.trim().toLowerCase(),
      dni: dni.trim() || undefined,
      rol,
      activo,
      auth_id: email !== usuario.email ? usuario.auth_id : undefined,
    }

    const result = await editarUsuarioAction(usuario.id, datos)
    setCargando(false)

    if (!result.success) {
      setError(result.error ?? 'Error al guardar')
      return
    }

    onGuardado({ ...usuario, nombre: datos.nombre!, apellido: datos.apellido!, email: datos.email!, dni: datos.dni ?? null, rol, activo })
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', height: '48px',
    border: '1.5px solid #E5E7EB', borderRadius: '12px',
    padding: '0 14px', fontSize: '14px', color: '#111827',
    outline: 'none', background: 'white', fontFamily: 'inherit',
    boxSizing: 'border-box',
  }

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 300,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* Bottom sheet */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        zIndex: 301, background: 'white',
        borderRadius: '24px 24px 0 0',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.2)',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '12px', paddingBottom: '4px' }}>
          <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: '#E5E7EB' }} />
        </div>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 20px 16px',
          borderBottom: '1px solid #F3F4F6',
        }}>
          <p style={{ fontSize: '17px', fontWeight: '800', color: '#111827' }}>Editar usuario</p>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} color="#9CA3AF" />
          </button>
        </div>

        {/* Form */}
        <div style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '5px' }}>
                Nombre *
              </label>
              <input style={inputStyle} value={nombre} onChange={e => setNombre(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '5px' }}>
                Apellido *
              </label>
              <input style={inputStyle} value={apellido} onChange={e => setApellido(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '5px' }}>
                Email *
              </label>
              <input type="email" style={inputStyle} value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '5px' }}>
                DNI
              </label>
              <input style={inputStyle} value={dni} onChange={e => setDni(e.target.value)} />
            </div>

            {/* ROL */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '8px' }}>
                Rol
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {(['estudiante', 'profesor', 'administrador'] as Rol[]).map(r => {
                  const sel = rol === r
                  const estilos = BADGE_ESTILOS[r]
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRol(r)}
                      style={{
                        flex: 1, height: '36px', borderRadius: '10px', border: 'none',
                        background: sel ? estilos.background : '#F3F4F6',
                        color: sel ? estilos.color : '#9CA3AF',
                        fontSize: '11px', fontWeight: '800', cursor: 'pointer',
                        textTransform: 'capitalize', letterSpacing: '0.03em',
                        transition: 'all 0.2s',
                      }}
                    >
                      {r.slice(0, 5)}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* ACTIVO TOGGLE */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 0', borderTop: '1px solid #F3F4F6',
            }}>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '700', color: '#111827' }}>Cuenta activa</p>
                <p style={{ fontSize: '12px', color: '#9CA3AF' }}>El usuario puede iniciar sesión</p>
              </div>
              <button
                type="button"
                onClick={() => setActivo(!activo)}
                style={{
                  width: '48px', height: '28px', borderRadius: '14px', border: 'none',
                  background: activo ? '#4F46E5' : '#E5E7EB',
                  position: 'relative', cursor: 'pointer', transition: 'background 0.2s',
                }}
              >
                <div style={{
                  position: 'absolute', top: '3px',
                  left: activo ? '23px' : '3px',
                  width: '22px', height: '22px', borderRadius: '50%',
                  background: 'white',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                  transition: 'left 0.2s',
                }} />
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              background: '#FFF1F2', borderRadius: '10px', padding: '10px 14px',
              marginTop: '12px',
            }}>
              <p style={{ fontSize: '13px', color: '#BE123C', fontWeight: '600' }}>{error}</p>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px', paddingBottom: '24px' }}>
            <button
              onClick={onClose}
              style={{
                flex: 1, height: '48px', borderRadius: '14px',
                background: 'white', border: '1.5px solid #E5E7EB',
                fontSize: '14px', fontWeight: '700', color: '#6B7280', cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleGuardar}
              disabled={cargando}
              style={{
                flex: 2, height: '48px', borderRadius: '14px',
                background: cargando ? '#9CA3AF' : 'linear-gradient(135deg, #4F46E5, #6D28D9)',
                border: 'none', fontSize: '14px', fontWeight: '800',
                color: 'white', cursor: cargando ? 'not-allowed' : 'pointer',
              }}
            >
              {cargando ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
