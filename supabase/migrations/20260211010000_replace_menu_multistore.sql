-- Migration: Replace menu with 3-store setup (Restaurant, Butchery, Groceries)
-- Deletes old categories and items, then inserts new store sections

BEGIN;

-- Clear old data
DELETE FROM public.menu_items;
DELETE FROM public.menu_categories;

-- Insert 3 new store categories
INSERT INTO public.menu_categories (name, description, image_url, display_order, is_active)
VALUES
  ('Restaurant', 'Snacks and dishes including Chapati, Rice, Pilau, Ugali and more', 'https://images.unsplash.com/photo-1504674900174-9cb4234f4f75?w=400&q=80', 1, true),
  ('Butchery', 'Fresh meats, organs, and poultry products', 'https://images.unsplash.com/photo-1551632786-7f2be2254cc3?w=400&q=80', 2, true),
  ('Groceries', 'Fresh produce including onions and tomatoes', 'https://images.unsplash.com/photo-1488459716781-6918f33427d7?w=400&q=80', 3, true);

-- Insert Restaurant items (11 items)
INSERT INTO public.menu_items (category_id, name, description, price, image_url, is_available, is_featured, preparation_time)
SELECT 
  (SELECT id FROM public.menu_categories WHERE name = 'Restaurant'),
  'Chapati Chicken',
  'Soft chapati served with tender chicken',
  300.00,
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80',
  true, true, 10
UNION ALL
SELECT 
  (SELECT id FROM public.menu_categories WHERE name = 'Restaurant'),
  'Veg Rice and Chicken',
  'Fragrant rice with vegetables and chicken',
  100.00,
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80',
  true, true, 12
UNION ALL
SELECT 
  (SELECT id FROM public.menu_categories WHERE name = 'Restaurant'),
  'Pilau & Chicken',
  'Spiced rice pilau served with chicken',
  380.00,
  'https://images.unsplash.com/photo-1584193961214-ab52acb08335?w=400&q=80',
  true, true, 15
UNION ALL
SELECT 
  (SELECT id FROM public.menu_categories WHERE name = 'Restaurant'),
  'Ugali & Wet Fry Chicken',
  'Maize porridge with chicken in tomato sauce',
  230.00,
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80',
  true, false, 12
UNION ALL
SELECT 
  (SELECT id FROM public.menu_categories WHERE name = 'Restaurant'),
  'Ugali & Greens',
  'Maize porridge served with boiled greens',
  100.00,
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80',
  true, false, 10
UNION ALL
SELECT 
  (SELECT id FROM public.menu_categories WHERE name = 'Restaurant'),
  'Pilau',
  'Aromatic spiced rice',
  200.00,
  'https://images.unsplash.com/photo-1584193961214-ab52acb08335?w=400&q=80',
  true, false, 12
UNION ALL
SELECT 
  (SELECT id FROM public.menu_categories WHERE name = 'Restaurant'),
  'Beef Wet Fry',
  'Beef cooked in tomato sauce',
  200.00,
  'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=400&q=80',
  true, false, 15
UNION ALL
SELECT 
  (SELECT id FROM public.menu_categories WHERE name = 'Restaurant'),
  'Bhajia',
  'Deep-fried battered vegetables',
  150.00,
  'https://images.unsplash.com/photo-1599599810694-b5ac4dd64e12?w=400&q=80',
  true, false, 8
UNION ALL
SELECT 
  (SELECT id FROM public.menu_categories WHERE name = 'Restaurant'),
  'Choma Special',
  'Grilled meat special with seasoning',
  320.00,
  'https://images.unsplash.com/photo-1555939594-58d7cb561404?w=400&q=80',
  true, true, 20
UNION ALL
SELECT 
  (SELECT id FROM public.menu_categories WHERE name = 'Restaurant'),
  'Chapo',
  'Thin fried bread',
  30.00,
  'https://images.unsplash.com/photo-1565958011504-4b02fcef0d91?w=400&q=80',
  true, false, 5
UNION ALL
SELECT 
  (SELECT id FROM public.menu_categories WHERE name = 'Restaurant'),
  'Chips and Chicken',
  'Crispy fried potatoes with chicken',
  370.00,
  'https://images.unsplash.com/photo-1573080496104-febf75cf3f3f?w=400&q=80',
  true, true, 12;

-- Insert Butchery items (14 items)
INSERT INTO public.menu_items (category_id, name, description, price, image_url, is_available, is_featured, preparation_time)
SELECT 
  (SELECT id FROM public.menu_categories WHERE name = 'Butchery'),
  'Chicken Skins',
  'Fresh chicken skins - per kg',
  250.00,
  'https://images.unsplash.com/photo-1585238341710-4dd0e06f2d4b?w=400&q=80',
  true, false, 0
UNION ALL
SELECT 
  (SELECT id FROM public.menu_categories WHERE name = 'Butchery'),
  'Sausages',
  'Fresh pork sausages',
  720.00,
  'https://images.unsplash.com/photo-1555939594-58d7cb561404?w=400&q=80',
  true, false, 0
UNION ALL
SELECT 
  (SELECT id FROM public.menu_categories WHERE name = 'Butchery'),
  'Smokies',
  'Smoked sausages - tray',
  580.00,
  'https://images.unsplash.com/photo-1555939594-58d7cb561404?w=400&q=80',
  true, false, 0
UNION ALL
SELECT 
  (SELECT id FROM public.menu_categories WHERE name = 'Butchery'),
  'Tray of Eggs',
  '30 eggs per tray',
  450.00,
  'https://images.unsplash.com/photo-1599599810694-b5ac4dd64e12?w=400&q=80',
  true, true, 0
UNION ALL
SELECT 
  (SELECT id FROM public.menu_categories WHERE name = 'Butchery'),
  'Gizzards',
  'Chicken gizzards - per kg',
  600.00,
  'https://images.unsplash.com/photo-1585238341710-4dd0e06f2d4b?w=400&q=80',
  true, false, 0
UNION ALL
SELECT 
  (SELECT id FROM public.menu_categories WHERE name = 'Butchery'),
  'Chicken Liver',
  'Fresh chicken liver - per kg',
  400.00,
  'https://images.unsplash.com/photo-1585238341710-4dd0e06f2d4b?w=400&q=80',
  true, false, 0
UNION ALL
SELECT 
  (SELECT id FROM public.menu_categories WHERE name = 'Butchery'),
  'Wings',
  'Chicken wings - per kg',
  580.00,
  'https://images.unsplash.com/photo-1585238341710-4dd0e06f2d4b?w=400&q=80',
  true, false, 0
UNION ALL
SELECT 
  (SELECT id FROM public.menu_categories WHERE name = 'Butchery'),
  'Drumstick',
  'Chicken drumstick - per kg',
  700.00,
  'https://images.unsplash.com/photo-1585238341710-4dd0e06f2d4b?w=400&q=80',
  true, false, 0
UNION ALL
SELECT 
  (SELECT id FROM public.menu_categories WHERE name = 'Butchery'),
  'Thighs',
  'Chicken thighs - per kg',
  600.00,
  'https://images.unsplash.com/photo-1585238341710-4dd0e06f2d4b?w=400&q=80',
  true, false, 0
UNION ALL
SELECT 
  (SELECT id FROM public.menu_categories WHERE name = 'Butchery'),
  'Breast',
  'Chicken breast - per kg',
  650.00,
  'https://images.unsplash.com/photo-1585238341710-4dd0e06f2d4b?w=400&q=80',
  true, true, 0
UNION ALL
SELECT 
  (SELECT id FROM public.menu_categories WHERE name = 'Butchery'),
  'Broiler',
  'Whole broiler chicken - per kg',
  580.00,
  'https://images.unsplash.com/photo-1585238341710-4dd0e06f2d4b?w=400&q=80',
  true, true, 0
UNION ALL
SELECT 
  (SELECT id FROM public.menu_categories WHERE name = 'Butchery'),
  'Chicken Necks',
  'Chicken necks - per kg',
  350.00,
  'https://images.unsplash.com/photo-1585238341710-4dd0e06f2d4b?w=400&q=80',
  true, false, 0
UNION ALL
SELECT 
  (SELECT id FROM public.menu_categories WHERE name = 'Butchery'),
  'Chicken Heads and Feet',
  'Chicken heads and feet - per kg',
  150.00,
  'https://images.unsplash.com/photo-1585238341710-4dd0e06f2d4b?w=400&q=80',
  true, false, 0;

-- Insert Groceries items (2 items)
INSERT INTO public.menu_items (category_id, name, description, price, image_url, is_available, is_featured, preparation_time)
SELECT 
  (SELECT id FROM public.menu_categories WHERE name = 'Groceries'),
  'Onions',
  'Fresh onions - per kg',
  80.00,
  'https://images.unsplash.com/photo-1599599810694-b5ac4dd64e12?w=400&q=80',
  true, false, 0
UNION ALL
SELECT 
  (SELECT id FROM public.menu_categories WHERE name = 'Groceries'),
  'Tomatoes',
  'Fresh tomatoes - per kg',
  120.00,
  'https://images.unsplash.com/photo-1599599810694-b5ac4dd64e12?w=400&q=80',
  true, false, 0;

COMMIT;
