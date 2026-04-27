import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CambiarPasswordContent from './CambiarPasswordContent'

export default async function CambiarPasswordPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return <CambiarPasswordContent />
}
