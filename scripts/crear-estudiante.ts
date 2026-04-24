import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function crearEstudiante() {
  console.log('🔄 Creando usuario estudiante...\n')

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: 'estudiante@planlectura.com',
    password: 'Est123!',
    email_confirm: true,
  })

  if (authError) {
    if (authError.message.includes('already been registered')) {
      console.log('⚠️  El usuario ya existe en Auth. Buscando su ID...')
      const { data: listData } = await supabase.auth.admin.listUsers()
      const existing = listData?.users?.find(u => u.email === 'estudiante@planlectura.com')

      if (existing) {
        console.log(`   Auth ID: ${existing.id}`)
        const { data: perfil } = await supabase
          .from('usuarios')
          .select('id')
          .eq('auth_id', existing.id)
          .maybeSingle()

        if (perfil) {
          console.log('✅ Ya existe el perfil.')
        } else {
          await supabase.from('usuarios').insert({
            auth_id: existing.id,
            email: 'estudiante@planlectura.com',
            nombre: 'Isaac',
            apellido: 'Villegas',
            rol: 'estudiante',
            activo: true,
          })
          console.log('✅ Perfil estudiante creado.')
        }
      }
    } else {
      console.error('❌ Error:', authError.message)
      return
    }
  } else {
    console.log(`✅ Usuario creado en Auth. ID: ${authData.user.id}`)
    await supabase.from('usuarios').insert({
      auth_id: authData.user.id,
      email: 'estudiante@planlectura.com',
      nombre: 'Isaac',
      apellido: 'Villegas',
      rol: 'estudiante',
      activo: true,
    })
    console.log('✅ Perfil estudiante creado.')
  }

  console.log('\n📋 Credenciales:')
  console.log('   Email:    estudiante@planlectura.com')
  console.log('   Password: Est123!')
}

crearEstudiante().catch(console.error)
