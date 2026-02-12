-- =====================================================
-- SPEEDY BITES - COMPLETE DATABASE MIGRATION
-- Combined migration file for production setup
-- Run this entire file in your Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. CORE SCHEMA - USERS, MENU, ORDERS
-- =====================================================

-- Create Enum for User Roles
CREATE TYPE public.app_role AS ENUM ('customer', 'rider', 'admin');

-- Create Enum for Order Status
CREATE TYPE public.order_status AS ENUM (
  'pending',
  'preparing',
  'ready_for_pickup',
  'picked_up',
  'on_the_way',
  'delivered',
  'failed',
  'cancelled'
);

-- Create User Roles Table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create Profiles Table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Menu Categories Table
CREATE TABLE public.menu_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Menu Items Table
CREATE TABLE public.menu_items (
  id TEXT PRIMARY KEY,
  category_id TEXT REFERENCES public.menu_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  preparation_time INTEGER DEFAULT 15, -- in minutes
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Customer Addresses Table
CREATE TABLE public.customer_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  label TEXT DEFAULT 'Home',
  street TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Nairobi',
  phone TEXT,
  instructions TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Orders Table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  delivery_address_id UUID REFERENCES public.customer_addresses(id) ON DELETE SET NULL,
  status order_status NOT NULL DEFAULT 'pending',
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  delivery_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
  discount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  estimated_delivery_time TIMESTAMP WITH TIME ZONE,
  promotion_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Order Items Table
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  menu_item_id TEXT REFERENCES public.menu_items(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Promotions Table
CREATE TABLE public.promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL DEFAULT 'percentage', -- 'percentage' or 'fixed'
  discount_value DECIMAL(10, 2) NOT NULL,
  min_order_amount DECIMAL(10, 2) DEFAULT 0,
  max_discount DECIMAL(10, 2),
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Rider Assignments Table
CREATE TABLE public.rider_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  rider_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  picked_up_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'assigned', -- 'assigned', 'picked_up', 'delivered', 'cancelled'
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (order_id)
);

-- =====================================================
-- HELPER FUNCTIONS (Security Definer to avoid recursion)
-- =====================================================

-- Check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin')
$$;

-- Check if user is rider
CREATE OR REPLACE FUNCTION public.is_rider(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'rider')
$$;

-- Check if user is customer
CREATE OR REPLACE FUNCTION public.is_customer(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'customer')
$$;

-- Get user's primary role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rider_assignments ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- USER ROLES POLICIES
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.is_admin(auth.uid()));

-- PROFILES POLICIES
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- MENU CATEGORIES POLICIES (Public read, Admin write)
CREATE POLICY "Anyone can view menu categories"
  ON public.menu_categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage menu categories"
  ON public.menu_categories FOR ALL
  USING (public.is_admin(auth.uid()));

-- MENU ITEMS POLICIES (Public read, Admin write)
CREATE POLICY "Anyone can view menu items"
  ON public.menu_items FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage menu items"
  ON public.menu_items FOR ALL
  USING (public.is_admin(auth.uid()));

-- CUSTOMER ADDRESSES POLICIES
CREATE POLICY "Customers can view their own addresses"
  ON public.customer_addresses FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Customers can insert their own addresses"
  ON public.customer_addresses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Customers can update their own addresses"
  ON public.customer_addresses FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Customers can delete their own addresses"
  ON public.customer_addresses FOR DELETE
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- ORDERS POLICIES
CREATE POLICY "Customers can view their own orders"
  ON public.orders FOR SELECT
  USING (
    auth.uid() = customer_id
    OR public.is_admin(auth.uid())
    OR (public.is_rider(auth.uid()) AND EXISTS (
      SELECT 1 FROM public.rider_assignments ra
      WHERE ra.order_id = orders.id AND ra.rider_id = auth.uid()
    ))
  );

CREATE POLICY "Customers can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Orders can be updated by owner, rider or admin"
  ON public.orders FOR UPDATE
  USING (
    public.is_admin(auth.uid())
    OR auth.uid() = customer_id
    OR (public.is_rider(auth.uid()) AND EXISTS (
      SELECT 1 FROM public.rider_assignments ra
      WHERE ra.order_id = orders.id AND ra.rider_id = auth.uid()
    ))
  );

CREATE POLICY "Admins can delete orders"
  ON public.orders FOR DELETE
  USING (public.is_admin(auth.uid()));

-- ORDER ITEMS POLICIES
CREATE POLICY "Users can view order items for their orders"
  ON public.order_items FOR SELECT
  USING (
    public.is_admin(auth.uid())
    OR EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_items.order_id AND o.customer_id = auth.uid())
    OR (public.is_rider(auth.uid()) AND EXISTS (
      SELECT 1 FROM public.rider_assignments ra
      WHERE ra.order_id = order_items.order_id AND ra.rider_id = auth.uid()
    ))
  );

CREATE POLICY "Customers can insert order items for their orders"
  ON public.order_items FOR INSERT
  WITH CHECK (
    public.is_admin(auth.uid())
    OR EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_items.order_id AND o.customer_id = auth.uid())
  );

CREATE POLICY "Admins can manage order items"
  ON public.order_items FOR ALL
  USING (public.is_admin(auth.uid()));

-- PROMOTIONS POLICIES
CREATE POLICY "Anyone can view active promotions"
  ON public.promotions FOR SELECT
  USING (
    public.is_admin(auth.uid())
    OR (is_active = true AND start_date <= now() AND end_date >= now())
  );

CREATE POLICY "Admins can manage promotions"
  ON public.promotions FOR ALL
  USING (public.is_admin(auth.uid()));

-- RIDER ASSIGNMENTS POLICIES
CREATE POLICY "Riders can view their assignments"
  ON public.rider_assignments FOR SELECT
  USING (
    public.is_admin(auth.uid())
    OR (public.is_rider(auth.uid()) AND rider_id = auth.uid())
  );

CREATE POLICY "Admins can manage rider assignments"
  ON public.rider_assignments FOR ALL
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Riders can update their own assignments"
  ON public.rider_assignments FOR UPDATE
  USING (public.is_rider(auth.uid()) AND rider_id = auth.uid());

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_menu_categories_updated_at
  BEFORE UPDATE ON public.menu_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at
  BEFORE UPDATE ON public.menu_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customer_addresses_updated_at
  BEFORE UPDATE ON public.customer_addresses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_promotions_updated_at
  BEFORE UPDATE ON public.promotions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rider_assignments_updated_at
  BEFORE UPDATE ON public.rider_assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile and role on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id)
  VALUES (NEW.id);

  -- Create default customer role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_menu_items_category_id ON public.menu_items(category_id);
CREATE INDEX idx_customer_addresses_user_id ON public.customer_addresses(user_id);
CREATE INDEX idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_rider_assignments_rider_id ON public.rider_assignments(rider_id);
CREATE INDEX idx_rider_assignments_order_id ON public.rider_assignments(order_id);
CREATE INDEX idx_promotions_code ON public.promotions(code);

-- =====================================================
-- 2. STORAGE BUCKET FOR MENU IMAGES
-- =====================================================

-- Create storage bucket for menu item images
INSERT INTO storage.buckets (id, name, public)
VALUES ('menu-images', 'menu-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to view menu images (public bucket)
CREATE POLICY "Anyone can view menu images"
ON storage.objects FOR SELECT
USING (bucket_id = 'menu-images');

-- Allow admins to upload menu images
CREATE POLICY "Admins can upload menu images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'menu-images' AND is_admin(auth.uid()));

-- Allow admins to update menu images
CREATE POLICY "Admins can update menu images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'menu-images' AND is_admin(auth.uid()));

-- Allow admins to delete menu images
CREATE POLICY "Admins can delete menu images"
ON storage.objects FOR DELETE
USING (bucket_id = 'menu-images' AND is_admin(auth.uid()));

-- =====================================================
-- 3. ADDITIONAL FEATURES (FAVORITES, NOTIFICATIONS, RIDER LOCATIONS)
-- =====================================================

-- Favorites Table
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  menu_item_id TEXT REFERENCES public.menu_items(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, menu_item_id)
);

-- Notifications Table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info', -- 'info', 'success', 'warning', 'error'
  is_read BOOLEAN DEFAULT false,
  data JSONB, -- Additional data for the notification
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Rider Locations Table (for real-time tracking)
CREATE TABLE public.rider_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy DECIMAL(5, 2),
  heading DECIMAL(5, 2),
  speed DECIMAL(5, 2),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (rider_id)
);

-- Enable RLS for additional tables
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rider_locations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Favorites
CREATE POLICY "Users can view their own favorites"
  ON public.favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites"
  ON public.favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
  ON public.favorites FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for Notifications
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all notifications"
  ON public.notifications FOR ALL
  USING (public.is_admin(auth.uid()));

-- RLS Policies for Rider Locations
CREATE POLICY "Riders can update their own location"
  ON public.rider_locations FOR ALL
  USING (public.is_rider(auth.uid()) AND rider_id = auth.uid());

CREATE POLICY "Admins can view all rider locations"
  ON public.rider_locations FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Customers can view rider locations for their active orders"
  ON public.rider_locations FOR SELECT
  USING (
    public.is_customer(auth.uid()) AND
    EXISTS (
      SELECT 1 FROM public.rider_assignments ra
      JOIN public.orders o ON ra.order_id = o.id
      WHERE ra.rider_id = rider_locations.rider_id
      AND o.customer_id = auth.uid()
      AND o.status IN ('picked_up', 'on_the_way')
    )
  );

-- Indexes for additional tables
CREATE INDEX idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX idx_favorites_menu_item_id ON public.favorites(menu_item_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_rider_locations_rider_id ON public.rider_locations(rider_id);

-- Triggers for updated_at on additional tables
CREATE TRIGGER update_rider_locations_updated_at
  BEFORE UPDATE ON public.rider_locations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 4. SEED DATA (MENU ITEMS, CATEGORIES, PROMOTIONS)
-- =====================================================

-- Insert menu categories
INSERT INTO public.menu_categories (id, name, description, image_url, display_order, is_active) VALUES
('chicken', 'Fried Chicken', 'Crispy fried chicken pieces and combos', 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&q=80', 1, true),
('burgers', 'Burgers', 'Juicy burgers with fresh ingredients', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80', 2, true),
('sides', 'Sides', 'Delicious sides and fries', 'https://images.unsplash.com/photo-1630384060421-cb20aff8c59d?w=400&q=80', 3, true),
('drinks', 'Drinks', 'Refreshing beverages', 'https://images.unsplash.com/photo-1437418747212-8d9709afab22?w=400&q=80', 4, true),
('combos', 'Combo Meals', 'Value-packed meal deals', 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400&q=80', 5, true),
('desserts', 'Desserts', 'Sweet treats to end your meal', 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&q=80', 6, true);

-- Insert menu items
INSERT INTO public.menu_items (id, category_id, name, description, price, image_url, is_available, is_featured, preparation_time) VALUES
('item-1', 'chicken', '8-Piece Bucket', 'Crispy fried chicken bucket with 8 pieces of our signature recipe', 1200.00, 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&q=80', true, true, 15),
('item-2', 'burgers', 'Spicy Zinger Burger', 'Crispy chicken fillet with spicy mayo, lettuce and cheese', 550.00, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80', true, true, 10),
('item-3', 'chicken', 'Crispy Wings (6pc)', 'Golden crispy chicken wings with your choice of sauce', 450.00, 'https://images.unsplash.com/photo-1608039755401-742074f0548d?w=400&q=80', true, false, 12),
('item-4', 'sides', 'Loaded Fries', 'Crispy fries topped with cheese sauce, bacon bits and spring onions', 350.00, 'https://images.unsplash.com/photo-1630384060421-cb20aff8c59d?w=400&q=80', true, false, 8),
('item-5', 'burgers', 'Classic Chicken Burger', 'Tender chicken breast fillet with fresh lettuce and mayo', 450.00, 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400&q=80', true, false, 10),
('item-6', 'combos', 'Family Feast', '12-piece bucket, 4 fries, coleslaw, 4 drinks - feeds the whole family!', 2500.00, 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400&q=80', true, true, 20),
('item-7', 'desserts', 'Chocolate Sundae', 'Creamy vanilla ice cream with rich chocolate sauce', 200.00, 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&q=80', true, false, 5),
('item-8', 'drinks', 'Cold Soda (500ml)', 'Refreshing ice-cold soda - Coke, Fanta, or Sprite', 100.00, 'https://images.unsplash.com/photo-1437418747212-8d9709afab22?w=400&q=80', true, false, 2),
('item-9', 'sides', 'Coleslaw', 'Fresh and creamy coleslaw made daily', 150.00, 'https://images.unsplash.com/photo-1625938145312-89fa8643fb2e?w=400&q=80', true, false, 5),
('item-10', 'combos', '4-Piece Combo', '4 pieces of chicken, regular fries and a drink', 750.00, 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400&q=80', false, false, 15);

-- Insert promotions
INSERT INTO public.promotions (code, description, discount_type, discount_value, min_order_amount, max_discount, usage_limit, start_date, end_date, is_active, created_by) VALUES
('WELCOME10', 'Welcome discount for new customers', 'percentage', 10.00, 500.00, 200.00, 100, '2026-01-26 00:00:00+00', '2026-02-26 23:59:59+00', true, null),
('FAST20', '20% off for orders under 30 minutes', 'percentage', 20.00, 1000.00, 300.00, 50, '2026-01-26 00:00:00+00', '2026-01-31 23:59:59+00', true, null);

-- =====================================================
-- MIGRATION COMPLETE!
-- Your Speedy Bites database is now ready for production.
-- =====================================================