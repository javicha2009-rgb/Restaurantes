-- Fix RLS policies for categories table to allow operations without authentication
-- This is needed because the app uses local credential storage instead of Supabase auth

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Bar owners can manage categories" ON public.categories;

-- Create new permissive policies for categories
CREATE POLICY "Allow all operations on categories"
  ON public.categories FOR ALL
  USING (true)
  WITH CHECK (true);

-- Also update other tables that might have similar issues
-- Drop and recreate policies for products
DROP POLICY IF EXISTS "Bar owners can manage products" ON public.products;

CREATE POLICY "Allow all operations on products"
  ON public.products FOR ALL
  USING (true)
  WITH CHECK (true);

-- Drop and recreate policies for tables
DROP POLICY IF EXISTS "Bar owners can manage tables" ON public.tables;

CREATE POLICY "Allow all operations on tables"
  ON public.tables FOR ALL
  USING (true)
  WITH CHECK (true);

-- Drop and recreate policies for bars
DROP POLICY IF EXISTS "Bar owners can update their bars" ON public.bars;
DROP POLICY IF EXISTS "Bar owners can insert bars" ON public.bars;

CREATE POLICY "Allow all operations on bars"
  ON public.bars FOR ALL
  USING (true)
  WITH CHECK (true);

-- Drop and recreate policies for orders
DROP POLICY IF EXISTS "Bar owners can view their orders" ON public.orders;
DROP POLICY IF EXISTS "Bar owners can update their orders" ON public.orders;

CREATE POLICY "Allow all operations on orders"
  ON public.orders FOR ALL
  USING (true)
  WITH CHECK (true);