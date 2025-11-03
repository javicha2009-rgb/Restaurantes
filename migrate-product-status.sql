-- ============================================
-- MIGRACIÓN: PRODUCTO STATUS SYSTEM
-- ============================================
-- Migra el campo is_available (boolean) a status (enum)
-- Estados: 'available', 'temporarily_unavailable'

-- 1. CREAR TIPO ENUM PARA ESTADOS DE PRODUCTO
CREATE TYPE product_status AS ENUM ('available', 'temporarily_unavailable');

-- 2. AGREGAR NUEVA COLUMNA STATUS
ALTER TABLE products 
ADD COLUMN status product_status DEFAULT 'available';

-- 3. MIGRAR DATOS EXISTENTES
-- Si is_available = true -> status = 'available'
-- Si is_available = false -> status = 'temporarily_unavailable'
UPDATE products 
SET status = CASE 
    WHEN is_available = true THEN 'available'::product_status
    WHEN is_available = false THEN 'temporarily_unavailable'::product_status
    ELSE 'available'::product_status
END;

-- 4. HACER LA COLUMNA STATUS NO NULA
ALTER TABLE products 
ALTER COLUMN status SET NOT NULL;

-- 5. OPCIONAL: ELIMINAR LA COLUMNA is_available ANTIGUA
-- (Comentado por seguridad - descomenta si estás seguro)
-- ALTER TABLE products DROP COLUMN is_available;

-- 6. VERIFICAR LA MIGRACIÓN
SELECT 
    'VERIFICACIÓN MIGRACIÓN' as section,
    id,
    name,
    is_available as old_field,
    status as new_field
FROM products 
LIMIT 10;

-- 7. CONTAR PRODUCTOS POR ESTADO
SELECT 
    'RESUMEN POR ESTADO' as section,
    status,
    COUNT(*) as count
FROM products 
GROUP BY status;