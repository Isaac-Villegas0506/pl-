'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Bell, BookOpen, CheckCircle, ChevronRight,
  Sun, CloudSun, Moon, Clock as ClockIcon, AlertCircle,
} from 'lucide-react'
import { SectionHeader, EmptyState } from '@/components/ui'
import { LecturaCard, LecturaCardHorizontalLarge } from '@/components/lecturas'
import type { UsuarioSesion, LecturaConRelaciones } from '@/types/app.types'
import type { LecturaEnProgresoConDetalle, AsignacionConLectura } from './types'
import BuscadorHome from './BuscadorHome'
import AccesoRapido from './AccesoRapido'
import { registrarActividadHoyAction } from '../perfil/actions'

function getSaludo(nombre: string): { saludo: string; Icon: any } {
  const hora = new Date().getHours()
  if (hora >= 5  && hora < 12) return { saludo: `¡Buenos días, ${nombre}!`,  Icon: Sun }
  if (hora >= 12 && hora < 18) return { saludo: `¡Buenas tardes, ${nombre}!`, Icon: CloudSun }
  return { saludo: `¡Buenas noches, ${nombre}!`, Icon: Moon }
}

function diasRestantes(fechaLimite: string | null): number | null {
  if (!fechaLimite) return null
  return Math.ceil((new Date(fechaLimite).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

interface InicioContentProps {
  usuario: UsuarioSesion
  lecturaEnProgreso: LecturaEnProgresoConDetalle | null
  recomendados: LecturaConRelaciones[]
  pendientes: AsignacionConLectura[]
  notificacionesCount: number
}

export default function InicioContent({
  usuario,
  lecturaEnProgreso,
  recomendados,
  pendientes,
  notificacionesCount,
}: InicioContentProps) {
  const router = useRouter()

  useEffect(() => {
    if (usuario?.id) {
      registrarActividadHoyAction(usuario.id).catch(console.error)
    }
  }, [usuario?.id])

  function navegar(ruta: string) {
    router.push(ruta)
  }

  const nombreCorto = usuario.nombre?.split(' ')[0] ?? 'Estudiante'
  const { saludo, Icon: SaludoIcon } = getSaludo(nombreCorto)

  return (
    <div style={{ padding: '20px 16px 100px' }}>
      {/*
       * All sections are direct children of .inicio-grid.
       * CSS `order` controls the mobile flow.
       * CSS `grid-column` controls the desktop 2-column layout.
       */}
      <div className="inicio-grid">

        {/* ── 1. HEADER ── */}
        <div className="inicio-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <SaludoIcon size={14} color="#F59E0B" strokeWidth={2.5} />
                <p style={{ fontSize: '13px', color: '#94A3B8', fontWeight: 500 }}>
                  {saludo}
                </p>
              </div>
              <h1 style={{
                fontSize: '26px', fontWeight: 800, color: '#0F172A',
                lineHeight: '1.15', marginTop: '4px',
              }}>
                Inicio
              </h1>
            </div>

            <button
              onClick={() => navegar('/notificaciones')}
              style={{
                width: '44px', height: '44px',
                background: 'white', border: 'none', borderRadius: '16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', position: 'relative',
                boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
              }}
            >
              <Bell size={20} color="#64748B" strokeWidth={2} />
              {notificacionesCount > 0 && (
                <span style={{
                  position: 'absolute', top: '10px', right: '10px',
                  width: '8px', height: '8px',
                  background: '#F43F5E', borderRadius: '50%',
                  border: '2px solid white',
                }} />
              )}
            </button>
          </div>
        </div>

        {/* ── 2. SEARCH ── */}
        <div className="inicio-search">
          <BuscadorHome onSearch={(q) => navegar(`/explorar?q=${encodeURIComponent(q)}`)} />
        </div>

        {/* ── 3. QUICK ACCESS ── */}
        <section className="inicio-quick">
          <SectionHeader title="Accesos Rápidos" />
          <AccesoRapido onNavegar={navegar} />
        </section>

        {/* ── 4. PENDIENTES (notification-style) ── */}
        <section className="inicio-pending">
          <SectionHeader
            title="Pendientes"
            linkText="Ver todos"
            onLinkPress={() => navegar('/mis-libros?filtro=pendientes')}
          />
          {pendientes.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {pendientes.map((asig) => {
                const dias = diasRestantes(asig.fecha_limite ?? null)
                const esUrgente = dias !== null && dias <= 3
                return (
                  <div
                    key={asig.asignacion_id}
                    onClick={() => navegar(`/lectura/${asig.lectura_id}`)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '12px 14px',
                      background: esUrgente ? '#FEF2F2' : 'white',
                      borderRadius: '16px',
                      border: esUrgente ? '1.5px solid #FECACA' : '1.5px solid #F1F5F9',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                      transition: 'transform 0.15s',
                    }}
                  >
                    {/* Icono */}
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '12px',
                      background: esUrgente ? '#FEE2E2' : '#EEF2FF',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {esUrgente
                        ? <AlertCircle size={18} color="#EF4444" strokeWidth={2.5} />
                        : <ClockIcon size={18} color="#4F46E5" strokeWidth={2} />
                      }
                    </div>

                    {/* Texto */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: '14px', fontWeight: 700, color: '#0F172A',
                        lineHeight: '1.3',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {asig.titulo}
                      </p>
                      <p style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 500, marginTop: '2px' }}>
                        {asig.materia_nombre ?? asig.autor}
                        {dias !== null && (
                          <span style={{
                            color: esUrgente ? '#EF4444' : '#64748B',
                            fontWeight: esUrgente ? 700 : 500,
                          }}>
                            {' · '}{dias <= 0 ? 'Vencida' : `${dias}d restantes`}
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Flecha */}
                    <ChevronRight size={16} color="#CBD5E1" />
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{
              background: 'white', borderRadius: '24px', padding: '28px 20px',
              boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
              border: '1px solid #F8FAFC',
              display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
            }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '16px',
                background: '#F8FAFC',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '12px',
              }}>
                <CheckCircle size={28} color="#94A3B8" strokeWidth={1.5} />
              </div>
              <p style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
                ¡Al día con tus lecturas!
              </p>
              <p style={{ fontSize: '13px', color: '#94A3B8', marginTop: '4px' }}>
                No tienes lecturas pendientes por ahora
              </p>
            </div>
          )}
        </section>

        {/* ── 5. CONTINUE READING ── */}
        <section className="inicio-continue">
          <SectionHeader
            title="Continuar leyendo"
            linkText="Ver todos"
            onLinkPress={() => navegar('/mis-libros?filtro=en_progreso')}
          />
          {lecturaEnProgreso ? (
            <LecturaCardHorizontalLarge
              lectura={{
                id: lecturaEnProgreso.lectura_id,
                titulo: lecturaEnProgreso.titulo,
                autor: lecturaEnProgreso.autor,
                descripcion: null,
                portada_url: lecturaEnProgreso.portada_url,
                es_global: false,
                estado: 'publicado',
                materias: null,
                categorias: lecturaEnProgreso.categoria_nombre
                  ? { nombre: lecturaEnProgreso.categoria_nombre }
                  : null,
                niveles_dificultad: null,
                grados: null,
              }}
              progreso={lecturaEnProgreso.porcentaje}
              capitulo={lecturaEnProgreso.pagina_actual}
              onPress={() => navegar(`/lectura/${lecturaEnProgreso.lectura_id}`)}
            />
          ) : (
            <div style={{
              background: 'white', borderRadius: '24px', padding: '40px 20px',
              boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
              border: '1px solid #F8FAFC',
              display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
            }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '24px',
                background: '#EEF2FF',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '16px',
              }}>
                <BookOpen size={32} color="#818CF8" strokeWidth={1.5} />
              </div>
              <p style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>
                Sin lecturas activas
              </p>
              <p style={{ fontSize: '14px', color: '#94A3B8', marginTop: '6px', maxWidth: '280px' }}>
                Explora y comienza tu primera lectura para ver tu progreso aquí.
              </p>
              <button
                onClick={() => navegar('/explorar')}
                style={{
                  marginTop: '20px',
                  background: '#4F46E5', color: 'white',
                  border: 'none', borderRadius: '14px',
                  padding: '10px 24px', fontSize: '14px', fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(79,70,229,0.3)',
                }}
              >
                Explorar biblioteca
              </button>
            </div>
          )}
        </section>

        {/* ── 6. RECOMMENDED ── */}
        <section className="inicio-recommended">
          <SectionHeader title="Recomendados para ti" />
          {recomendados.length > 0 ? (
            <div className="recomendados-grid">
              {recomendados.map((lectura, i) => (
                <div
                  key={lectura.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}
                >
                  <LecturaCard
                    lectura={lectura}
                    variant="vertical"
                    onPress={() => navegar(`/lectura/${lectura.id}`)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              background: 'white', borderRadius: '24px', padding: '28px 20px',
              boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
              border: '1px solid #F8FAFC',
              display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
            }}>
              <EmptyState
                icon={BookOpen}
                title="Sin recomendaciones"
                description="Pronto aparecerán lecturas para ti"
              />
            </div>
          )}
        </section>

      </div>
    </div>
  )
}
