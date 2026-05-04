'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  ChevronLeft, Bookmark, BookOpen, User, GraduationCap,
  FileText, HelpCircle, Download, Clock,
} from 'lucide-react'
import { obtenerGradientePortada, formatFecha } from '@/lib/utils'
import { toggleFavoritoAction } from './actions'
import type { LecturaDetalleCompleta, ProgresoLectura, AsignacionDetalle } from './types'

interface LecturaDetalleContentProps {
  lectura: LecturaDetalleCompleta
  progreso: ProgresoLectura | null
  asignacion: AsignacionDetalle | null
  totalPreguntas: number
  esFavorito: boolean
  usuarioId: string
}

export default function LecturaDetalleContent({
  lectura,
  progreso,
  asignacion,
  totalPreguntas,
  esFavorito,
  usuarioId,
}: LecturaDetalleContentProps) {
  const router = useRouter()
  const [favoritoLocal, setFavoritoLocal] = useState(esFavorito)
  const [isTogglingFav, setIsTogglingFav] = useState(false)

  async function handleToggleFavorito() {
    if (isTogglingFav) return
    setIsTogglingFav(true)
    const newFav = !favoritoLocal
    setFavoritoLocal(newFav)

    try {
      const result = await toggleFavoritoAction(lectura.id, usuarioId, favoritoLocal)
      setFavoritoLocal(result.esFavorito)
    } catch (e) {
      setFavoritoLocal(!newFav)
    } finally {
      setIsTogglingFav(false)
    }
  }

  const yaEmpezo = progreso && progreso.porcentaje > 0
  const yaCompleto = progreso?.terminado === true
  const pdfUrl = lectura.archivos.find((a) => a.tipo === 'pdf')?.url
  const porcentaje = progreso?.porcentaje || 0

  const fechaLimiteProxima = asignacion?.fecha_limite
    ? (new Date(asignacion.fecha_limite).getTime() - Date.now()) / (1000 * 60 * 60 * 24) < 3
    : false

  return (
    <div style={{ minHeight: '100vh', background: 'white' }}>
      
      {/* HEADER NAV (Floating) */}
      <div 
        className="lectura-floating-header"
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          padding: '20px', display: 'flex', justifyContent: 'space-between',
          pointerEvents: 'none'
        }}
      >
        <button
          onClick={() => router.back()}
          className="hide-desktop"
          style={{
            width: '44px', height: '44px',
            background: 'white', borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', pointerEvents: 'auto',
            boxShadow: '0 10px 25px rgba(0,0,0,0.08)', border: 'none',
          }}
        >
          <ChevronLeft size={22} color="#0F172A" strokeWidth={2.5} />
        </button>

        <button
          onClick={handleToggleFavorito}
          style={{
            width: '44px', height: '44px',
            background: 'white', borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', pointerEvents: 'auto',
            boxShadow: '0 10px 25px rgba(0,0,0,0.08)', border: 'none',
          }}
        >
          <Bookmark
            size={22}
            color={favoritoLocal ? '#4F46E5' : '#94A3B8'}
            fill={favoritoLocal ? '#4F46E5' : 'none'}
            strokeWidth={2}
          />
        </button>
      </div>

      <div className="estudiante-container" style={{ paddingBottom: '140px' }}>
        <div className="lectura-detalle-grid">
          
          {/* PORTADA (Left Column on Desktop, Top on Mobile) */}
          <div style={{ position: 'relative' }}>
            <div 
              className="lectura-portada-hero"
              style={{
                width: '100%', height: '480px',
                borderRadius: '0 0 40px 40px',
                overflow: 'hidden',
                background: obtenerGradientePortada(lectura.id),
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                position: 'relative'
              }}
            >
              {lectura.portada_url ? (
                <Image
                  src={lectura.portada_url}
                  alt={lectura.titulo}
                  fill
                  style={{ objectFit: 'cover' }}
                  priority
                />
              ) : (
                <div style={{
                  height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'column', gap: '16px', color: 'rgba(255,255,255,0.4)'
                }}>
                  <BookOpen size={80} strokeWidth={1} />
                </div>
              )}
            </div>
          </div>

          {/* CONTENIDO (Right Column on Desktop) */}
          <div style={{ padding: '32px 24px' }}>
            
            {/* Categoria */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', 
              padding: '6px 16px', background: '#EEF2FF', color: '#4F46E5',
              fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', 
              letterSpacing: '0.1em', borderRadius: '99px', marginBottom: '16px'
            }}>
              {lectura.categorias?.nombre || lectura.materias?.nombre || 'General'}
            </div>
            
            {/* Titulo */}
            <h1 style={{
              fontSize: '36px', fontWeight: 900, color: '#0F172A',
              lineHeight: '1.1', marginBottom: '16px', letterSpacing: '-0.02em'
            }}>
              {lectura.titulo}
            </h1>
            
            {/* Autor */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <User size={20} color="#64748B" strokeWidth={1.5} />
              <span style={{ fontSize: '18px', color: '#64748B', fontWeight: 600 }}>
                {lectura.autor}
              </span>
            </div>

            {/* Grado / Meta */}
            <div style={{ 
              display: 'inline-flex', alignItems: 'center', gap: '10px', 
              padding: '10px 20px', background: '#F8FAFC', borderRadius: '99px', 
              marginBottom: '40px', color: '#0F172A', boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
              border: '1px solid #F1F5F9'
            }}>
              <GraduationCap size={20} color="#0F172A" strokeWidth={1.5} />
              <span style={{ fontSize: '14px', fontWeight: 700 }}>
                {lectura.grados?.nombre || 'Nivel General'}
              </span>
            </div>

            {/* Sinopsis */}
            <div style={{ borderTop: '1.5px solid #F1F5F9', paddingTop: '32px', marginBottom: '40px', maxWidth: '560px' }}>
              <h3 style={{ 
                fontSize: '11px', fontWeight: 900, color: '#94A3B8', 
                textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '12px' 
              }}>
                Sinopsis
              </h3>
              <p style={{ fontSize: '16px', color: '#475569', lineHeight: '1.7', fontWeight: 500 }}>
                {lectura.descripcion || 'Sin descripción disponible para esta lectura.'}
              </p>
            </div>

            {/* Reading Progress */}
            <div style={{ maxWidth: '560px', marginBottom: '40px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>Progreso de Lectura</h3>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#64748B' }}>
                  {porcentaje}% leído
                </span>
              </div>
              <div style={{ height: '12px', width: '100%', background: '#F1F5F9', borderRadius: '99px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    height: '100%', background: '#75B268', borderRadius: '99px',
                    width: `${porcentaje}%`, transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' 
                  }}
                />
              </div>
            </div>

            {/* Mision / Asignacion */}
            {asignacion && (
              <div style={{
                background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: '32px',
                padding: '32px', marginBottom: '32px',
              }}>
                <h3 style={{ fontSize: '12px', fontWeight: 900, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
                  Tu Misión
                </h3>
                {asignacion.instrucciones && (
                  <p style={{ fontSize: '15px', color: '#475569', marginBottom: '20px', lineHeight: '1.6', fontWeight: 500 }}>
                    {asignacion.instrucciones}
                  </p>
                )}
                {asignacion.fecha_limite && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={18} color={fechaLimiteProxima ? '#EF4444' : '#94A3B8'} strokeWidth={2} />
                    <span style={{ fontSize: '14px', fontWeight: 800, color: fechaLimiteProxima ? '#EF4444' : '#64748B' }}>
                      Vence el {formatFecha(asignacion.fecha_limite)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Evaluacion Stats */}
            {totalPreguntas > 0 && (
              <div style={{
                background: '#F0F9FF', border: '1.5px solid #BAE6FD',
                borderRadius: '32px', padding: '32px', display: 'flex', gap: '20px', alignItems: 'flex-start'
              }}>
                <HelpCircle size={28} color="#0284C7" strokeWidth={2} />
                <div>
                  <p style={{ fontSize: '18px', fontWeight: 800, color: '#0369A1' }}>
                    Evaluación de {totalPreguntas} {totalPreguntas === 1 ? 'pregunta' : 'preguntas'}
                  </p>
                  <p style={{ fontSize: '14px', color: '#075985', marginTop: '6px', fontWeight: 500, lineHeight: '1.5' }}>
                    Recuerda prestar mucha atención a los detalles para obtener el mejor puntaje.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FIXED ACTION BAR / FOOTER */}
      <footer 
        className="lectura-action-bar"
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 90,
          height: '96px',
          background: 'white',
          borderTop: '1px solid #F1F5F9',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 40px',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.05)',
        }}
      >
        {/* Left Side: Social Proof (Desktop only or adjusted) */}
        <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid white', overflow: 'hidden', position: 'relative', zIndex: 3 }}>
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuC70paqcml_teBTt3cH0EQa7xORNEWWc4DaTkzZeSGtsSAwfAOwPjZ_wWl48CmQfcgJNf8UBUyHTVPW9Z5ksywVhSVFoB3tnIe1SwGkLfNMPwothEproi1EZZH1CL9DAuU3LIYFVGDR5RJ1PpQucHA82jl2UVKlEPqc7jKSEM_DhafnqRs9XtsakCqrJ01YVX4EZEjqv4jnTJA6fF8H4nDI9KQwkPTnQoRXrXQ2-uXTD5NfI7ESLmAJbPFegg5JESmDsdu-3qFdpyc" alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid white', overflow: 'hidden', position: 'relative', zIndex: 2, marginLeft: '-12px' }}>
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAl-MST0DKuNv4LHN_Gmp_4kiqEH6Jl5gXCDJpnS5vR4Q7iAroqOuE3roufxN1HGNqUtM-T4i3ZBMBA7oES1r-3ISqcFZfHH2cU0qdn2kPfHS9vtydxzdqj3D6qinUZAHKl11ZpLjSaJA1x0-TSUFDkvm7WP-GLBKoRops7KtFpx9bGi9GL_D4q4X72ywXYeqWHhVPGScH2d2-CDB0g5_NCAJh2NPIRpLYswlaPbQ8ul8-i-tzgQdRtlS74542U02FjD285_wO1Nq4" alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ 
              width: '36px', height: '36px', borderRadius: '50%', border: '2px solid white', 
              background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', fontWeight: 800, color: '#475569', marginLeft: '-12px', zIndex: 1 
            }}>
              +12
            </div>
          </div>
          <p style={{ fontSize: '14px', color: '#64748B', fontWeight: 500 }}>
            Otros 12 alumnos están leyendo esto ahora
          </p>
        </div>

        {/* Right Side: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, justifyContent: 'flex-end' }}>
          {pdfUrl && (
            <button
              onClick={() => window.open(pdfUrl, '_blank')}
              className="btn-descargar-footer"
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '0 20px', height: '56px',
                background: 'white', border: '1.5px solid #E2E8F0', borderRadius: '99px',
                color: '#0F172A', fontSize: '15px', fontWeight: 700,
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              <Download size={18} strokeWidth={2.5} />
              <span className="hide-mobile">Descargar PDF</span>
            </button>
          )}

          <button
            onClick={() => {
              if (yaCompleto && totalPreguntas > 0 && asignacion) {
                router.push(`/evaluacion/${asignacion.id}`)
              } else {
                router.push(`/lectura/${lectura.id}/leer`)
              }
            }}
            className="btn-continuar-footer"
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              justifyContent: 'center',
              padding: '0 40px', height: '56px',
              background: '#4F46E5', border: 'none', borderRadius: '99px',
              color: 'white', fontSize: '18px', fontWeight: 800,
              cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: '0 10px 30px rgba(79,70,229,0.25)',
              width: 'auto',
              flex: 'none'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <BookOpen size={22} color="white" strokeWidth={2.5} />
            {yaCompleto && totalPreguntas > 0 ? 'Ver Resultados' : (yaEmpezo ? 'Continuar Lectura' : 'Empezar a Leer')}
          </button>
        </div>
      </footer>
    </div>
  )
}
