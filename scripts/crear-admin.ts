import { createClient } from '@supabase/supabase-js'
import { generateKey } from 'crypto'
import { lastDayOfDecade } from 'date-fns'
import { se } from 'date-fns/locale'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function crearAdmin() {
  console.log('🔄 Creando usuario administrador...\n')

  // Paso 1: Crear usuario en auth.users via Admin API
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: 'admin@planlectura.com',
    password: 'Admin123!',
    email_confirm: true, 
  })

  if (authError) {
    if (authError.message.includes('already been registered')) {
      console.log('⚠️  El usuario ya existe en Auth. Buscando su ID...')
      
      const { data: listData } = await supabase.auth.admin.listUsers()
      const existingUser = listData?.users?.find(u => u.email === 'admin@planlectura.com')
      
      if (existingUser) {
        console.log(`   Auth ID encontrado: ${existingUser.id}`)
        
        // Verificar si ya existe en nuestra tabla
        const { data: perfilExistente } = await supabase
          .from('usuarios')
          .select('id')
          .eq('auth_id', existingUser.id)
          .maybeSingle()

        if (perfilExistente) {
          console.log('✅ El perfil ya existe en la tabla usuarios.')
          console.log('\n📋 Credenciales:')
          console.log('   Email:    admin@planlectura.com')
          console.log('   Password: Admin123!')
          return
        }

        // Insertar perfil
        const { error: insertError } = await supabase
          .from('usuarios')
          .insert({
            auth_id: existingUser.id,
            email: 'admin@planlectura.com',
            nombre: 'Admin',
            apellido: 'Principal',
            rol: 'administrador',
            activo: true,
          })

        if (insertError) {
          console.error('❌ Error insertando perfil:', insertError.message)
          return
        }

        console.log('✅ Perfil creado en tabla usuarios.')
        console.log('\n📋 Credenciales:')
        console.log('   Email:    admin@planlectura.com')
        console.log('   Password: Admin123!')
        return
      }
    }

    console.error('❌ Error creando usuario:', authError.message)
    return
  }

  console.log(`✅ Usuario creado en Auth. ID: ${authData.user.id}`)

  // Paso 2: Insertar perfil en nuestra tabla usuarios
  const { error: insertError } = await supabase
    .from('usuarios')
    .insert({
      auth_id: authData.user.id,
      email: 'admin@planlectura.com',
      nombre: 'Admin',
      apellido: 'Principal',
      rol: 'administrador',
      activo: true,
    })

  if (insertError) {
    console.error('❌ Error insertando perfil:', insertError.message)
    return
  }

  console.log('✅ Perfil creado en tabla usuarios.')
  console.log('\n📋 Credenciales para iniciar sesión:')
  console.log('   Email:    admin@planlectura.com')
  console.log('   Password: Admin123!')
  console.log('\n🚀 Ve a http://localhost:3000/login y prueba!')
}

crearAdmin().catch(console.error)
