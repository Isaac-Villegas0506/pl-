import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TopBar from '@/components/layout/TopBar'
import LecturaCard from '@/components/lecturas/LecturaCard'
import EmptyState from '@/components/ui/EmptyState'

export const dynamic = 'force-dynamic'

export default async function FavoritosPage() {
  const supabase = await createClient()

  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) redirect('/login')

  const { data: perfil } = await (supabase as any)
    .from('usuarios')
    .select('id, rol')
    .eq('auth_id', authData.user.id)
    .single()

  if (!perfil) redirect('/login')

  // Obtener favoritos
  const { data: favoritosData } = await (supabase as any)
    .from('favoritos')
    .select(`
      id,
      lectura:lecturas(
        id, titulo, autor, portada_url,
        materias(nombre)
      )
    `)
    .eq('usuario_id', perfil.id)
    .order('created_at', { ascending: false })

  const favoritos = favoritosData?.map((f: any) => f.lectura) || []

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', paddingBottom: '100px' }}>
      <TopBar title="Mis Favoritos" />

      <div className="estudiante-container" style={{ padding: '32px 20px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#111827', lineHeight: '1.1' }}>
            Mis Favoritos
          </h1>
          <p style={{ fontSize: '15px', color: '#64748B', marginTop: '8px', fontWeight: 500 }}>
            Tus lecturas guardadas para leer cuando quieras.
          </p>
        </div>

        {favoritos.length > 0 ? (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', 
            gap: '24px' 
          }}>
            {favoritos.map((lectura: any) => (
              <LecturaCard
                key={lectura.id}
                lectura={lectura}
                variant="vertical"
              />
            ))}
          </div>
        ) : (
          <div style={{ marginTop: '20px' }}>
            <EmptyState
              title="Aún no tienes favoritos"
              description="Explora la biblioteca y guarda las lecturas que más te gusten usando el ícono de marcador."
            />
          </div>
        )}
      </div>
    </div>
  )
}
