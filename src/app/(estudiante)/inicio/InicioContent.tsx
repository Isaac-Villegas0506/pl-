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
    <div className="max-w-md mx-auto px-4 pt-5 pb-28 animate-fade-in">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[#9CA3AF] font-medium">¡Hola, {nombreCorto}! 👋</p>
          <h1
            className="text-[28px] font-extrabold text-[#111827] leading-tight"
            style={{ fontFamily: 'var(--font-nunito)' }}
          >
            Inicio
          </h1>
        </div>
        <button
          onClick={() => navegar('/notificaciones')}
          className="relative w-10 h-10 rounded-[12px] bg-[#F5F3FF] flex items-center justify-center cursor-pointer transition-all active:scale-90 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
        >
          <Bell size={20} className="text-[#6B7280]" />
          {notificacionesCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#F43F5E]" />
          )}
        </button>
      </div>

      {/* SEARCH */}
      <div className="mt-4">
        <BuscadorHome onSearch={(q) => navegar(`/explorar?q=${encodeURIComponent(q)}`)} />
      </div>

      {/* ACCESOS RÁPIDOS */}
      <div className="mt-7">
        <AccesoRapido onNavegar={navegar} />
      </div>

      {/* CONTINUAR LEYENDO */}
      <div className="mt-7">
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
      <div className="mt-7">
        <SectionHeader title="Recomendados para ti" />
        <div className="mt-3">
          {recomendados.length > 0 ? (
            <div className="flex gap-3.5 overflow-x-auto pb-2 scrollbar-hide -mr-4 pr-4">
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
      <div className="mt-7">
        <SectionHeader
          title="Pendientes"
          linkText="Ver todos"
          onLinkPress={() => navegar('/mis-libros?filtro=pendientes')}
        />
        <div className="mt-3 space-y-3">
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
