'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Camera, Check, CheckCircle2, ChevronLeft, Loader2 as Spinner } from 'lucide-react'
import { UsuarioPerfil } from '../types'
import CampoInput from '@/components/ui/CampoInput'
import { actualizarPerfilAction, obtenerUrlAvatarAction } from '../actions'
import { createClient } from '@/lib/supabase/client'

const COLORES_DISPONIBLES = [
  '#4F46E5', '#7C3AED', '#DB2777', '#E11D48',
  '#EA580C', '#D97706', '#059669', '#0891B2'
]

export default function EditarPerfilContent({ usuario }: { usuario: UsuarioPerfil }) {
  const router = useRouter()
  const inputFileRef = useRef<HTMLInputElement>(null)
  
  const [nombre, setNombre] = useState(usuario.nombre || '')
  const [apellido, setApellido] = useState(usuario.apellido || '')
  const [bio, setBio] = useState(usuario.bio || '')
  const [colorPerfil, setColorPerfil] = useState(usuario.color_perfil || '#4F46E5')
  
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [cambiosGuardados, setCambiosGuardados] = useState(false)

  const hayCambios = 
    nombre !== usuario.nombre ||
    apellido !== usuario.apellido ||
    bio !== (usuario.bio || '') ||
    colorPerfil !== (usuario.color_perfil || '#4F46E5') ||
    avatarFile !== null

  const handleImagenSeleccionada = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no debe superar los 5MB')
      return
    }

    setAvatarFile(file)
    const url = URL.createObjectURL(file)
    setAvatarPreview(url)
  }

  const handleGuardar = async () => {
    if (isSaving || !hayCambios) return
    
    const newErrors: Record<string, string> = {}
    if (!nombre.trim()) newErrors.nombre = 'Requerido'
    if (!apellido.trim()) newErrors.apellido = 'Requerido'
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    setErrors({})
    setIsSaving(true)

    try {
      let finalAvatarUrl = usuario.avatar_url
      
      if (avatarFile) {
        const supabase = createClient()
        const ext = avatarFile.name.split('.').pop()
        const ruta = `${usuario.auth_id}/avatar.${ext}`
        
        const { error: uploadError } = await supabase.storage
          .from('avatares')
          .upload(ruta, avatarFile, {
            upsert: true,
            cacheControl: '3600'
          })
          
        if (uploadError) throw uploadError
        
        const { url } = await obtenerUrlAvatarAction(usuario.auth_id, ext!)
        if (url) finalAvatarUrl = url
      }

      const res = await actualizarPerfilAction({
        nombre,
        apellido,
        bio,
        colorPerfil,
        avatarUrl: finalAvatarUrl || undefined
      })

      if (!res.success) {
        throw new Error(res.error)
      }

      setCambiosGuardados(true)
      router.refresh()
      
      setTimeout(() => {
        setCambiosGuardados(false)
        router.back()
      }, 1500)
      
    } catch (error: any) {
      console.error(error)
      alert(error.message || 'Error al guardar los cambios')
    } finally {
      setIsSaving(false)
    }
  }

  // Cleanup de la URL del preview para evitar memory leaks
  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview)
      }
    }
  }, [avatarPreview])

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', paddingBottom: 'calc(144px + env(safe-area-inset-bottom, 0px))' }}>
      {/* HEADER */}
      <div style={{
        background: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px',
        borderBottom: '1px solid #F3F4F6',
        position: 'sticky', top: 0, zIndex: 40,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
            Editar perfil
          </h1>
        </div>
        <button
          onClick={handleGuardar}
          disabled={isSaving || !hayCambios}
          style={{
            fontSize: '15px', fontWeight: '700',
            color: isSaving || !hayCambios ? '#9CA3AF' : '#4F46E5',
            background: 'none', border: 'none', cursor: isSaving || !hayCambios ? 'not-allowed' : 'pointer',
          }}
        >
          Guardar
        </button>
      </div>

      {/* FOTO DE PERFIL */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '28px 20px 20px',
        background: 'white', marginBottom: '8px',
      }}>
        <div style={{ position: 'relative', cursor: 'pointer' }}
          onClick={() => inputFileRef.current?.click()}>
          <div style={{
            width: '100px', height: '100px', borderRadius: '28px',
            overflow: 'hidden', position: 'relative',
            background: colorPerfil + '44',
            border: `3px solid ${colorPerfil}`,
            boxShadow: `0 8px 24px ${colorPerfil}44`,
          }}>
            {avatarPreview || usuario.avatar_url ? (
              <Image
                src={avatarPreview ?? usuario.avatar_url!}
                alt="Avatar"
                fill
                style={{ objectFit: 'cover' }}
              />
            ) : (
              <div style={{
                width: '100%', height: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: colorPerfil + '22',
              }}>
                <span style={{
                  fontSize: '36px', fontWeight: '800', color: colorPerfil,
                  fontFamily: 'var(--font-playfair, serif)',
                }}>
                  {nombre?.[0]}{apellido?.[0]}
                </span>
              </div>
            )}
          </div>
          <div style={{
            position: 'absolute', bottom: '-4px', right: '-4px',
            width: '32px', height: '32px',
            background: colorPerfil,
            borderRadius: '50%', border: '2.5px solid white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}>
            <Camera size={15} color="white" strokeWidth={2.5} />
          </div>
        </div>

        <input
          ref={inputFileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style={{ display: 'none' }}
          onChange={handleImagenSeleccionada}
        />

        <p style={{
          fontSize: '14px', fontWeight: '700', color: '#4F46E5',
          marginTop: '12px', cursor: 'pointer',
        }}
          onClick={() => inputFileRef.current?.click()}>
          Cambiar foto
        </p>
        <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>
          JPG, PNG o WebP · Máx. 5MB
        </p>
      </div>

      {/* COLOR DE PERFIL */}
      <div style={{
        background: 'white', padding: '20px',
        marginBottom: '8px',
      }}>
        <p style={{ fontSize: '14px', fontWeight: '700', color: '#374151',
          marginBottom: '16px' }}>
          Color del perfil
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {COLORES_DISPONIBLES.map((color) => (
            <button
              key={color}
              onClick={() => setColorPerfil(color)}
              style={{
                width: '48px', height: '48px', borderRadius: '50%',
                background: color, border: 'none', cursor: 'pointer',
                flexShrink: 0, position: 'relative',
                outline: colorPerfil === color ? `3px solid ${color}` : 'none',
                outlineOffset: '3px',
                transform: colorPerfil === color ? 'scale(1.1)' : 'scale(1)',
                transition: 'all 0.15s',
                boxShadow: colorPerfil === color
                  ? `0 4px 12px ${color}66`
                  : '0 2px 6px rgba(0,0,0,0.1)',
              }}
            >
              {colorPerfil === color && (
                <Check
                  size={20} color="white" strokeWidth={3}
                  style={{
                    position: 'absolute', inset: 0,
                    margin: 'auto',
                  }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* DATOS PERSONALES */}
      <div style={{
        background: 'white', padding: '20px', marginBottom: '8px',
      }}>
        <p style={{ fontSize: '14px', fontWeight: '700', color: '#374151',
          marginBottom: '16px' }}>
          Información personal
        </p>

        <CampoInput
          label="Nombre"
          value={nombre}
          onChange={setNombre}
          error={errors.nombre}
          placeholder="Tu nombre"
        />

        <CampoInput
          label="Apellido"
          value={apellido}
          onChange={setApellido}
          error={errors.apellido}
          placeholder="Tu apellido"
          style={{ marginTop: '14px' }}
        />

        <div style={{ marginTop: '14px' }}>
          <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151',
            display: 'block', marginBottom: '6px' }}>
            Presentación <span style={{ color: '#9CA3AF', fontWeight: '400' }}>(opcional)</span>
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, 120))}
            placeholder="Escribe algo sobre ti... (máx. 120 caracteres)"
            style={{
              width: '100%', height: '80px', borderRadius: '14px',
              border: '1.5px solid #E5E7EB', padding: '12px 14px',
              fontSize: '14px', color: '#111827', fontFamily: 'inherit',
              resize: 'none', outline: 'none', lineHeight: '1.5',
              background: '#FAFAFA',
            }}
          />
          <p style={{ fontSize: '11px', color: bio.length > 100 ? '#F59E0B' : '#9CA3AF',
            textAlign: 'right', marginTop: '4px' }}>
            {bio.length}/120
          </p>
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
          onClick={handleGuardar}
          disabled={isSaving || !hayCambios}
          style={{
            width: '100%', height: '52px',
            background: isSaving || !hayCambios
              ? '#E5E7EB'
              : `linear-gradient(135deg, ${colorPerfil}, ${colorPerfil}CC)`,
            color: isSaving || !hayCambios ? '#9CA3AF' : 'white',
            border: 'none', borderRadius: '14px',
            fontSize: '16px', fontWeight: '700',
            cursor: isSaving || !hayCambios ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit', display: 'flex',
            alignItems: 'center', justifyContent: 'center', gap: '8px',
            transition: 'all 0.2s',
            boxShadow: isSaving || !hayCambios
              ? 'none' : `0 4px 14px ${colorPerfil}44`,
          }}
        >
          {isSaving ? (
            <>
              <Spinner size={18} color="white" className="animate-spin" />
              Guardando...
            </>
          ) : cambiosGuardados ? (
            <>
              <CheckCircle2 size={18} color="white" />
              ¡Guardado!
            </>
          ) : (
            'Guardar cambios'
          )}
        </button>
      </div>
    </div>
  )
}
