import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { Spinner } from '@/components/ui'
import { getFiltrosOpciones, getLecturasExplorar } from './queries'
import type { FiltrosActivos } from './types'
import ExplorarContent from './ExplorarContent'

interface ExplorarPageProps {
  searchParams: Promise<{
    q?: string
    grado?: string
    materia?: string
    nivel?: string
    autor?: string
  }>
}

export default async function ExplorarPage({ searchParams }: ExplorarPageProps) {
  const params = await searchParams
  const supabase = await createClient()

  const filtrosIniciales: FiltrosActivos = {
    q: params.q ?? '',
    grado: params.grado,
    materia: params.materia,
    nivel: params.nivel,
    autor: params.autor,
  }

  const [filtrosOpciones, lecturasResult] = await Promise.all([
    getFiltrosOpciones(supabase),
    getLecturasExplorar(supabase, filtrosIniciales, 0),
  ])

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <Spinner size="lg" />
        </div>
      }
    >
      <ExplorarContent
        lecturasIniciales={lecturasResult.data}
        totalInicial={lecturasResult.count}
        filtrosOpciones={filtrosOpciones}
        filtrosIniciales={filtrosIniciales}
      />
    </Suspense>
  )
}
