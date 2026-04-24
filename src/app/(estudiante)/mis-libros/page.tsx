import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function MisLibrosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="max-w-md mx-auto px-4 py-4">
      <h1 className="text-2xl font-bold text-[#0F172A]">Mis Libros</h1>
      <p className="text-sm text-[#475569] mt-2">Esta pantalla se construirá próximamente.</p>
    </div>
  )
}
