-- SCRIPT NUCLEAR PARA ELIMINAR RLS COMPLETAMENTE
-- ⚠️ EJECUTAR SOLO EN DESARROLLO

-- 1. FORZAR DESHABILITACIÓN DE RLS EN TODAS LAS TABLAS
DO $$
DECLARE
    table_record RECORD;
BEGIN
    -- Obtener todas las tablas del esquema public
    FOR table_record IN 
        SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    LOOP
        -- Deshabilitar RLS para cada tabla
        EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY', table_record.tablename);
        RAISE NOTICE 'RLS deshabilitado para tabla: %', table_record.tablename;
    END LOOP;
END $$;

-- 2. ELIMINAR TODAS LAS POLÍTICAS EXISTENTES DE FORMA BRUTAL
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Eliminar TODAS las políticas de TODAS las tablas
    FOR policy_record IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY %I ON %I.%I', 
                      policy_record.policyname, 
                      policy_record.schemaname, 
                      policy_record.tablename);
        RAISE NOTICE 'Política eliminada: % en tabla %', policy_record.policyname, policy_record.tablename;
    END LOOP;
END $$;

-- 3. VERIFICACIÓN ESPECÍFICA PARA CATEGORIES
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all operations on categories" ON public.categories;
DROP POLICY IF EXISTS "Bar owners can manage categories" ON public.categories;
DROP POLICY IF EXISTS "categories_policy" ON public.categories;

-- 4. VERIFICACIÓN ESPECÍFICA PARA PRODUCTS
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all operations on products" ON public.products;
DROP POLICY IF EXISTS "Bar owners can manage products" ON public.products;
DROP POLICY IF EXISTS "products_policy" ON public.products;

-- 5. VERIFICACIÓN ESPECÍFICA PARA BARS
ALTER TABLE public.bars DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all operations on bars" ON public.bars;
DROP POLICY IF EXISTS "Bar owners can update their bars" ON public.bars;
DROP POLICY IF EXISTS "Bar owners can insert bars" ON public.bars;

-- 6. VERIFICACIÓN ESPECÍFICA PARA TABLES
ALTER TABLE public.tables DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all operations on tables" ON public.tables;
DROP POLICY IF EXISTS "Bar owners can manage tables" ON public.tables;

-- 7. VERIFICACIÓN ESPECÍFICA PARA ORDERS
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all operations on orders" ON public.orders;
DROP POLICY IF EXISTS "Bar owners can view their orders" ON public.orders;
DROP POLICY IF EXISTS "Bar owners can update their orders" ON public.orders;

-- 8. VERIFICACIÓN ESPECÍFICA PARA ORDER_ITEMS
ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all operations on order_items" ON public.order_items;

-- 9. VERIFICACIÓN ESPECÍFICA PARA PROFILES
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all operations on profiles" ON public.profiles;

-- 10. VERIFICACIÓN ESPECÍFICA PARA USER_ROLES
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all operations on user_roles" ON public.user_roles;

-- 11. VERIFICACIÓN ESPECÍFICA PARA BAR_CREDENTIALS
ALTER TABLE public.bar_credentials DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all operations on bar_credentials" ON public.bar_credentials;

-- 12. VERIFICACIÓN FINAL - MOSTRAR ESTADO
SELECT 
    'VERIFICACIÓN FINAL' as status,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- 13. CONTAR POLÍTICAS RESTANTES
SELECT 
    'POLÍTICAS RESTANTES' as status,
    COUNT(*) as total_policies
FROM pg_policies 
WHERE schemaname = 'public';

-- 14. MENSAJE DE CONFIRMACIÓN
SELECT 'RLS COMPLETAMENTE ELIMINADO - LISTO PARA DESARROLLO' as final_status;