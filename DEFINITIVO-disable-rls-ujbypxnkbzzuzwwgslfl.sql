-- ========================================
-- SCRIPT DEFINITIVO PARA PROYECTO CORRECTO
-- Proyecto: ujbypxnkbzzuzwwgslfl
-- URL: https://ujbypxnkbzzuzwwgslfl.supabase.co
-- Dashboard: https://supabase.com/dashboard/project/ujbypxnkbzzuzwwgslfl
-- ========================================

-- MENSAJE INICIAL
SELECT '🚀 INICIANDO ELIMINACIÓN DEFINITIVA DE RLS' as inicio,
       'ujbypxnkbzzuzwwgslfl' as proyecto_id;

-- 1. DESHABILITAR RLS EN TODAS LAS TABLAS PÚBLICAS
DO $$
DECLARE
    table_record RECORD;
    table_count INTEGER := 0;
BEGIN
    FOR table_record IN 
        SELECT schemaname, tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('ALTER TABLE %I.%I DISABLE ROW LEVEL SECURITY', 
                      table_record.schemaname, table_record.tablename);
        table_count := table_count + 1;
        RAISE NOTICE '✅ RLS deshabilitado en: %.%', 
                     table_record.schemaname, table_record.tablename;
    END LOOP;
    
    RAISE NOTICE '📊 Total de tablas procesadas: %', table_count;
END $$;

-- 2. ELIMINAR TODAS LAS POLÍTICAS RLS EXISTENTES
DO $$
DECLARE
    policy_record RECORD;
    policy_count INTEGER := 0;
BEGIN
    FOR policy_record IN 
        SELECT schemaname, tablename, policyname
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                      policy_record.policyname, 
                      policy_record.schemaname, 
                      policy_record.tablename);
        policy_count := policy_count + 1;
        RAISE NOTICE '🗑️ Política eliminada: % en %.%', 
                     policy_record.policyname,
                     policy_record.schemaname, 
                     policy_record.tablename;
    END LOOP;
    
    RAISE NOTICE '📊 Total de políticas eliminadas: %', policy_count;
END $$;

-- 3. OTORGAR PERMISOS COMPLETOS A TODOS LOS ROLES DE SUPABASE
-- Permisos para rol ANON (usuarios no autenticados)
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO anon;

-- Permisos para rol AUTHENTICATED (usuarios autenticados)
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Permisos para rol SERVICE_ROLE (máximos privilegios)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;
GRANT USAGE ON SCHEMA public TO service_role;

-- 4. PERMISOS ESPECÍFICOS PARA TABLAS CRÍTICAS
-- Asegurar permisos en tabla categories (la que causaba el error)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categories' AND table_schema = 'public') THEN
        GRANT ALL ON categories TO anon;
        GRANT ALL ON categories TO authenticated;
        GRANT ALL ON categories TO service_role;
        RAISE NOTICE '✅ Permisos específicos otorgados a tabla categories';
    END IF;
END $$;

-- Permisos para otras tablas importantes
DO $$
DECLARE
    target_table TEXT;
BEGIN
    FOR target_table IN VALUES ('products'), ('bars'), ('tables'), ('orders'), ('order_items'), ('profiles'), ('user_roles'), ('bar_credentials')
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = target_table AND table_schema = 'public') THEN
            EXECUTE format('GRANT ALL ON %I TO anon', target_table);
            EXECUTE format('GRANT ALL ON %I TO authenticated', target_table);
            EXECUTE format('GRANT ALL ON %I TO service_role', target_table);
            RAISE NOTICE '✅ Permisos otorgados a tabla: %', target_table;
        END IF;
    END LOOP;
END $$;

-- 5. VERIFICACIÓN COMPLETA DEL ESTADO FINAL
SELECT '🔍 VERIFICACIÓN FINAL DEL ESTADO RLS' as verificacion;

-- Verificar que RLS está deshabilitado en todas las tablas
SELECT 
    '📋 ESTADO RLS POR TABLA' as seccion,
    schemaname,
    tablename,
    CASE 
        WHEN rowsecurity = false THEN '✅ RLS DESHABILITADO'
        ELSE '❌ RLS AÚN ACTIVO'
    END as estado_rls
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Verificar que no quedan políticas RLS
SELECT 
    '📊 RESUMEN DE POLÍTICAS RLS' as seccion,
    COUNT(*) as total_policies,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ CERO POLÍTICAS RLS - PERFECTO'
        ELSE '❌ AÚN QUEDAN POLÍTICAS RLS'
    END as estado_policies
FROM pg_policies 
WHERE schemaname = 'public';

-- Verificar permisos en tabla categories
SELECT 
    '🎯 PERMISOS EN TABLA CATEGORIES' as seccion,
    grantee as rol,
    privilege_type as permiso,
    '✅ OTORGADO' as estado
FROM information_schema.role_table_grants 
WHERE table_name = 'categories' 
  AND table_schema = 'public'
  AND grantee IN ('anon', 'authenticated', 'service_role')
ORDER BY grantee, privilege_type;

-- MENSAJE FINAL DE ÉXITO
SELECT 
    '🎉 PROCESO COMPLETADO EXITOSAMENTE' as resultado,
    'ujbypxnkbzzuzwwgslfl' as proyecto_procesado,
    'RLS COMPLETAMENTE ELIMINADO' as estado_final,
    'APLICACIÓN LISTA PARA FUNCIONAR' as siguiente_paso;