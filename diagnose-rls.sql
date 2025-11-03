-- Script de diagnóstico para verificar políticas RLS
-- Ejecutar en Supabase SQL Editor para ver el estado actual

-- 1. Verificar si RLS está habilitado en las tablas
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('categories', 'products', 'bars', 'tables', 'orders', 'order_items', 'profiles', 'user_roles')
ORDER BY tablename;

-- 2. Listar todas las políticas RLS existentes
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 3. Verificar políticas específicas para categories
SELECT 
    policyname,
    permissive,
    roles,
    cmd as command_type,
    qual as using_expression,
    with_check as with_check_expression
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename = 'categories';

-- 4. Verificar si existen las tablas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('categories', 'products', 'bars', 'tables', 'orders');