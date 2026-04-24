'use client'

import { useRouter } from 'next/navigation'
import { Bell, BookOpen, CheckCircle } from 'lucide-react'
import { SectionHeader, EmptyState } from '@/components/ui'
import { LecturaCard, LecturaCardHorizontalLarge } from '@/components/lecturas'
import type { UsuarioSesion, LecturaConRelaciones } from '@/types/app.types'
import type { LecturaEnProgresoConDetalle, AsignacionConLectura } from './types'
import BuscadorHome from './BuscadorHome'
import AccesoRapido from './AccesoRapido'

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

  function navegar(ruta: string) {
    router.push(ruta)
  }

  const nombreCorto = usuario.nombre?.split(' ')[0] ?? 'Estudiante'

  return (
    <div style={{
      maxWidth: '480px',
      margin: '0 auto',
      padding: '20px 16px 24px',
      minHeight: '100vh',
    }}>
      {/* HEADER */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '16px',
      }}>
        <div>
          <p style={{ fontSize: '13px', color: '#9CA3AF', fontWeight: 500 }}>
            ¡Hola, {nombreCorto}! 👋
          </p>
          <h1 style={{
            fontSize: '28px', fontWeight: 800, color: '#111827',
            lineHeight: '1.1', marginTop: '2px',
            fontFamily: 'var(--font-nunito)',
          }}>
            Inicio
          </h1>
        </div>
        <button
          onClick={() => navegar('/notificaciones')}
          style={{
            width: '40px', height: '40px',
            background: '#F5F3FF',
            border: 'none', borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', position: 'relative',
            flexShrink: 0,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}
        >
          <Bell size={20} color="#6B7280" strokeWidth={1.8} />
          {notificacionesCount > 0 && (
            <span style={{
              position: 'absolute', top: '6px', right: '6px',
              width: '8px', height: '8px',
              background: '#F43F5E', borderRadius: '50%',
              border: '1.5px solid white',
            }} />
          )}
        </button>
      </div>

      {/* SEARCH */}
      <div style={{ marginBottom: '24px' }}>
        <BuscadorHome onSearch={(q) => navegar(`/explorar?q=${encodeURIComponent(q)}`)} />
      </div>

      {/* ACCESOS RÁPIDOS */}
      <div style={{ marginBottom: '28px' }}>
        <AccesoRapido onNavegar={navegar} />
      </div>

      {/* CONTINUAR LEYENDO */}
      <div style={{ marginBottom: '28px' }}>
        <SectionHeader
          title="Continuar leyendo"
          linkText="Ver todos"
          onLinkPress={() => navegar('/mis-libros?filtro=en_progreso')}
        />
        <div className="mt-3">
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
            <EmptyState
              icon={BookOpen}
              title="Sin lecturas activas"
              description="Explora y comienza tu primera lectura"
            />
          )}
        </div>
      </div>

      {/* RECOMENDADOS */}
      <div style={{ marginBottom: '28px' }}>
        <SectionHeader title="Recomendados para ti" />
        <div style={{ marginTop: '12px' }}>
          {recomendados.length > 0 ? (
            <div style={{
              display: 'flex', gap: '14px',
              overflowX: 'auto', paddingBottom: '8px',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              marginLeft: '-16px',
              paddingLeft: '16px',
              paddingRight: '16px',
            }}>
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
            <EmptyState
              icon={BookOpen}
              title="Sin recomendaciones"
              description="Pronto aparecerán lecturas para ti"
            />
          )}
        </div>
      </div>

      {/* PENDIENTES */}
      <div style={{ marginBottom: '28px' }}>
        <SectionHeader
          title="Pendientes"
          linkText="Ver todos"
          onLinkPress={() => navegar('/mis-libros?filtro=pendientes')}
        />
        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {pendientes.length > 0 ? (
            pendientes.map((asig, i) => (
              <div
                key={asig.asignacion_id}
                className="animate-slide-up"
                style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}
              >
                <LecturaCard
                  lectura={{
                    id: asig.lectura_id,
                    titulo: asig.titulo,
                    autor: asig.autor,
                    descripcion: null,
                    portada_url: asig.portada_url,
                    es_global: false,
                    estado: 'publicado',
                    materias: asig.materia_nombre
                      ? { nombre: asig.materia_nombre, color: asig.materia_color }
                      : null,
                    categorias: null,
                    niveles_dificultad: null,
                    grados: null,
                  }}
                  variant="horizontal"
                  onPress={() => navegar(`/lectura/${asig.lectura_id}`)}
                />
              </div>
            ))
          ) : (
            <EmptyState
              icon={CheckCircle}
              title="¡Al día con tus lecturas!"
              description="No tienes lecturas pendientes por ahora"
            />
          )}
        </div>
      </div>
    </div>
  )
}
