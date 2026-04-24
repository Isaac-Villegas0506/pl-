'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, XCircle, SearchX } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { LecturaCard } from '@/components/lecturas'
import { EmptyState, Spinner } from '@/components/ui'
import type { LecturaConRelaciones } from '@/types/app.types'
import type { FiltrosOpciones, FiltrosActivos } from './types'
import { getLecturasExplorar } from './queries'
import FiltrosBarra from './FiltrosBarra'
import FiltroModal from './FiltroModal'
import LecturaSkeletonCard from './LecturaSkeletonCard'

interface ExplorarContentProps {
  lecturasIniciales: LecturaConRelaciones[]
  totalInicial: number
  filtrosOpciones: FiltrosOpciones
  filtrosIniciales: FiltrosActivos
}

type FiltroKey = 'grado' | 'materia' | 'nivel' | 'autor'

export default function ExplorarContent({
  lecturasIniciales,
  totalInicial,
  filtrosOpciones,
  filtrosIniciales,
}: ExplorarContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const supabaseRef = useRef(createClient())

  const [lecturas, setLecturas] = useState<LecturaConRelaciones[]>(lecturasIniciales)
  const [total, setTotal] = useState(totalInicial)
  const [page, setPage] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(lecturasIniciales.length < totalInicial)
  const [error, setError] = useState(false)

  const [busqueda, setBusqueda] = useState(filtrosIniciales.q)
  const [filtros, setFiltros] = useState<FiltrosActivos>(filtrosIniciales)
  const [filtroAbierto, setFiltroAbierto] = useState<FiltroKey | null>(null)

  // Sync URL with filters
  const syncUrl = useCallback(
    (f: FiltrosActivos) => {
      const params = new URLSearchParams()
      if (f.q) params.set('q', f.q)
      if (f.grado) params.set('grado', f.grado)
      if (f.materia) params.set('materia', f.materia)
      if (f.nivel) params.set('nivel', f.nivel)
      if (f.autor) params.set('autor', f.autor)
      const qs = params.toString()
      router.replace(`/explorar${qs ? `?${qs}` : ''}`, { scroll: false })
    },
    [router]
  )

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (busqueda !== filtros.q) {
        const newFiltros = { ...filtros, q: busqueda }
        setFiltros(newFiltros)
        ejecutarBusqueda(newFiltros)
        syncUrl(newFiltros)
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [busqueda]) // eslint-disable-line react-hooks/exhaustive-deps

  // Infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && !isLoading) {
          cargarMas()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, isLoadingMore, isLoading, page]) // eslint-disable-line react-hooks/exhaustive-deps

  async function ejecutarBusqueda(f: FiltrosActivos) {
    setIsLoading(true)
    setError(false)
    setPage(0)

    try {
      const result = await getLecturasExplorar(supabaseRef.current, f, 0)
      setLecturas(result.data)
      setTotal(result.count)
      setHasMore(result.data.length < result.count)
    } catch {
      setError(true)
      setLecturas([])
      setTotal(0)
    } finally {
      setIsLoading(false)
    }
  }

  async function cargarMas() {
    const nextPage = page + 1
    setIsLoadingMore(true)

    try {
      const result = await getLecturasExplorar(supabaseRef.current, filtros, nextPage)
      setLecturas((prev) => [...prev, ...result.data])
      setPage(nextPage)
      setHasMore(lecturas.length + result.data.length < result.count)
    } catch {
      // silently fail
    } finally {
      setIsLoadingMore(false)
    }
  }

  function handleFiltroChange(key: FiltroKey, value: string | undefined) {
    const newFiltros = { ...filtros, [key]: value }
    setFiltros(newFiltros)
    ejecutarBusqueda(newFiltros)
    syncUrl(newFiltros)
  }

  function limpiarTodo() {
    const clean: FiltrosActivos = { q: '', grado: undefined, materia: undefined, nivel: undefined, autor: undefined }
    setBusqueda('')
    setFiltros(clean)
    ejecutarBusqueda(clean)
    syncUrl(clean)
  }

  function clearSearch() {
    setBusqueda('')
    const newFiltros = { ...filtros, q: '' }
    setFiltros(newFiltros)
    ejecutarBusqueda(newFiltros)
    syncUrl(newFiltros)
  }

  function getDropdownOpciones(): { id: string; nombre: string }[] {
    if (filtroAbierto === 'grado') return filtrosOpciones.grados.map((g) => ({ id: g.id, nombre: g.nombre }))
    if (filtroAbierto === 'materia') return filtrosOpciones.materias.map((m) => ({ id: m.id, nombre: m.nombre }))
    if (filtroAbierto === 'nivel') return filtrosOpciones.niveles.map((n) => ({ id: n.id, nombre: n.nombre }))
    if (filtroAbierto === 'autor') return filtrosOpciones.autores.map((a) => ({ id: a.autor, nombre: a.autor }))
    return []
  }

  function getDropdownTitulo(): string {
    if (filtroAbierto === 'grado') return 'Filtrar por Grado'
    if (filtroAbierto === 'materia') return 'Filtrar por Materia'
    if (filtroAbierto === 'nivel') return 'Filtrar por Nivel'
    if (filtroAbierto === 'autor') return 'Filtrar por Autor'
    return ''
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F4F8]">
      {/* HEADER STICKY */}
      <div className="sticky top-0 z-30 bg-white px-4 pt-4 pb-3 border-b border-[#F1F5F9]">
        {/* Fila 1: Título + Search icon */}
        <div className="flex items-center justify-between max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-[#0F172A]">Explorar</h1>
          <button
            onClick={() => searchInputRef.current?.focus()}
            className="cursor-pointer text-[#0F172A]"
          >
            <Search size={22} />
          </button>
        </div>

        {/* Fila 2: Búsqueda */}
        <div className="mt-3 max-w-md mx-auto">
          <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[12px] px-3.5 py-[11px]">
            <Search size={16} className="text-[#94A3B8] shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar libros, autores..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-[#0F172A] placeholder:text-[#94A3B8]"
            />
            {busqueda && (
              <button onClick={clearSearch} className="cursor-pointer">
                <XCircle size={16} className="text-[#94A3B8]" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* BARRA DE FILTROS STICKY */}
      <div className="sticky top-[108px] z-20 bg-white px-4 pb-3 pt-2">
        <div className="max-w-md mx-auto">
          <FiltrosBarra
            filtros={filtros}
            filtrosOpciones={filtrosOpciones}
            onLimpiarTodo={limpiarTodo}
            onAbrirDropdown={(key) => setFiltroAbierto(key)}
            onLimpiarFiltro={(key) => handleFiltroChange(key, undefined)}
          />
        </div>
      </div>

      {/* RESULTADOS */}
      <div className="flex-1 px-4 mt-3 pb-8">
        <div className="max-w-md mx-auto">
          {/* Contador */}
          {!isLoading && !error && (
            <p className="text-sm text-[#94A3B8] mb-3">
              {total} {total === 1 ? 'lectura encontrada' : 'lecturas encontradas'}
            </p>
          )}

          {/* Loading inicial */}
          {isLoading && (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <LecturaSkeletonCard key={i} />
              ))}
            </div>
          )}

          {/* Error */}
          {error && !isLoading && (
            <EmptyState
              icon={SearchX}
              title="Error al cargar lecturas"
              description="Intenta de nuevo."
              action={{ label: 'Reintentar', onClick: () => ejecutarBusqueda(filtros) }}
            />
          )}

          {/* Sin resultados */}
          {!isLoading && !error && lecturas.length === 0 && (
            <EmptyState
              icon={SearchX}
              title="Sin resultados"
              description="Intenta con otros términos o cambia los filtros"
              action={{ label: 'Limpiar filtros', onClick: limpiarTodo }}
            />
          )}

          {/* Lista */}
          {!isLoading && !error && lecturas.length > 0 && (
            <div className="space-y-3">
              {lecturas.map((lectura) => (
                <LecturaCard
                  key={lectura.id}
                  lectura={lectura}
                  variant="horizontal"
                  onPress={() => router.push(`/lectura/${lectura.id}`)}
                />
              ))}
            </div>
          )}

          {/* Sentinel para infinite scroll */}
          <div ref={sentinelRef} className="h-4" />

          {/* Loading more */}
          {isLoadingMore && (
            <div className="flex justify-center py-4">
              <Spinner size="md" />
            </div>
          )}

          {/* No more results */}
          {!hasMore && lecturas.length > 0 && !isLoading && (
            <p className="text-sm text-[#94A3B8] text-center py-4">
              Has visto todas las lecturas
            </p>
          )}
        </div>
      </div>

      {/* FILTRO MODAL */}
      <FiltroModal
        isOpen={!!filtroAbierto}
        onClose={() => setFiltroAbierto(null)}
        titulo={getDropdownTitulo()}
        opciones={getDropdownOpciones()}
        valorActual={filtroAbierto ? filtros[filtroAbierto] : undefined}
        onSeleccionar={(value) => {
          if (filtroAbierto) handleFiltroChange(filtroAbierto, value)
        }}
      />
    </div>
  )
}
