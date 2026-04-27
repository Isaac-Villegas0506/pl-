import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function crearProfesor() {
  console.log('🔄 Creando usuario profesor...\n')

  const email = 'profesor@planlectura.com'
  const password = 'Prof123!'

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError) {
    if (authError.message.includes('already been registered')) {
      console.log('⚠️  El usuario ya existe en Auth. Buscando su ID...')
      const { data: listData } = await supabase.auth.admin.listUsers()
      const existing = listData?.users?.find(u => u.email === email)

      if (existing) {
        console.log(`   Auth ID: ${existing.id}`)
        const { data: perfil } = await supabase
          .from('usuarios')
          .select('id')
          .eq('auth_id', existing.id)
          .maybeSingle()

        if (perfil) {
          console.log('✅ El perfil de profesor ya existe.')
        } else {
          await supabase.from('usuarios').insert({
            auth_id: existing.id,
            email,
            nombre: 'Ana',
            apellido: 'García',
            rol: 'profesor',
            activo: true,
          })
          console.log('✅ Perfil profesor creado.')
        }
      }
    } else {
      console.error('❌ Error:', authError.message)
      return
    }
  } else {
    console.log(`✅ Usuario creado en Auth. ID: ${authData.user.id}`)
    const { error: insertError } = await supabase.from('usuarios').insert({
      auth_id: authData.user.id,
      email,
      nombre: 'Ana',
      apellido: 'García',
      rol: 'profesor',
      activo: true,
    })
    if (insertError) {
      console.error('❌ Error al crear perfil:', insertError.message)
      return
    }
    console.log('✅ Perfil profesor creado.')
  }

  console.log('\n📋 Credenciales del profesor:')
  console.log('   Email:    profesor@planlectura.com')
  console.log('   Password: Prof123!')
  console.log('   Nombre:   Ana García')
  console.log('   Rol:      profesor')
  console.log('\n🚀 Acceso: /profesor/dashboard\n')
}

crearProfesor().catch(console.error)
