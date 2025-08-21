-- Add categories and search functionality to food database

-- Create food categories table
CREATE TABLE public.food_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  icon_name TEXT,
  color_class TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create food search synonyms table  
CREATE TABLE public.food_search_synonyms (
  id SERIAL PRIMARY KEY,
  search_term TEXT NOT NULL,
  target_foods TEXT[] NOT NULL,
  category_id INTEGER REFERENCES public.food_categories(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add category columns to food_items
ALTER TABLE public.food_items 
ADD COLUMN category_id INTEGER REFERENCES public.food_categories(id),
ADD COLUMN subcategory TEXT,
ADD COLUMN description TEXT;

-- Insert food categories
INSERT INTO public.food_categories (name, icon_name, color_class) VALUES
('Proteínas', 'muscle', 'text-red-500'),
('Carbohidratos', 'wheat', 'text-yellow-500'),
('Vegetales', 'leaf', 'text-green-500'),
('Frutas', 'apple-whole', 'text-orange-500'),
('Lácteos', 'milk', 'text-blue-500'),
('Grasas Saludables', 'droplet', 'text-purple-500'),
('Bebidas', 'glass-water', 'text-cyan-500');

-- Update existing food items with categories
UPDATE public.food_items SET 
  category_id = 1, 
  subcategory = 'Carnes',
  description = 'Pechuga de pollo sin piel, cocida'
WHERE name ILIKE '%pollo%';

UPDATE public.food_items SET 
  category_id = 1,
  subcategory = 'Pescados', 
  description = 'Salmón fresco, cocido'
WHERE name ILIKE '%salmón%' OR name ILIKE '%salmon%';

UPDATE public.food_items SET 
  category_id = 2,
  subcategory = 'Cereales',
  description = 'Arroz blanco cocido'
WHERE name ILIKE '%arroz%';

UPDATE public.food_items SET 
  category_id = 3,
  subcategory = 'Verduras de hoja',
  description = 'Espinacas frescas'
WHERE name ILIKE '%espinaca%';

-- Add search synonyms for better search
INSERT INTO public.food_search_synonyms (search_term, target_foods, category_id) VALUES
('carnes', ARRAY['pollo', 'carne', 'res', 'cerdo', 'ternera'], 1),
('proteína', ARRAY['pollo', 'pescado', 'huevos', 'lentejas', 'quinoa'], 1),
('proteínas', ARRAY['pollo', 'pescado', 'huevos', 'lentejas', 'quinoa'], 1),
('pescado', ARRAY['salmón', 'atún', 'merluza', 'bacalao'], 1),
('verduras', ARRAY['espinacas', 'brócoli', 'lechuga', 'tomate'], 3),
('vegetales', ARRAY['espinacas', 'brócoli', 'lechuga', 'tomate'], 3);

-- Insert more food items with proper categories
INSERT INTO public.food_items (
  name, brand_name, calories_per_serving, protein_g_per_serving, 
  carbs_g_per_serving, fat_g_per_serving, serving_size_grams,
  serving_size_unit, category_id, subcategory, description, is_verified_by_admin
) VALUES
('Pechuga de Pollo', NULL, 165, 31, 0, 3.6, 100, 'g', 1, 'Carnes', 'Pechuga de pollo sin piel, cocida', true),
('Salmón', NULL, 208, 22, 0, 12, 100, 'g', 1, 'Pescados', 'Salmón del Atlántico, cocido', true),
('Huevos', NULL, 155, 13, 1, 11, 100, 'g', 1, 'Huevos', 'Huevos de gallina, cocidos', true),
('Atún', NULL, 184, 30, 0, 6, 100, 'g', 1, 'Pescados', 'Atún en agua, enlatado', true),
('Quinoa', NULL, 120, 4.4, 22, 1.9, 100, 'g', 2, 'Cereales', 'Quinoa cocida', true),
('Avena', NULL, 68, 2.4, 12, 1.4, 100, 'g', 2, 'Cereales', 'Avena cocida con agua', true),
('Pan Integral', NULL, 247, 13, 41, 4.2, 100, 'g', 2, 'Panes', 'Pan integral de trigo', true),
('Brócoli', NULL, 25, 3, 5, 0.4, 100, 'g', 3, 'Crucíferas', 'Brócoli cocido al vapor', true),
('Espinacas', NULL, 23, 2.9, 3.6, 0.4, 100, 'g', 3, 'Verduras de hoja', 'Espinacas frescas', true),
('Tomate', NULL, 18, 0.9, 3.9, 0.2, 100, 'g', 3, 'Frutos', 'Tomate fresco', true),
('Plátano', NULL, 89, 1.1, 23, 0.3, 100, 'g', 4, 'Tropicales', 'Plátano maduro', true),
('Manzana', NULL, 52, 0.3, 14, 0.2, 100, 'g', 4, 'Pomáceas', 'Manzana fresca con piel', true),
('Aguacate', NULL, 160, 2, 9, 15, 100, 'g', 6, 'Frutas grasas', 'Aguacate fresco', true),
('Almendras', NULL, 579, 21, 22, 50, 100, 'g', 6, 'Frutos secos', 'Almendras crudas', true),
('Yogur Griego', NULL, 59, 10, 3.6, 0.4, 100, 'g', 5, 'Yogures', 'Yogur griego natural desnatado', true),
('Leche', NULL, 42, 3.4, 5, 1, 100, 'ml', 5, 'Leches', 'Leche de vaca semidesnatada', true);

-- Enable RLS on new tables
ALTER TABLE public.food_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_search_synonyms ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view food categories" ON public.food_categories FOR SELECT USING (true);
CREATE POLICY "Anyone can view search synonyms" ON public.food_search_synonyms FOR SELECT USING (true);

-- Only admins can manage categories and synonyms
CREATE POLICY "Admins can manage food categories" ON public.food_categories FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can manage search synonyms" ON public.food_search_synonyms FOR ALL USING (is_admin()) WITH CHECK (is_admin());