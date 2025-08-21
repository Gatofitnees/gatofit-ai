-- Insertar alimentos comunes del sistema en la tabla food_items
INSERT INTO public.food_items (
  name, 
  brand_name, 
  calories_per_serving, 
  protein_g_per_serving, 
  carbs_g_per_serving, 
  fat_g_per_serving, 
  serving_size_grams, 
  serving_size_unit, 
  is_verified_by_admin, 
  user_contributed_id
) VALUES
-- Proteínas
('Pechuga de Pollo', 'Sistema', 165, 31, 0, 3.6, 100, 'g', true, NULL),
('Muslo de Pollo', 'Sistema', 209, 26, 0, 11, 100, 'g', true, NULL),
('Salmón', 'Sistema', 208, 20, 0, 13, 100, 'g', true, NULL),
('Atún', 'Sistema', 144, 23, 0, 5, 100, 'g', true, NULL),
('Tilapia', 'Sistema', 128, 26, 0, 2.6, 100, 'g', true, NULL),
('Camarón', 'Sistema', 99, 18, 0.9, 1.4, 100, 'g', true, NULL),
('Huevo', 'Sistema', 155, 13, 1.1, 11, 100, 'g', true, NULL),
('Carne de Res', 'Sistema', 250, 26, 0, 15, 100, 'g', true, NULL),
('Cerdo', 'Sistema', 242, 27, 0, 14, 100, 'g', true, NULL),

-- Carbohidratos
('Arroz Blanco', 'Sistema', 130, 2.7, 28, 0.3, 100, 'g', true, NULL),
('Arroz Integral', 'Sistema', 111, 2.6, 23, 0.9, 100, 'g', true, NULL),
('Pasta', 'Sistema', 131, 5, 25, 1.1, 100, 'g', true, NULL),
('Papa', 'Sistema', 77, 2, 17, 0.1, 100, 'g', true, NULL),
('Batata', 'Sistema', 86, 1.6, 20, 0.1, 100, 'g', true, NULL),
('Avena', 'Sistema', 389, 16.9, 66, 6.9, 100, 'g', true, NULL),
('Quinoa', 'Sistema', 120, 4.4, 22, 1.9, 100, 'g', true, NULL),
('Pan Integral', 'Sistema', 247, 13, 41, 4.2, 100, 'g', true, NULL),

-- Frutas
('Plátano', 'Sistema', 89, 1.1, 23, 0.3, 100, 'g', true, NULL),
('Manzana', 'Sistema', 52, 0.3, 14, 0.2, 100, 'g', true, NULL),
('Naranja', 'Sistema', 47, 0.9, 12, 0.1, 100, 'g', true, NULL),
('Fresa', 'Sistema', 32, 0.7, 7.7, 0.3, 100, 'g', true, NULL),
('Uva', 'Sistema', 69, 0.7, 16, 0.2, 100, 'g', true, NULL),
('Piña', 'Sistema', 50, 0.5, 13, 0.1, 100, 'g', true, NULL),

-- Vegetales
('Brócoli', 'Sistema', 34, 2.8, 7, 0.4, 100, 'g', true, NULL),
('Espinaca', 'Sistema', 23, 2.9, 3.6, 0.4, 100, 'g', true, NULL),
('Zanahoria', 'Sistema', 41, 0.9, 10, 0.2, 100, 'g', true, NULL),
('Tomate', 'Sistema', 18, 0.9, 3.9, 0.2, 100, 'g', true, NULL),
('Lechuga', 'Sistema', 15, 1.4, 2.9, 0.2, 100, 'g', true, NULL),
('Cebolla', 'Sistema', 40, 1.1, 9.3, 0.1, 100, 'g', true, NULL),

-- Frutos secos y lácteos
('Almendra', 'Sistema', 579, 21, 22, 50, 100, 'g', true, NULL),
('Nuez', 'Sistema', 654, 15, 14, 65, 100, 'g', true, NULL),
('Leche Entera', 'Sistema', 42, 3.4, 5, 1, 100, 'ml', true, NULL),
('Yogur Natural', 'Sistema', 59, 10, 3.6, 0.4, 100, 'g', true, NULL),
('Queso Fresco', 'Sistema', 98, 11, 3.4, 4.3, 100, 'g', true, NULL),

-- Legumbres
('Frijoles', 'Sistema', 127, 9, 23, 0.5, 100, 'g', true, NULL),
('Lentejas', 'Sistema', 116, 9, 20, 0.4, 100, 'g', true, NULL),
('Garbanzos', 'Sistema', 164, 8.9, 27, 2.6, 100, 'g', true, NULL)

ON CONFLICT DO NOTHING;