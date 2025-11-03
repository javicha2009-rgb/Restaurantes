-- ============================================
-- REVISIÓN COMPLETA DE BASE DE DATOS
-- ============================================
-- Proyecto: ujbypxnkbzzuzwwgslfl
-- URL: https://supabase.com/dashboard/project/ujbypxnkbzzuzwwgslfl/sql

-- 1. LISTAR TODAS LAS TABLAS EN EL ESQUEMA PUBLIC
SELECT 
    'TABLAS EXISTENTES' as section,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. VERIFICAR ESTADO DE RLS EN TODAS LAS TABLAS
SELECT 
    'ESTADO RLS' as section,
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity = true THEN '❌ RLS ACTIVO'
        ELSE '✅ RLS DESHABILITADO'
    END as status
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 3. CONTAR POLÍTICAS RLS EXISTENTES
SELECT 
    'POLÍTICAS RLS' as section,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as command_type
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 4. CONTAR TOTAL DE POLÍTICAS
SELECT 
    'RESUMEN POLÍTICAS' as section,
    COUNT(*) as total_policies,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ NO HAY POLÍTICAS RLS'
        ELSE '❌ AÚN HAY POLÍTICAS ACTIVAS'
    END as status
FROM pg_policies 
WHERE schemaname = 'public';

-- 5. VERIFICAR PERMISOS DE ROLES EN TABLAS ESPECÍFICAS
SELECT 
    'PERMISOS ANON' as section,
    table_name,
    privilege_type
FROM information_schema.role_table_grants 
WHERE grantee = 'anon' 
AND table_schema = 'public'
AND table_name IN ('categories', 'products', 'bars', 'tables', 'orders')
ORDER BY table_name, privilege_type;

SELECT 
    'PERMISOS AUTHENTICATED' as section,
    table_name,
    privilege_type
FROM information_schema.role_table_grants 
WHERE grantee = 'authenticated' 
AND table_schema = 'public'
AND table_name IN ('categories', 'products', 'bars', 'tables', 'orders')
ORDER BY table_name, privilege_type;

-- 6. VERIFICAR ESTRUCTURA DE TABLA CATEGORIES
SELECT 
    'ESTRUCTURA CATEGORIES' as section,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'categories'
ORDER BY ordinal_position;

-- 7. VERIFICAR DATOS EN TABLA CATEGORIES
SELECT 
    'DATOS CATEGORIES' as section,
    id,
    name,
    bar_id,
    created_at
FROM public.categories 
LIMIT 10;

-- 8. VERIFICAR ESTRUCTURA DE TABLA PRODUCTS
SELECT 
    'ESTRUCTURA PRODUCTS' as section,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'products'
ORDER BY ordinal_position;

-- 9. VERIFICAR DATOS EN TABLA PRODUCTS
SELECT 
    'DATOS PRODUCTS' as section,
    id,
    name,
    category_id,
    price,
    created_at
FROM public.products 
LIMIT 10;

-- 10. VERIFICAR ESTRUCTURA DE TABLA BARS
SELECT 
    'ESTRUCTURA BARS' as section,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'bars'
ORDER BY ordinal_position;

-- 11. VERIFICAR DATOS EN TABLA BARS
SELECT 
    'DATOS BARS' as section,
    id,
    name,
    created_at
FROM public.bars 
LIMIT 10;

-- 12. VERIFICAR TODAS LAS SECUENCIAS
SELECT 
    'SECUENCIAS' as section,
    sequence_name,
    data_type,
    start_value,
    minimum_value,
    maximum_value,
    increment
FROM information_schema.sequences 
WHERE sequence_schema = 'public';

-- 13. VERIFICAR ÍNDICES
SELECT 
    'ÍNDICES' as section,
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 14. VERIFICAR RESTRICCIONES (CONSTRAINTS)
SELECT 
    'RESTRICCIONES' as section,
    table_name,
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_schema = 'public'
ORDER BY table_name, constraint_type;

-- 15. MENSAJE FINAL DE ESTADO
SELECT 
    'ESTADO FINAL' as section,
    CASE 
        WHEN (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') = 0 
        AND (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true) = 0
        THEN '✅ BASE DE DATOS COMPLETAMENTE LIBRE DE RLS'
        ELSE '❌ AÚN HAY RESTRICCIONES RLS ACTIVAS'
    END as database_status;