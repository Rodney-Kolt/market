-- ============================================================
-- Market Assistant – Sample Seed Data
-- Run AFTER schema.sql. Replace UUIDs with real auth user IDs
-- if you want to test with actual accounts.
-- ============================================================

-- Sample businesses (owner_id will need to be a real user UUID)
-- These are for demo/preview purposes only.

INSERT INTO public.businesses (id, owner_id, name, description, address, contact_phone, contact_email, cuisine_type, price_range, dietary_options, rating_avg, rating_count, transparency_score)
VALUES
  (
    'b1000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001', -- replace with real owner UUID
    'The Golden Fork',
    'A cozy neighborhood bistro serving farm-to-table American cuisine with seasonal ingredients.',
    '123 Main Street, Downtown',
    '+1 (555) 123-4567',
    'hello@goldenfork.com',
    'American',
    '$$',
    ARRAY['vegetarian', 'gluten-free'],
    4.5,
    42,
    78
  ),
  (
    'b2000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'Spice Garden',
    'Authentic Indian cuisine with a modern twist. Family recipes passed down for generations.',
    '456 Oak Avenue, Midtown',
    '+1 (555) 987-6543',
    'info@spicegarden.com',
    'Indian',
    '$',
    ARRAY['vegan', 'vegetarian', 'halal'],
    4.8,
    127,
    85
  ),
  (
    'b3000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'Brew & Bites Cafe',
    'Specialty coffee, fresh pastries, and light bites in a relaxed atmosphere.',
    '789 Elm Street, Arts District',
    '+1 (555) 456-7890',
    'hi@brewandbites.com',
    'Cafe',
    '$',
    ARRAY['vegan', 'dairy-free'],
    4.2,
    89,
    65
  );

-- Sample menu items
INSERT INTO public.menu_items (business_id, name, description, price, category, is_available_today, dietary_tags)
VALUES
  ('b1000000-0000-0000-0000-000000000001', 'Grilled Salmon', 'Atlantic salmon with lemon butter sauce and seasonal vegetables', 24.99, 'Mains', true, ARRAY['gluten-free']),
  ('b1000000-0000-0000-0000-000000000001', 'Caesar Salad', 'Romaine lettuce, house-made dressing, croutons, parmesan', 12.99, 'Starters', true, ARRAY['vegetarian']),
  ('b1000000-0000-0000-0000-000000000001', 'Chocolate Lava Cake', 'Warm chocolate cake with vanilla ice cream', 8.99, 'Desserts', false, NULL),
  ('b1000000-0000-0000-0000-000000000001', 'Craft Lemonade', 'Fresh-squeezed with mint and ginger', 4.99, 'Drinks', true, ARRAY['vegan', 'gluten-free']),

  ('b2000000-0000-0000-0000-000000000002', 'Butter Chicken', 'Tender chicken in rich tomato-cream sauce, served with basmati rice', 16.99, 'Mains', true, ARRAY['halal']),
  ('b2000000-0000-0000-0000-000000000002', 'Palak Paneer', 'Fresh spinach with cottage cheese in spiced gravy', 14.99, 'Mains', true, ARRAY['vegetarian', 'gluten-free']),
  ('b2000000-0000-0000-0000-000000000002', 'Samosa (2 pcs)', 'Crispy pastry filled with spiced potatoes and peas', 5.99, 'Starters', true, ARRAY['vegan']),
  ('b2000000-0000-0000-0000-000000000002', 'Mango Lassi', 'Chilled yogurt drink with fresh mango', 4.99, 'Drinks', true, ARRAY['vegetarian']),

  ('b3000000-0000-0000-0000-000000000003', 'Flat White', 'Double espresso with steamed micro-foam milk', 4.50, 'Drinks', true, NULL),
  ('b3000000-0000-0000-0000-000000000003', 'Avocado Toast', 'Sourdough with smashed avocado, cherry tomatoes, feta', 9.99, 'Breakfast', true, ARRAY['vegetarian']),
  ('b3000000-0000-0000-0000-000000000003', 'Blueberry Muffin', 'Freshly baked with wild blueberries', 3.50, 'Snacks', true, ARRAY['vegetarian']);
