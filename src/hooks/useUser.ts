'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { UsuarioSesion } from '@/types/app.types'

export function useUser() {
  const [user, setUser] = useState<UsuarioSesion | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function fetchPerfil(authId: string) {
      const { data } = await supabase
        .from('usuarios')
        .select('*')
        .eq('auth_id', authId)
        .single()

      if (data) {
        setUser({
          id: (data as any).id,
          auth_id: (data as any).auth_id,
          email: (data as any).email,
          nombre: (data as any).nombre,
          apellido: (data as any).apellido,
          rol: (data as any).rol,
          avatar_url: (data as any).avatar_url,
        })
      }
      setIsLoading(false)
    }

    supabase.auth.getUser().then(({ data: { user: authUser } }) => {
      if (authUser) {
        fetchPerfil(authUser.id)
      } else {
        setIsLoading(false)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchPerfil(session.user.id)
      } else {
        setUser(null)
        setIsLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return { user, isLoading }
}
