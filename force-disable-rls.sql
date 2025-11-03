-- Script para FORZAR la deshabilitación de RLS
-- ⚠️ SOLO PARA DESARROLLO - NO USAR EN PRODUCCIÓN

-- 1. DESHABILITAR RLS completamente en todas las tablas
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bars DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tables DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bar_credentials DISABLE ROW LEVEL SECURITY;

-- 2. ELIMINAR TODAS las políticas existentes
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Eliminar todas las políticas de categories
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'categories'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.categories', policy_record.policyname);
    END LOOP;
    
    -- Eliminar todas las políticas de products
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'products'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.products', policy_record.policyname);
    END LOOP;
    
    -- Eliminar todas las políticas de bars
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'bars'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.bars', policy_record.policyname);
    END LOOP;
    
    -- Eliminar todas las políticas de tables
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'tables'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.tables', policy_record.policyname);
    END LOOP;
    
    -- Eliminar todas las políticas de orders
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'orders'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.orders', policy_record.policyname);
    END LOOP;
    
    -- Eliminar todas las políticas de order_items
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'order_items'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.order_items', policy_record.policyname);
    END LOOP;
    
    -- Eliminar todas las políticas de profiles
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', policy_record.policyname);
    END LOOP;
    
    -- Eliminar todas las políticas de user_roles
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_roles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_roles', policy_record.policyname);
    END LOOP;
    
    -- Eliminar todas las políticas de bar_credentials
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'bar_credentials'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.bar_credentials', policy_record.policyname);
    END LOOP;
END $$;

-- 3. Verificar que RLS está deshabilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('categories', 'products', 'bars', 'tables', 'orders', 'order_items', 'profiles', 'user_roles', 'bar_credentials')
ORDER BY tablename;

-- 4. Verificar que no hay políticas
SELECT COUNT(*) as remaining_policies
FROM pg_policies 
WHERE schemaname = 'public';

-- Mensaje de confirmación
SELECT 'RLS ha sido completamente deshabilitado para desarrollo' as status;