-- ⚠️  SCRIPT PARA DESHABILITAR RLS EN DESARROLLO ⚠️
-- Este script deshabilita temporalmente Row Level Security para permitir
-- el desarrollo sin restricciones. NO usar en producción.

-- PASO 1: Deshabilitar RLS en todas las tablas principales
ALTER TABLE public.bars DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tables DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- PASO 2: Eliminar todas las políticas existentes (opcional, para limpiar)
DROP POLICY IF EXISTS "Bars are viewable by everyone" ON public.bars;
DROP POLICY IF EXISTS "Bar owners can update their bars" ON public.bars;
DROP POLICY IF EXISTS "Bar owners can insert bars" ON public.bars;
DROP POLICY IF EXISTS "Allow all operations on bars" ON public.bars;

DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.categories;
DROP POLICY IF EXISTS "Bar owners can manage categories" ON public.categories;
DROP POLICY IF EXISTS "Allow all operations on categories" ON public.categories;

DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;
DROP POLICY IF EXISTS "Bar owners can manage products" ON public.products;
DROP POLICY IF EXISTS "Allow all operations on products" ON public.products;

DROP POLICY IF EXISTS "Tables viewable by QR code" ON public.tables;
DROP POLICY IF EXISTS "Bar owners can manage tables" ON public.tables;
DROP POLICY IF EXISTS "Allow all operations on tables" ON public.tables;

DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
DROP POLICY IF EXISTS "Bar owners can view their orders" ON public.orders;
DROP POLICY IF EXISTS "Bar owners can update their orders" ON public.orders;
DROP POLICY IF EXISTS "Allow all operations on orders" ON public.orders;

DROP POLICY IF EXISTS "Anyone can insert order items" ON public.order_items;
DROP POLICY IF EXISTS "Order items are viewable with order" ON public.order_items;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

-- PASO 3: Verificar que RLS está deshabilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('bars', 'categories', 'products', 'tables', 'orders', 'order_items', 'profiles', 'user_roles')
ORDER BY tablename;

-- MENSAJE DE CONFIRMACIÓN
SELECT 'RLS ha sido deshabilitado para todas las tablas principales. Ahora puedes crear categorías sin restricciones.' as mensaje;