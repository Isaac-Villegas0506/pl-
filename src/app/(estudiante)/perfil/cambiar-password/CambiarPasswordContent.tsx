'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Shield, Eye, EyeOff, Check, CheckCircle2, Loader2 } from 'lucide-react'
import { cambiarPasswordAction } from '../actions'
import CampoInput from '@/components/ui/CampoInput'

export default function CambiarPasswordContent() {
  const router = useRouter()
  
  const [passwordActual, setPasswordActual] = useState('')
  const [passwordNueva, setPasswordNueva] = useState('')
  const [passwordConfirmar, setPasswordConfirmar] = useState('')
  
  const [mostrarActual, setMostrarActual] = useState(false)
  const [mostrarNueva, setMostrarNueva] = useState(false)
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false)
  
  const [fortaleza, setFortaleza] = useState<0 | 1 | 2 | 3 | 4>(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [exito, setExito] = useState(false)

  // Calcular fortaleza
  useEffect(() => {
    if (!passwordNueva) {
      setFortaleza(0)
      return
    }
    
    let f = 0
    if (passwordNueva.length >= 8) f++
    if (/[A-Z]/.test(passwordNueva) && /[a-z]/.test(passwordNueva)) f++
    if (/\d/.test(passwordNueva)) f++
    if (/[^A-Za-z0-9]/.test(passwordNueva)) f++
    
    setFortaleza(f as 1 | 2 | 3 | 4)
  }, [passwordNueva])

  const requisitos = [
    { texto: 'Mínimo 8 caracteres', cumple: passwordNueva.length >= 8 },
    { texto: 'Al menos una mayúscula', cumple: /[A-Z]/.test(passwordNueva) },
    { texto: 'Al menos un número', cumple: /\\d/.test(passwordNueva) },
  ]

  const contrasenasCoinciden = passwordNueva && passwordConfirmar && passwordNueva === passwordConfirmar
  const isValid = fortaleza >= 2 && contrasenasCoinciden && passwordActual.length > 0

  const handleActualizar = async () => {
    if (!isValid || isLoading) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const res = await cambiarPasswordAction(passwordActual, passwordNueva)
      
      if (!res.success) {
        throw new Error(res.error)
      }
      
      setExito(true)
      setTimeout(() => {
        router.back()
      }, 2000)
      
    } catch (err: any) {
      setError(err.message || 'Error al cambiar la contraseña')
    } finally {
      setIsLoading(false)
    }
  }

  const BotonOjo = ({ mostrar, setMostrar }: any) => (
    <button
      type="button"
      onClick={() => setMostrar(!mostrar)}
      style={{
        background: 'none', border: 'none', cursor: 'pointer',
        padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}
    >
      {mostrar ? (
        <EyeOff size={20} color="#9CA3AF" />
      ) : (
        <Eye size={20} color="#9CA3AF" />
      )}
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
          Cambiar contraseña
        </h1>
      </div>

      <div style={{ padding: '24px 20px calc(144px + env(safe-area-inset-bottom, 0px))' }}>
        {/* INTRO */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '20px',
            background: '#EEF2FF', margin: '0 auto 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Shield size={32} color="#4F46E5" />
          </div>
          <p style={{ fontSize: '15px', color: '#4B5563', lineHeight: '1.5' }}>
            Elige una contraseña segura que no uses en otros sitios
          </p>
        </div>

        {/* CONTRASEÑA ACTUAL */}
        <div style={{ marginBottom: '24px' }}>
          <CampoInput
            label="Contraseña actual"
            type={mostrarActual ? 'text' : 'password'}
            value={passwordActual}
            onChange={setPasswordActual}
            placeholder="Ingresa tu contraseña actual"
            rightElement={<BotonOjo mostrar={mostrarActual} setMostrar={setMostrarActual} />}
          />
          {error && (
            <p style={{ fontSize: '13px', color: '#F43F5E', fontWeight: '600', marginTop: '6px' }}>
              {error}
            </p>
          )}
        </div>

        <div style={{ height: '1px', background: '#E5E7EB', margin: '32px 0' }} />

        {/* NUEVA CONTRASEÑA */}
        <div style={{ marginBottom: '24px' }}>
          <CampoInput
            label="Nueva contraseña"
            type={mostrarNueva ? 'text' : 'password'}
            value={passwordNueva}
            onChange={setPasswordNueva}
            placeholder="Mínimo 8 caracteres"
            rightElement={<BotonOjo mostrar={mostrarNueva} setMostrar={setMostrarNueva} />}
          />
          
          {/* Indicador de fortaleza */}
          <div style={{ marginTop: '12px' }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} style={{
                  flex: 1, height: '4px', borderRadius: '99px',
                  background: i <= fortaleza
                    ? ['#F43F5E', '#F59E0B', '#84CC16', '#10B981'][fortaleza - 1]
                    : '#E5E7EB',
                  transition: 'background 0.3s ease',
                }} />
              ))}
            </div>
            <p style={{ fontSize: '11px', marginTop: '6px',
              color: ['#9CA3AF', '#F43F5E', '#F59E0B', '#84CC16', '#10B981'][fortaleza],
              fontWeight: '600' }}>
              {['Ingresa una contraseña', 'Muy débil', 'Regular', 'Buena', 'Muy segura'][fortaleza]}
            </p>
          </div>

          {/* Checklist */}
          <div style={{ marginTop: '16px' }}>
            {requisitos.map((req) => (
              <div key={req.texto} style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '6px 0',
              }}>
                <div style={{
                  width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
                  background: req.cumple ? '#10B981' : '#F3F4F6',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.2s',
                }}>
                  <Check size={10} color={req.cumple ? 'white' : '#D1D5DB'} strokeWidth={3} />
                </div>
                <span style={{ fontSize: '13px',
                  color: req.cumple ? '#374151' : '#9CA3AF', fontWeight: '500' }}>
                  {req.texto}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CONFIRMAR CONTRASEÑA */}
        <div>
          <CampoInput
            label="Confirmar nueva contraseña"
            type={mostrarConfirmar ? 'text' : 'password'}
            value={passwordConfirmar}
            onChange={setPasswordConfirmar}
            placeholder="Repite la nueva contraseña"
            rightElement={<BotonOjo mostrar={mostrarConfirmar} setMostrar={setMostrarConfirmar} />}
            error={
              passwordConfirmar.length > 0 && !contrasenasCoinciden
                ? 'Las contraseñas no coinciden'
                : undefined
            }
          />
        </div>
      </div>

      {/* BOTÓN GUARDAR FIJO */}
      <div className="fixed-action-bar" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 51,
        background: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid #F1F5F9',
        padding: '14px 20px',
        paddingBottom: 'calc(14px + env(safe-area-inset-bottom))',
      }}>
        <button
          onClick={handleActualizar}
          disabled={!isValid || isLoading || exito}
          style={{
            width: '100%', height: '52px',
            background: !isValid || isLoading || exito
              ? '#E5E7EB'
              : '#4F46E5',
            color: !isValid || isLoading || exito ? '#9CA3AF' : 'white',
            border: 'none', borderRadius: '14px',
            fontSize: '16px', fontWeight: '700',
            cursor: !isValid || isLoading || exito ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit', display: 'flex',
            alignItems: 'center', justifyContent: 'center', gap: '8px',
            transition: 'all 0.2s',
            boxShadow: !isValid || isLoading || exito
              ? 'none' : '0 4px 14px rgba(79,70,229,0.3)',
          }}
        >
          {isLoading ? (
            <>
              <Loader2 size={18} color="white" className="animate-spin" />
              Actualizando...
            </>
          ) : exito ? (
            <>
              <CheckCircle2 size={18} color="white" />
              ¡Contraseña actualizada!
            </>
          ) : (
            'Actualizar contraseña'
          )}
        </button>
      </div>
    </div>
  )
}
