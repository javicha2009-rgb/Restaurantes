-- Create bar_credentials table
CREATE TABLE public.bar_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bar_id UUID NOT NULL REFERENCES public.bars(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(bar_id, username)
);

-- Enable Row Level Security
ALTER TABLE public.bar_credentials ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bar_credentials (admin access only)
CREATE POLICY "Bar credentials are viewable by admin only"
  ON public.bar_credentials FOR SELECT
  USING (false); -- Only accessible via service role

CREATE POLICY "Bar credentials can be managed by admin only"
  ON public.bar_credentials FOR ALL
  USING (false); -- Only accessible via service role

-- Add updated_at trigger for bar_credentials
CREATE TRIGGER update_bar_credentials_updated_at
  BEFORE UPDATE ON public.bar_credentials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add missing updated_at column to categories table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'categories' AND column_name = 'updated_at') THEN
        ALTER TABLE public.categories ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
    END IF;
END $$;

-- Add updated_at trigger for categories
DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add missing updated_at column to tables table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tables' AND column_name = 'updated_at') THEN
        ALTER TABLE public.tables ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
    END IF;
END $$;

-- Add updated_at trigger for tables
DROP TRIGGER IF EXISTS update_tables_updated_at ON public.tables;
CREATE TRIGGER update_tables_updated_at
  BEFORE UPDATE ON public.tables
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data for testing (with proper UUIDs)
DO $$
DECLARE
    bar_uuid UUID := gen_random_uuid();
    bebidas_id UUID;
    comida_id UUID;
    aperitivos_id UUID;
BEGIN
    -- Sample bar with generated UUID
    INSERT INTO public.bars (id, name, description, address, phone, email, is_active)
    VALUES (
      bar_uuid,
      'Bar de Javi',
      'Un bar moderno con la mejor tecnología',
      'Calle Principal 123, Madrid',
      '+34 123 456 789',
      'javi@bar.com',
      true
    );

    -- Sample credentials for Javi's bar
    INSERT INTO public.bar_credentials (bar_id, username, password)
    VALUES (
      bar_uuid,
      'Javi',
      'Javi'
    );

    -- Sample categories for Javi's bar
    INSERT INTO public.categories (bar_id, name, description, display_order, is_active)
    VALUES 
      (bar_uuid, 'Bebidas', 'Refrescos, cervezas y cócteles', 1, true),
      (bar_uuid, 'Comida', 'Tapas, platos principales y postres', 2, true),
      (bar_uuid, 'Aperitivos', 'Frutos secos, patatas y snacks', 3, true);

    -- Get category IDs for products
    SELECT id INTO bebidas_id FROM public.categories WHERE bar_id = bar_uuid AND name = 'Bebidas';
    SELECT id INTO comida_id FROM public.categories WHERE bar_id = bar_uuid AND name = 'Comida';
    SELECT id INTO aperitivos_id FROM public.categories WHERE bar_id = bar_uuid AND name = 'Aperitivos';

    -- Sample products for Javi's bar
    INSERT INTO public.products (bar_id, category_id, name, description, price, is_available)
    VALUES 
      (bar_uuid, bebidas_id, 'Cerveza Estrella Galicia', 'Cerveza rubia de 33cl', 3.50, true),
      (bar_uuid, bebidas_id, 'Coca Cola', 'Refresco de cola 33cl', 2.50, true),
      (bar_uuid, bebidas_id, 'Agua Mineral', 'Agua mineral natural 50cl', 2.00, true),
      (bar_uuid, comida_id, 'Jamón Ibérico', 'Jamón ibérico de bellota', 12.00, true),
      (bar_uuid, comida_id, 'Tortilla Española', 'Tortilla de patatas casera', 8.50, true),
      (bar_uuid, comida_id, 'Croquetas de Jamón', '6 unidades de croquetas caseras', 7.00, true),
      (bar_uuid, aperitivos_id, 'Aceitunas Aliñadas', 'Aceitunas verdes aliñadas', 4.50, true),
      (bar_uuid, aperitivos_id, 'Patatas Bravas', 'Patatas con salsa brava y alioli', 6.00, true);

    -- Sample tables for Javi's bar
    INSERT INTO public.tables (bar_id, table_number, table_name, qr_code_value, is_active)
    VALUES 
      (bar_uuid, '1', 'Mesa 1', gen_random_uuid()::text, true),
      (bar_uuid, '2', 'Mesa 2', gen_random_uuid()::text, true),
      (bar_uuid, '3', 'Mesa 3', gen_random_uuid()::text, true),
      (bar_uuid, '4', 'Mesa 4', gen_random_uuid()::text, true),
      (bar_uuid, '5', 'Mesa 5', gen_random_uuid()::text, true);

END $$;