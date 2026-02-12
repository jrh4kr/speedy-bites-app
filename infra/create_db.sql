-- Speedy Bites Full Database Migration
-- For use with Docker PostgreSQL or any external PostgreSQL

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- ENUMS
-- ============================================
DO $$ BEGIN
  CREATE TYPE order_status AS ENUM (
    'pending', 'preparing', 'ready_for_pickup',
    'picked_up', 'on_the_way', 'delivered', 'failed', 'cancelled'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE app_role AS ENUM ('customer', 'rider', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- USERS TABLE (standalone auth for Express)
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  role app_role NOT NULL DEFAULT 'customer',
  is_active BOOLEAN NOT NULL DEFAULT true,
  avatar_url TEXT,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- MENU CATEGORIES
-- ============================================
CREATE TABLE IF NOT EXISTS public.menu_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- MENU ITEMS
-- ============================================
CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  category_id UUID REFERENCES public.menu_categories(id) ON DELETE SET NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  preparation_time INTEGER DEFAULT 15,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- CUSTOMER ADDRESSES
-- ============================================
CREATE TABLE IF NOT EXISTS public.customer_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  label TEXT DEFAULT 'Home',
  street TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Nairobi',
  phone TEXT,
  instructions TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- ORDERS
-- ============================================
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES public.users(id),
  delivery_address_id UUID REFERENCES public.customer_addresses(id),
  status order_status NOT NULL DEFAULT 'pending',
  subtotal NUMERIC NOT NULL DEFAULT 0,
  delivery_fee NUMERIC NOT NULL DEFAULT 0,
  discount NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  promotion_code TEXT,
  estimated_delivery_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- ORDER ITEMS
-- ============================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- PROMOTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS public.promotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL DEFAULT 'percentage',
  discount_value NUMERIC NOT NULL,
  min_order_amount NUMERIC DEFAULT 0,
  max_discount NUMERIC,
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- RIDER ASSIGNMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS public.rider_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID UNIQUE NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  rider_id UUID NOT NULL REFERENCES public.users(id),
  status TEXT DEFAULT 'assigned',
  notes TEXT,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  picked_up_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON public.menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_rider_assignments_rider ON public.rider_assignments(rider_id);
CREATE INDEX IF NOT EXISTS idx_rider_assignments_order ON public.rider_assignments(order_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_menu_categories_updated_at BEFORE UPDATE ON public.menu_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON public.menu_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================
-- SEED: Default admin user (password: admin123)
-- ============================================
INSERT INTO public.users (email, password_hash, name, role) VALUES
  ('admin@speedybites.co.ke', encode(digest('admin123', 'sha256'), 'hex'), 'Admin', 'admin')
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- SEED: Menu Categories
-- ============================================
INSERT INTO public.menu_categories (name, description, display_order, is_active) VALUES
  ('Restaurant', 'Delicious cooked meals and snacks', 0, true),
  ('Butchery', 'Fresh chicken cuts and products', 1, true),
  ('Groceries', 'Fresh vegetables and produce', 2, true),
  ('Platters', 'Party platters and sharing sinias', 3, true)
ON CONFLICT DO NOTHING;

-- ============================================
-- SEED: Menu Items
-- ============================================
DO $$
DECLARE
  cat_restaurant UUID;
  cat_butchery UUID;
  cat_groceries UUID;
  cat_platters UUID;
BEGIN
  SELECT id INTO cat_restaurant FROM public.menu_categories WHERE name = 'Restaurant' LIMIT 1;
  SELECT id INTO cat_butchery FROM public.menu_categories WHERE name = 'Butchery' LIMIT 1;
  SELECT id INTO cat_groceries FROM public.menu_categories WHERE name = 'Groceries' LIMIT 1;
  SELECT id INTO cat_platters FROM public.menu_categories WHERE name = 'Platters' LIMIT 1;

  -- Restaurant items
  INSERT INTO public.menu_items (name, price, category_id, description) VALUES
    ('Chapati Chicken', 300, cat_restaurant, 'Soft chapati served with chicken stew'),
    ('Veg Rice and Chicken', 100, cat_restaurant, 'Vegetable rice with chicken'),
    ('Pilau & Chicken', 380, cat_restaurant, 'Spiced pilau rice with chicken'),
    ('Ugali & Wet Fry Chicken', 230, cat_restaurant, 'Ugali with wet fry chicken'),
    ('Ugali & Greens', 100, cat_restaurant, 'Ugali with sauteed greens'),
    ('Pilau', 200, cat_restaurant, 'Spiced pilau rice'),
    ('Beef Wet Fry', 200, cat_restaurant, 'Tender beef wet fry'),
    ('Bhajia', 150, cat_restaurant, 'Crispy potato bhajia'),
    ('Choma Special', 320, cat_restaurant, 'Grilled meat special'),
    ('Chapo', 30, cat_restaurant, 'Single chapati'),
    ('Chips and Chicken', 370, cat_restaurant, 'Crispy chips with chicken')
  ON CONFLICT DO NOTHING;

  -- Butchery items
  INSERT INTO public.menu_items (name, price, category_id, description) VALUES
    ('Chicken Skins', 250, cat_butchery, 'Per kg'),
    ('Sausages', 720, cat_butchery, 'Premium sausages per kg'),
    ('Smokies', 580, cat_butchery, 'Smoky sausages per kg'),
    ('Tray of Eggs', 450, cat_butchery, 'Full tray of eggs'),
    ('Gizzards', 600, cat_butchery, 'Chicken gizzards per kg'),
    ('Chicken Liver', 400, cat_butchery, 'Fresh chicken liver per kg'),
    ('Wings', 580, cat_butchery, 'Chicken wings per kg'),
    ('Drumstick', 700, cat_butchery, 'Chicken drumsticks per kg'),
    ('Thighs', 600, cat_butchery, 'Chicken thighs per kg'),
    ('Breast', 650, cat_butchery, 'Chicken breast per kg'),
    ('Broiler', 580, cat_butchery, 'Whole broiler per kg'),
    ('Chicken Necks', 350, cat_butchery, 'Chicken necks per kg'),
    ('Chicken Heads and Feet', 150, cat_butchery, 'Per kg')
  ON CONFLICT DO NOTHING;

  -- Groceries
  INSERT INTO public.menu_items (name, price, category_id, description) VALUES
    ('Onions', 100, cat_groceries, 'Fresh onions per kg'),
    ('Tomatoes', 100, cat_groceries, 'Fresh tomatoes per kg')
  ON CONFLICT DO NOTHING;

  -- Platters
  INSERT INTO public.menu_items (name, price, category_id, description) VALUES
    ('Jambo Sinia', 1200, cat_platters, 'Large sharing platter'),
    ('Wandegeya (UG) Sinia', 1500, cat_platters, 'Ugandan-style sharing platter'),
    ('Bahati Sinia', 1000, cat_platters, 'Bahati special platter'),
    ('Kiddies Sinia', 1000, cat_platters, 'Kids sharing platter'),
    ('Jambo-Jambo Sinia', 1500, cat_platters, 'Extra large sharing platter'),
    ('Snackies Platter', 1200, cat_platters, 'Assorted snacks platter'),
    ('Garden of Eden Platter', 1500, cat_platters, 'Mixed platter'),
    ('Karimis Sinia', 1300, cat_platters, 'Karimis special platter')
  ON CONFLICT DO NOTHING;
END $$;
