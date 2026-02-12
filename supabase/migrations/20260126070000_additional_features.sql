-- Additional tables for production features
-- Migration: 20260126070000_additional_features.sql

-- 1. Favorites Table
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, menu_item_id)
);

-- 2. Notifications Table
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

-- 3. Rider Locations Table (for real-time tracking)
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

-- Enable RLS
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

-- Indexes
CREATE INDEX idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX idx_favorites_menu_item_id ON public.favorites(menu_item_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_rider_locations_rider_id ON public.rider_locations(rider_id);

-- Triggers for updated_at
CREATE TRIGGER update_rider_locations_updated_at
  BEFORE UPDATE ON public.rider_locations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();</content>
<parameter name="filePath">/home/mall0y/Downloads/speedy-bites-app-main/supabase/migrations/20260126070000_additional_features.sql