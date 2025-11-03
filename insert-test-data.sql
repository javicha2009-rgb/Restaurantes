-- Insert test data with valid UUIDs
-- First, let's create a bar with a specific UUID
INSERT INTO bars (id, name, description, address, phone, email, created_at, updated_at) 
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'Bar de Prueba',
  'Un bar para testing',
  'Calle Test 123',
  '+1234567890',
  'test@bar.com',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  address = EXCLUDED.address,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  updated_at = NOW();

-- Insert categories for the bar
INSERT INTO categories (id, name, description, bar_id, created_at, updated_at)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'Bebidas', 'Bebidas alcohólicas y no alcohólicas', '550e8400-e29b-41d4-a716-446655440000', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440002', 'Comidas', 'Platos principales y aperitivos', '550e8400-e29b-41d4-a716-446655440000', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440003', 'Postres', 'Dulces y postres', '550e8400-e29b-41d4-a716-446655440000', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Insert products for the bar
INSERT INTO products (id, name, description, price, bar_id, category_id, is_available, status, created_at, updated_at)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440010', 'Cerveza Artesanal', 'Cerveza local de la casa', 5.50, '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', true, 'available', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440011', 'Vino Tinto', 'Vino tinto de la región', 8.00, '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', true, 'available', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440012', 'Hamburguesa Clásica', 'Hamburguesa con queso y papas', 12.50, '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002', true, 'available', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440013', 'Pizza Margherita', 'Pizza con tomate, mozzarella y albahaca', 15.00, '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002', true, 'available', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440014', 'Tiramisu', 'Postre italiano tradicional', 6.50, '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440003', true, 'available', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  status = EXCLUDED.status,
  updated_at = NOW();

-- Insert tables for the bar
INSERT INTO tables (id, table_name, table_number, qr_value, bar_id, created_at, updated_at)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440020', 'Mesa 1', 1, 'table_1_qr', '550e8400-e29b-41d4-a716-446655440000', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440021', 'Mesa 2', 2, 'table_2_qr', '550e8400-e29b-41d4-a716-446655440000', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440022', 'Mesa 3', 3, 'table_3_qr', '550e8400-e29b-41d4-a716-446655440000', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  table_name = EXCLUDED.table_name,
  table_number = EXCLUDED.table_number,
  qr_value = EXCLUDED.qr_value,
  updated_at = NOW();