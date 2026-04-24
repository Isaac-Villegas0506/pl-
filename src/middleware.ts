import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const PUBLIC_ROUTES = ['/login', '/recuperar', '/actualizar-password', '/api/auth/callback']

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route))
}

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user, supabase } = await updateSession(request)
  const path = request.nextUrl.pathname

  if (isPublicRoute(path)) {
    if (user) {
      const { data: perfilData } = await supabase
        .from('usuarios')
        .select('*')
        .eq('auth_id', user.id)
        .single()

      const perfil = perfilData as any

      const destino =
        perfil?.rol === 'administrador'
          ? '/admin/dashboard'
          : perfil?.rol === 'profesor'
            ? '/profesor/dashboard'
            : '/inicio'

      return NextResponse.redirect(new URL(destino, request.url))
    }

    return supabaseResponse
  }

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const { data: perfilData } = await supabase
    .from('usuarios')
    .select('*')
    .eq('auth_id', user.id)
    .single()

  const perfil = perfilData as any

  const rol = perfil?.rol

  if (path.startsWith('/admin') && rol !== 'administrador') {
    return NextResponse.redirect(new URL('/inicio', request.url))
  }

  if (
    path.startsWith('/profesor') &&
    rol !== 'profesor' &&
    rol !== 'administrador'
  ) {
    return NextResponse.redirect(new URL('/inicio', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
