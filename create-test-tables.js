import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ujbypxnkbzzuzwwgslfl.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqYnlweG5rYnp6dXp3d2dzbGZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MDA3MTQsImV4cCI6MjA3NTQ3NjcxNH0.0SuJM2UcADEcf--SM_dyGfq_rwxbX1z6X1RYDV_N2fo'

const supabase = createClient(supabaseUrl, supabaseKey)

async function createTestTables() {
  try {
    console.log('🔍 Verificando si existe el bar con UUID...')
    
    // Usar el UUID que está siendo usado en la consulta
    const barId = '6a4e514c-9de6-4d8d-ab1f-2c20d513df71'
    
    // Primero verificar si el bar existe
    const { data: existingBar, error: barError } = await supabase
      .from('bars')
      .select('*')
      .eq('id', barId)
      .single()
    
    if (barError && barError.code !== 'PGRST116') {
      console.error('❌ Error verificando bar:', barError)
      return
    }
    
    if (!existingBar) {
      console.log('📝 Creando bar de prueba...')
      const { data: newBar, error: createBarError } = await supabase
        .from('bars')
        .insert({
          id: barId,
          name: 'Bar de Prueba',
          description: 'Bar para pruebas de desarrollo',
          address: 'Calle Test 123',
          phone: '+34 123 456 789',
          email: 'test@bar.com',
          is_active: true
        })
        .select()
        .single()
      
      if (createBarError) {
        console.error('❌ Error creando bar:', createBarError)
        return
      }
      
      console.log('✅ Bar creado:', newBar)
    } else {
      console.log('✅ Bar ya existe:', existingBar.name)
    }
    
    // Ahora crear las mesas de prueba
    console.log('📝 Creando mesas de prueba...')
    
    const testTables = [
      {
        bar_id: barId,
        table_number: '1',
        table_name: 'Mesa 1',
        qr_code_value: `${barId}-mesa-1`,
        is_active: true
      },
      {
        bar_id: barId,
        table_number: '2',
        table_name: 'Mesa 2',
        qr_code_value: `${barId}-mesa-2`,
        is_active: true
      },
      {
        bar_id: barId,
        table_number: '3',
        table_name: 'Mesa 3',
        qr_code_value: `${barId}-mesa-3`,
        is_active: true
      }
    ]
    
    // Eliminar mesas existentes primero
    const { error: deleteError } = await supabase
      .from('tables')
      .delete()
      .eq('bar_id', barId)
    
    if (deleteError) {
      console.log('⚠️ No se pudieron eliminar mesas existentes:', deleteError.message)
    }
    
    // Insertar nuevas mesas
    const { data: tables, error: tablesError } = await supabase
      .from('tables')
      .insert(testTables)
      .select()
    
    if (tablesError) {
      console.error('❌ Error creando mesas:', tablesError)
      return
    }
    
    console.log('✅ Mesas creadas exitosamente:', tables)
    
    // Verificar que las mesas se pueden consultar
    console.log('🔍 Verificando consulta de mesas...')
    const { data: queryTables, error: queryError } = await supabase
      .from('tables')
      .select('*')
      .eq('bar_id', barId)
      .eq('is_active', true)
    
    if (queryError) {
      console.error('❌ Error consultando mesas:', queryError)
      return
    }
    
    console.log('✅ Consulta exitosa. Mesas encontradas:', queryTables.length)
    console.log('📋 Mesas:', queryTables)
    
  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

createTestTables()