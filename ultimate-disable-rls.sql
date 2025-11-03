-- ============================================
-- SCRIPT DEFINITIVO PARA ELIMINAR RLS COMPLETAMENTE
-- ============================================
-- IMPORTANTE: Ejecutar en el proyecto: ujbypxnkbzzuzwwgslfl
-- URL: https://supabase.com/dashboard/project/ujbypxnkbzzuzwwgslfl/sql

-- 1. DESHABILITAR RLS EN TODAS LAS TABLAS
ALTER TABLE IF EXISTS public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.bars DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tables DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.bar_credentials DISABLE ROW LEVEL SECURITY;

-- 2. ELIMINAR TODAS LAS POLÍTICAS RLS EXISTENTES
DROP POLICY IF EXISTS "categories_policy" ON public.categories;
DROP POLICY IF EXISTS "products_policy" ON public.products;
DROP POLICY IF EXISTS "bars_policy" ON public.bars;
DROP POLICY IF EXISTS "tables_policy" ON public.tables;
DROP POLICY IF EXISTS "orders_policy" ON public.orders;
DROP POLICY IF EXISTS "order_items_policy" ON public.order_items;
DROP POLICY IF EXISTS "profiles_policy" ON public.profiles;
DROP POLICY IF EXISTS "user_roles_policy" ON public.user_roles;
DROP POLICY IF EXISTS "bar_credentials_policy" ON public.bar_credentials;

-- 3. ELIMINAR POLÍTICAS CON NOMBRES GENÉRICOS
DROP POLICY IF EXISTS "Enable read access for all users" ON public.categories;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.categories;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.categories;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.categories;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.products;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.products;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.products;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.products;

-- 4. ELIMINAR TODAS LAS POLÍTICAS SIN IMPORTAR EL NOMBRE
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                      pol.policyname, pol.schemaname, pol.tablename);
    END LOOP;
END $$;

-- 5. OTORGAR PERMISOS COMPLETOS AL ROL ANON
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO anon;

-- 6. OTORGAR PERMISOS COMPLETOS AL ROL AUTHENTICATED
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- 7. OTORGAR PERMISOS COMPLETOS AL ROL SERVICE_ROLE
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- 8. VERIFICACIÓN FINAL
SELECT 
    'RLS Status' as check_type,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('categories', 'products', 'bars', 'tables', 'orders', 'order_items', 'profiles', 'user_roles', 'bar_credentials');

SELECT 
    'Policies Count' as check_type,
    COUNT(*) as total_policies
FROM pg_policies 
WHERE schemaname = 'public';

-- 9. MENSAJE DE CONFIRMACIÓN
SELECT 'RLS DEFINITIVAMENTE ELIMINADO - TODOS LOS PERMISOS OTORGADOS' as status;