import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const ruta = req.nextUrl.searchParams.get('ruta')
  if (!ruta) return NextResponse.json({ error: 'Ruta requerida' }, { status: 400 })

  // Extraer bucket y path de la URL de Supabase
  // Formato: https://xxx.supabase.co/storage/v1/object/public/lecturas-pdf/archivo.pdf
  const partes = ruta.split('/storage/v1/object/public/')
  if (partes.length < 2) return NextResponse.json({ url: ruta }) // URL pública directa

  const [bucket, ...pathPartes] = partes[1].split('/')
  const path = pathPartes.join('/')

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 60 * 60) // 1 hora de validez

  if (error) return NextResponse.json({ error: 'Error al firmar URL' }, { status: 500 })
  return NextResponse.json({ url: data.signedUrl })
}
