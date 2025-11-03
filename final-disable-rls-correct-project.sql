-- ========================================
-- SCRIPT DEFINITIVO PARA PROYECTO CORRECTO
-- Proyecto: ylywhyslgeagrlnvwnuj
-- URL: https://ylywhyslgeagrlnvwnuj.supabase.co
-- ========================================

-- 1. DESHABILITAR RLS EN TODAS LAS TABLAS
DO $$
DECLARE
    table_record RECORD;
BEGIN
    FOR table_record IN 
        SELECT schemaname, tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('ALTER TABLE %I.%I DISABLE ROW LEVEL SECURITY', 
                      table_record.schemaname, table_record.tablename);
        RAISE NOTICE 'RLS deshabilitado en tabla: %.%', 
                     table_record.schemaname, table_record.tablename;
    END LOOP;
END $$;

-- 2. ELIMINAR TODAS LAS POLÍTICAS RLS EXISTENTES
DO $$
DECLARE
    policy_record RECORD;
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
        RAISE NOTICE 'Política eliminada: % en tabla %.%', 
                     policy_record.policyname,
                     policy_record.schemaname, 
                     policy_record.tablename;
    END LOOP;
END $$;

-- 3. OTORGAR PERMISOS COMPLETOS A TODOS LOS ROLES
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon;

GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- 4. PERMISOS ESPECÍFICOS PARA TABLA CATEGORIES
GRANT ALL ON categories TO anon;
GRANT ALL ON categories TO authenticated;
GRANT ALL ON categories TO service_role;

-- 5. VERIFICACIÓN FINAL
SELECT 
    'VERIFICACIÓN FINAL - PROYECTO CORRECTO' as status,
    'ylywhyslgeagrlnvwnuj' as proyecto_id;

-- Verificar RLS deshabilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Verificar que no hay políticas
SELECT 
    COUNT(*) as total_policies,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ SIN POLÍTICAS RLS'
        ELSE '❌ AÚN HAY POLÍTICAS'
    END as status
FROM pg_policies 
WHERE schemaname = 'public';

-- Mensaje final
SELECT '🎉 RLS COMPLETAMENTE ELIMINADO EN PROYECTO CORRECTO' as resultado;