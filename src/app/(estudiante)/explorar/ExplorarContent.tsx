'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, XCircle, SearchX, Bookmark, BookOpen, Bell, SlidersHorizontal, ChevronDown } from 'lucide-react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { EmptyState, Spinner } from '@/components/ui'
import { obtenerGradientePortada } from '@/lib/utils'
import type { LecturaConRelaciones } from '@/types/app.types'
import type { FiltrosOpciones, FiltrosActivos } from './types'
import { getLecturasExplorar } from './queries'
import FiltroModal from './FiltroModal'

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

  const [busqueda, setBusqueda] = useState(filtrosIniciales.q || '')
  const [filtros, setFiltros] = useState<FiltrosActivos>(filtrosIniciales)
  const [filtroAbierto, setFiltroAbierto] = useState<FiltroKey | null>(null)
  const [orden, setOrden] = useState('Relevancia')

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
      if (busqueda !== (filtros.q || '')) {
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

  function getDropdownOpciones(): { id: string; nombre: string }[] {
    if (filtroAbierto === 'grado') return filtrosOpciones.grados.map((g) => ({ id: g.id, nombre: g.nombre }))
    if (filtroAbierto === 'materia') return filtrosOpciones.materias.map((m) => ({ id: m.id, nombre: m.nombre }))
    if (filtroAbierto === 'nivel') return filtrosOpciones.niveles.map((n) => ({ id: n.id, nombre: n.nombre }))
    if (filtroAbierto === 'autor') return filtrosOpciones.autores.map((a) => ({ id: a.autor, nombre: a.autor }))
    return []
  }

  function getFiltroLabel(key: FiltroKey): string {
    const labels: Record<FiltroKey, string> = {
      grado: 'Grado',
      materia: 'Materia',
      nivel: 'Nivel',
      autor: 'Autor',
    }
    return labels[key]
  }

  function getDropdownTitulo(): string {
    if (!filtroAbierto) return ''
    return `Filtrar por ${getFiltroLabel(filtroAbierto)}`
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFF', padding: '32px 24px 100px' }}>
      <div className="estudiante-container">
        
        {/* BEGIN: Header Section */}
        <header style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          marginBottom: '40px',
        }} className="explorar-header-row">
          <div style={{ flexShrink: 0 }}>
            <h1 style={{ fontSize: '30px', fontWeight: 800, color: '#0F172A', fontFamily: 'var(--font-nunito)' }}>
              Explorar
            </h1>
            <p style={{ fontSize: '14px', color: '#64748B', marginTop: '4px', fontWeight: 500 }}>
              Encuentra tu próxima gran aventura entre cientos de libros.
            </p>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            flex: 1,
            maxWidth: '100%',
          }}>
            <div style={{
              position: 'relative',
              flex: 1,
              background: 'white',
              borderRadius: '20px',
              padding: '0 16px 0 48px',
              height: '56px',
              display: 'flex',
              alignItems: 'center',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
              border: '2px solid transparent',
              transition: 'all 0.2s',
            }}>
              <Search 
                size={20} 
                color="#94A3B8" 
                style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} 
              />
              <input
                ref={searchInputRef}
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar libros, autores..."
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#0F172A',
                }}
              />
              {busqueda && (
                <button 
                  onClick={() => setBusqueda('')} 
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                >
                  <XCircle size={18} color="#CBD5E1" />
                </button>
              )}
            </div>

            <button style={{
              width: '56px', height: '56px',
              background: 'white', border: 'none', borderRadius: '20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
              cursor: 'pointer', color: '#64748B'
            }}>
              <Bell size={22} />
            </button>
          </div>
        </header>

        {/* BEGIN: Filter Section */}
        <section style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={limpiarTodo}
              style={{
                padding: '10px 20px',
                background: Object.values(filtros).every(v => !v) ? '#4F46E5' : 'white',
                color: Object.values(filtros).every(v => !v) ? 'white' : '#64748B',
                borderRadius: '999px',
                fontSize: '14px',
                fontWeight: 700,
                border: Object.values(filtros).every(v => !v) ? 'none' : '1.5px solid #E2E8F0',
                cursor: 'pointer',
                boxShadow: Object.values(filtros).every(v => !v) ? '0 4px 12px rgba(79, 70, 229, 0.2)' : 'none',
              }}
            >
              Todos
            </button>
            
            {(['grado', 'materia', 'autor'] as FiltroKey[]).map((key) => {
              const valor = filtros[key]
              let label = getFiltroLabel(key)
              if (valor) {
                if (key === 'grado') label = filtrosOpciones.grados.find(g => g.id === valor)?.nombre ?? label
                else if (key === 'materia') label = filtrosOpciones.materias.find(m => m.id === valor)?.nombre ?? label
                else label = valor
              }
              return (
                <button
                  key={key}
                  onClick={() => setFiltroAbierto(key)}
                  style={{
                    padding: '10px 20px',
                    background: valor ? '#EEF2FF' : 'white',
                    color: valor ? '#4F46E5' : '#64748B',
                    borderRadius: '999px',
                    fontSize: '14px',
                    fontWeight: 600,
                    border: valor ? '1.5px solid #4F46E5' : '1.5px solid #E2E8F0',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  {label}
                  <ChevronDown size={14} />
                </button>
              )
            })}
          </div>
        </section>

        {/* BEGIN: Results Info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '32px',
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>
            {isLoading ? 'Buscando...' : `${total} ${total === 1 ? 'lectura encontrada' : 'lecturas encontradas'}`}
          </h2>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#64748B', fontWeight: 600 }}>
            <span>Ordenar por:</span>
            <select 
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#4F46E5',
                fontWeight: 800,
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option>Relevancia</option>
              <option>Más recientes</option>
              <option>Populares</option>
            </select>
          </div>
        </div>

        {/* BEGIN: Grid Content */}
        {isLoading ? (
          <div className="explorar-premium-grid">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ aspectRatio: '3/4', background: '#E2E8F0', borderRadius: '32px', animation: 'pulse 1.5s infinite' }} />
                <div style={{ height: '20px', width: '60%', background: '#E2E8F0', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
                <div style={{ height: '24px', width: '90%', background: '#E2E8F0', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
              </div>
            ))}
          </div>
        ) : error ? (
          <EmptyState
            icon={SearchX}
            title="Error al cargar lecturas"
            description="Hubo un problema de conexión. Intenta de nuevo."
            action={{ label: 'Reintentar', onClick: () => ejecutarBusqueda(filtros) }}
          />
        ) : lecturas.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="Sin resultados"
            description="No encontramos libros que coincidan con tu búsqueda."
            action={{ label: 'Limpiar filtros', onClick: limpiarTodo }}
          />
        ) : (
          <div className="explorar-premium-grid">
            {lecturas.map((lectura) => {
              const gradient = obtenerGradientePortada(lectura.id)
              return (
                <div
                  key={lectura.id}
                  onClick={() => router.push(`/lectura/${lectura.id}`)}
                  style={{ display: 'flex', flexDirection: 'column', gap: '16px', cursor: 'pointer' }}
                  className="group"
                >
                  <div 
                    style={{
                      position: 'relative',
                      aspectRatio: '3/4',
                      background: gradient,
                      borderRadius: '32px',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease',
                    }}
                    className="book-card-container"
                  >
                    <button 
                      style={{
                        position: 'absolute', top: '16px', right: '16px',
                        width: '40px', height: '40px',
                        background: 'rgba(255,255,255,0.9)',
                        backdropFilter: 'blur(8px)',
                        border: 'none', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#4F46E5', zIndex: 10,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }}
                    >
                      <Bookmark size={20} />
                    </button>
                    
                    {lectura.portada_url ? (
                      <Image 
                        src={lectura.portada_url} 
                        alt={lectura.titulo} 
                        fill 
                        style={{ objectFit: 'cover' }} 
                      />
                    ) : (
                      <BookOpen size={64} color="rgba(255,255,255,0.3)" strokeWidth={1.5} />
                    )}
                  </div>
                  
                  <div style={{ padding: '0 8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ 
                      fontSize: '10px', 
                      fontWeight: 900, 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.1em', 
                      color: '#4F46E5' 
                    }}>
                      {lectura.materias?.nombre || 'General'}
                    </span>
                    <h3 style={{ 
                      fontSize: '17px', 
                      fontWeight: 800, 
                      color: '#0F172A', 
                      lineHeight: '1.2',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}>
                      {lectura.titulo}
                    </h3>
                    <p style={{ fontSize: '13px', color: '#64748B', fontWeight: 500 }}>
                      {lectura.autor}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Sentinel for infinite scroll */}
        <div ref={sentinelRef} style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isLoadingMore && <Spinner size="md" />}
        </div>

        {!hasMore && lecturas.length > 0 && (
          <p style={{ textAlign: 'center', fontSize: '14px', color: '#94A3B8', fontWeight: 600, padding: '20px 0' }}>
            Has llegado al final de la biblioteca ✨
          </p>
        )}
      </div>

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

      <style jsx global>{`
        .explorar-premium-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px 16px;
        }

        @media (min-width: 640px) {
          .explorar-premium-grid { grid-template-columns: repeat(3, 1fr); gap: 32px 24px; }
        }

        @media (min-width: 1024px) {
          .explorar-premium-grid { grid-template-columns: repeat(4, 1fr); }
          .explorar-header-row { flex-direction: row !important; align-items: center !important; }
        }

        @media (min-width: 1280px) {
          .explorar-premium-grid { grid-template-columns: repeat(5, 1fr); }
        }

        .book-card-container:hover {
          transform: translateY(-8px);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
