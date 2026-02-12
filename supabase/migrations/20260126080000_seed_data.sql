-- Seed data for production
-- Migration: 20260126080000_seed_data.sql

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
('FAST20', '20% off for orders under 30 minutes', 'percentage', 20.00, 1000.00, 300.00, 50, '2026-01-26 00:00:00+00', '2026-01-31 23:59:59+00', true, null);</content>
<parameter name="filePath">/home/mall0y/Downloads/speedy-bites-app-main/supabase/migrations/20260126080000_seed_data.sql