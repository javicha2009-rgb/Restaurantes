import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'http://localhost:54321'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function createTestData() {
  try {
    console.log('Creating test data...')
    
    // Create bar
    const { data: bar, error: barError } = await supabase
      .from('bars')
      .upsert({
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Bar de Prueba',
        description: 'Un bar para testing',
        address: 'Calle Test 123',
        phone: '+1234567890',
        email: 'test@bar.com'
      })
      .select()
    
    if (barError) {
      console.error('Error creating bar:', barError)
      return
    }
    console.log('Bar created:', bar)
    
    // Create categories
    const categories = [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Bebidas',
        description: 'Bebidas alcohólicas y no alcohólicas',
        bar_id: '550e8400-e29b-41d4-a716-446655440000'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        name: 'Comidas',
        description: 'Platos principales y aperitivos',
        bar_id: '550e8400-e29b-41d4-a716-446655440000'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        name: 'Postres',
        description: 'Dulces y postres',
        bar_id: '550e8400-e29b-41d4-a716-446655440000'
      }
    ]
    
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('categories')
      .upsert(categories)
      .select()
    
    if (categoriesError) {
      console.error('Error creating categories:', categoriesError)
      return
    }
    console.log('Categories created:', categoriesData)
    
    // Create products
    const products = [
      {
        id: '550e8400-e29b-41d4-a716-446655440010',
        name: 'Cerveza Artesanal',
        description: 'Cerveza local de la casa',
        price: 5.50,
        bar_id: '550e8400-e29b-41d4-a716-446655440000',
        category_id: '550e8400-e29b-41d4-a716-446655440001',
        is_available: true,
        status: 'available'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440011',
        name: 'Vino Tinto',
        description: 'Vino tinto de la región',
        price: 8.00,
        bar_id: '550e8400-e29b-41d4-a716-446655440000',
        category_id: '550e8400-e29b-41d4-a716-446655440001',
        is_available: true,
        status: 'available'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440012',
        name: 'Hamburguesa Clásica',
        description: 'Hamburguesa con queso y papas',
        price: 12.50,
        bar_id: '550e8400-e29b-41d4-a716-446655440000',
        category_id: '550e8400-e29b-41d4-a716-446655440002',
        is_available: true,
        status: 'available'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440013',
        name: 'Pizza Margherita',
        description: 'Pizza con tomate, mozzarella y albahaca',
        price: 15.00,
        bar_id: '550e8400-e29b-41d4-a716-446655440000',
        category_id: '550e8400-e29b-41d4-a716-446655440002',
        is_available: true,
        status: 'available'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440014',
        name: 'Tiramisu',
        description: 'Postre italiano tradicional',
        price: 6.50,
        bar_id: '550e8400-e29b-41d4-a716-446655440000',
        category_id: '550e8400-e29b-41d4-a716-446655440003',
        is_available: true,
        status: 'available'
      }
    ]
    
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .upsert(products)
      .select()
    
    if (productsError) {
      console.error('Error creating products:', productsError)
      return
    }
    console.log('Products created:', productsData)
    
    // Create tables
    const tables = [
      {
        id: '550e8400-e29b-41d4-a716-446655440020',
        table_name: 'Mesa 1',
        table_number: 1,
        qr_value: 'table_1_qr',
        bar_id: '550e8400-e29b-41d4-a716-446655440000'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440021',
        table_name: 'Mesa 2',
        table_number: 2,
        qr_value: 'table_2_qr',
        bar_id: '550e8400-e29b-41d4-a716-446655440000'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440022',
        table_name: 'Mesa 3',
        table_number: 3,
        qr_value: 'table_3_qr',
        bar_id: '550e8400-e29b-41d4-a716-446655440000'
      }
    ]
    
    const { data: tablesData, error: tablesError } = await supabase
      .from('tables')
      .upsert(tables)
      .select()
    
    if (tablesError) {
      console.error('Error creating tables:', tablesError)
      return
    }
    console.log('Tables created:', tablesData)
    
    console.log('Test data created successfully!')
    
  } catch (error) {
    console.error('Error:', error)
  }
}

createTestData()