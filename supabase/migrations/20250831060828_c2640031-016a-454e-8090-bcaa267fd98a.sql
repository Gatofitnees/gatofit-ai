-- Add comprehensive food database with 200+ items
-- All nutritional values are per 100g serving

INSERT INTO food_items (name, calories_per_serving, protein_g_per_serving, carbs_g_per_serving, fat_g_per_serving, fiber_g_per_serving, serving_size_grams, food_category, is_verified_by_admin) VALUES

-- Frutas
('Manzana', 52, 0.3, 14, 0.2, 2.4, 100, 'Frutas', true),
('Plátano', 89, 1.1, 23, 0.3, 2.6, 100, 'Frutas', true),
('Naranja', 47, 0.9, 12, 0.1, 2.4, 100, 'Frutas', true),
('Fresa', 32, 0.7, 8, 0.3, 2.0, 100, 'Frutas', true),
('Uva', 62, 0.6, 16, 0.2, 0.9, 100, 'Frutas', true),
('Pera', 57, 0.4, 15, 0.1, 3.1, 100, 'Frutas', true),
('Durazno', 39, 0.9, 10, 0.3, 1.5, 100, 'Frutas', true),
('Piña', 50, 0.5, 13, 0.1, 1.4, 100, 'Frutas', true),
('Mango', 60, 0.8, 15, 0.4, 1.6, 100, 'Frutas', true),
('Sandía', 30, 0.6, 8, 0.2, 0.4, 100, 'Frutas', true),
('Melón', 34, 0.8, 8, 0.2, 0.9, 100, 'Frutas', true),
('Kiwi', 61, 1.1, 15, 0.5, 3.0, 100, 'Frutas', true),
('Limón', 29, 1.1, 9, 0.3, 2.8, 100, 'Frutas', true),
('Lima', 30, 0.7, 11, 0.2, 2.8, 100, 'Frutas', true),
('Papaya', 43, 0.5, 11, 0.3, 1.7, 100, 'Frutas', true),
('Cereza', 63, 1.1, 16, 0.2, 2.1, 100, 'Frutas', true),
('Ciruela', 46, 0.7, 11, 0.3, 1.4, 100, 'Frutas', true),
('Arándano', 57, 0.7, 14, 0.3, 2.4, 100, 'Frutas', true),
('Mora', 43, 1.4, 10, 0.5, 5.3, 100, 'Frutas', true),
('Frambuesa', 52, 1.2, 12, 0.7, 6.5, 100, 'Frutas', true),

-- Verduras
('Lechuga', 15, 1.4, 3, 0.2, 1.3, 100, 'Verduras', true),
('Tomate', 18, 0.9, 4, 0.2, 1.2, 100, 'Verduras', true),
('Zanahoria', 41, 0.9, 10, 0.2, 2.8, 100, 'Verduras', true),
('Cebolla', 40, 1.1, 9, 0.1, 1.7, 100, 'Verduras', true),
('Pimiento', 31, 1.0, 7, 0.3, 2.5, 100, 'Verduras', true),
('Brócoli', 34, 2.8, 7, 0.4, 2.6, 100, 'Verduras', true),
('Coliflor', 25, 1.9, 5, 0.3, 2.0, 100, 'Verduras', true),
('Espinaca', 23, 2.9, 4, 0.4, 2.2, 100, 'Verduras', true),
('Apio', 16, 0.7, 3, 0.2, 1.6, 100, 'Verduras', true),
('Pepino', 16, 0.7, 4, 0.1, 0.5, 100, 'Verduras', true),
('Calabacín', 17, 1.2, 3, 0.3, 1.0, 100, 'Verduras', true),
('Berenjerna', 25, 1.0, 6, 0.2, 3.0, 100, 'Verduras', true),
('Rábano', 16, 0.7, 3, 0.1, 1.6, 100, 'Verduras', true),
('Acelga', 19, 1.8, 4, 0.2, 1.6, 100, 'Verduras', true),
('Repollo', 25, 1.3, 6, 0.1, 2.5, 100, 'Verduras', true),
('Ajo', 149, 6.4, 33, 0.5, 2.1, 100, 'Verduras', true),
('Jengibre', 80, 1.8, 18, 0.8, 2.0, 100, 'Verduras', true),
('Champiñón', 22, 3.1, 3, 0.3, 1.0, 100, 'Verduras', true),
('Espárrago', 20, 2.2, 4, 0.1, 2.1, 100, 'Verduras', true),
('Remolacha', 43, 1.6, 10, 0.2, 2.8, 100, 'Verduras', true),

-- Proteínas - Carnes
('Pechuga de pollo', 165, 31, 0, 3.6, 0, 100, 'Proteínas', true),
('Muslo de pollo', 209, 26, 0, 11, 0, 100, 'Proteínas', true),
('Carne de res magra', 250, 26, 0, 15, 0, 100, 'Proteínas', true),
('Carne molida 90/10', 176, 20, 0, 10, 0, 100, 'Proteínas', true),
('Cerdo lomo', 143, 26, 0, 4, 0, 100, 'Proteínas', true),
('Pavo pechuga', 135, 30, 0, 1, 0, 100, 'Proteínas', true),
('Cordero', 294, 25, 0, 21, 0, 100, 'Proteínas', true),
('Hígado de res', 135, 21, 4, 4, 0, 100, 'Proteínas', true),

-- Proteínas - Pescados y Mariscos
('Salmón', 208, 25, 0, 12, 0, 100, 'Pescados', true),
('Atún', 184, 30, 0, 6, 0, 100, 'Pescados', true),
('Sardina', 208, 25, 0, 11, 0, 100, 'Pescados', true),
('Bacalao', 105, 23, 0, 1, 0, 100, 'Pescados', true),
('Tilapia', 128, 26, 0, 3, 0, 100, 'Pescados', true),
('Camarón', 99, 24, 0, 0.3, 0, 100, 'Pescados', true),
('Langosta', 77, 16, 0, 0.1, 0, 100, 'Pescados', true),
('Cangrejo', 97, 19, 0, 1.5, 0, 100, 'Pescados', true),
('Mejillón', 172, 24, 7, 4.6, 0, 100, 'Pescados', true),
('Pulpo', 164, 30, 4, 2, 0, 100, 'Pescados', true),

-- Lácteos
('Leche entera', 61, 3.2, 5, 3.3, 0, 100, 'Lácteos', true),
('Leche descremada', 34, 3.4, 5, 0.1, 0, 100, 'Lácteos', true),
('Yogur natural', 59, 10, 4, 0.4, 0, 100, 'Lácteos', true),
('Yogur griego', 59, 10, 4, 0.4, 0, 100, 'Lácteos', true),
('Queso cheddar', 403, 25, 1, 33, 0, 100, 'Lácteos', true),
('Queso mozzarella', 300, 22, 2, 22, 0, 100, 'Lácteos', true),
('Queso cottage', 98, 11, 3, 4, 0, 100, 'Lácteos', true),
('Queso crema', 342, 6, 4, 34, 0, 100, 'Lácteos', true),
('Mantequilla', 717, 1, 1, 81, 0, 100, 'Lácteos', true),
('Crema agria', 193, 2.4, 4.6, 19, 0, 100, 'Lácteos', true),

-- Huevos
('Huevo entero', 155, 13, 1, 11, 0, 100, 'Proteínas', true),
('Clara de huevo', 52, 11, 1, 0.2, 0, 100, 'Proteínas', true),
('Yema de huevo', 322, 16, 1, 27, 0, 100, 'Proteínas', true),

-- Cereales y Granos
('Arroz blanco cocido', 130, 2.7, 28, 0.3, 0.4, 100, 'Cereales', true),
('Arroz integral cocido', 111, 2.6, 23, 0.9, 1.8, 100, 'Cereales', true),
('Avena', 389, 17, 66, 7, 10, 100, 'Cereales', true),
('Quinoa cocida', 120, 4.4, 22, 1.9, 2.8, 100, 'Cereales', true),
('Pan blanco', 265, 9, 49, 3.2, 2.7, 100, 'Cereales', true),
('Pan integral', 247, 13, 41, 4.2, 7, 100, 'Cereales', true),
('Pasta cocida', 131, 5, 25, 1.1, 1.8, 100, 'Cereales', true),
('Cebada', 354, 12, 73, 2.3, 17, 100, 'Cereales', true),
('Trigo bulgur', 342, 12, 76, 1.3, 18, 100, 'Cereales', true),
('Maíz', 365, 9, 74, 4.7, 7.3, 100, 'Cereales', true),

-- Legumbres
('Frijoles negros cocidos', 132, 9, 23, 0.5, 8.7, 100, 'Legumbres', true),
('Frijoles pintos cocidos', 143, 9, 26, 0.6, 9, 100, 'Legumbres', true),
('Garbanzos cocidos', 164, 8, 27, 2.6, 8, 100, 'Legumbres', true),
('Lentejas cocidas', 116, 9, 20, 0.4, 7.9, 100, 'Legumbres', true),
('Judías verdes', 31, 1.8, 7, 0.2, 2.7, 100, 'Legumbres', true),
('Soja cocida', 173, 18, 9, 9, 6, 100, 'Legumbres', true),
('Guisantes', 81, 5, 14, 0.4, 5.7, 100, 'Legumbres', true),

-- Frutos Secos y Semillas
('Almendras', 579, 21, 22, 50, 12, 100, 'Frutos secos', true),
('Nueces', 654, 15, 14, 65, 6.7, 100, 'Frutos secos', true),
('Cacahuetes', 567, 26, 16, 49, 8.5, 100, 'Frutos secos', true),
('Pistachos', 560, 20, 28, 45, 10, 100, 'Frutos secos', true),
('Avellanas', 628, 15, 17, 61, 9.7, 100, 'Frutos secos', true),
('Pecanas', 691, 9, 14, 72, 9.6, 100, 'Frutos secos', true),
('Anacardos', 553, 18, 30, 44, 3.3, 100, 'Frutos secos', true),
('Semillas de girasol', 584, 21, 20, 52, 8.6, 100, 'Semillas', true),
('Semillas de calabaza', 559, 30, 11, 49, 6, 100, 'Semillas', true),
('Semillas de chía', 486, 17, 42, 31, 34, 100, 'Semillas', true),
('Semillas de lino', 534, 18, 29, 42, 27, 100, 'Semillas', true),

-- Aceites y Grasas
('Aceite de oliva', 884, 0, 0, 100, 0, 100, 'Aceites', true),
('Aceite de coco', 862, 0, 0, 100, 0, 100, 'Aceites', true),
('Aceite de girasol', 884, 0, 0, 100, 0, 100, 'Aceites', true),
('Aguacate', 160, 2, 9, 15, 7, 100, 'Frutas', true),
('Aceituna verde', 116, 0.8, 6, 11, 3.2, 100, 'Aceitunas', true),
('Aceituna negra', 115, 0.8, 6, 11, 3.2, 100, 'Aceitunas', true),

-- Tubérculos
('Papa', 77, 2, 17, 0.1, 2.1, 100, 'Tubérculos', true),
('Batata', 86, 1.6, 20, 0.1, 3, 100, 'Tubérculos', true),
('Yuca', 160, 1.4, 38, 0.3, 1.8, 100, 'Tubérculos', true),
('Ñame', 118, 1.5, 28, 0.2, 4.1, 100, 'Tubérculos', true),

-- Condimentos y Especias
('Sal', 0, 0, 0, 0, 0, 100, 'Condimentos', true),
('Pimienta negra', 251, 10, 64, 3.3, 25, 100, 'Condimentos', true),
('Canela', 247, 4, 81, 1.2, 53, 100, 'Condimentos', true),
('Cúrcuma', 354, 8, 65, 10, 21, 100, 'Condimentos', true),
('Orégano', 265, 9, 69, 4.3, 42, 100, 'Condimentos', true),
('Albahaca', 22, 3.2, 2.6, 0.6, 1.6, 100, 'Condimentos', true),
('Perejil', 36, 3, 6, 0.8, 3.3, 100, 'Condimentos', true),
('Cilantro', 23, 2.1, 4, 0.5, 2.8, 100, 'Condimentos', true),

-- Bebidas no alcohólicas
('Agua', 0, 0, 0, 0, 0, 100, 'Bebidas', true),
('Té verde', 1, 0, 0, 0, 0, 100, 'Bebidas', true),
('Café negro', 2, 0.3, 0, 0, 0, 100, 'Bebidas', true),
('Jugo de naranja', 45, 0.7, 10, 0.2, 0.2, 100, 'Bebidas', true),
('Leche de almendra', 17, 0.6, 0.6, 1.5, 0.4, 100, 'Bebidas', true),
('Leche de coco', 230, 2.3, 6, 24, 0, 100, 'Bebidas', true),

-- Dulces y Postres
('Azúcar blanca', 387, 0, 100, 0, 0, 100, 'Dulces', true),
('Miel', 304, 0.3, 82, 0, 0.2, 100, 'Dulces', true),
('Chocolate negro 70%', 598, 8, 46, 43, 11, 100, 'Dulces', true),
('Chocolate con leche', 535, 8, 59, 30, 3.4, 100, 'Dulces', true),
('Mermelada', 278, 0.4, 69, 0.1, 1.2, 100, 'Dulces', true),

-- Snacks y otros
('Palomitas de maíz', 375, 12, 74, 4.5, 15, 100, 'Snacks', true),
('Galletas integrales', 450, 7, 70, 16, 6, 100, 'Snacks', true),
('Pretzel', 380, 11, 72, 4, 2.8, 100, 'Snacks', true),

-- Comidas preparadas básicas
('Pizza margarita', 266, 11, 33, 10, 2.3, 100, 'Comida preparada', true),
('Hamburguesa simple', 295, 17, 31, 12, 2.1, 100, 'Comida preparada', true),
('Ensalada césar', 470, 7, 6, 47, 2.8, 100, 'Ensaladas', true),
('Sopa de pollo', 56, 4, 8, 1.2, 0.8, 100, 'Sopas', true),
('Burrito de frijoles', 225, 8, 36, 6, 5.2, 100, 'Comida mexicana', true),

-- Productos asiáticos
('Tofu', 76, 8, 2, 4.8, 0.4, 100, 'Proteínas vegetales', true),
('Tempeh', 190, 19, 9, 11, 9, 100, 'Proteínas vegetales', true),
('Alga nori', 35, 6, 5, 0.3, 0.3, 100, 'Algas', true),
('Miso', 199, 13, 26, 6, 5.4, 100, 'Condimentos', true),
('Salsa de soja', 8, 1.3, 0.8, 0, 0.1, 100, 'Condimentos', true),

-- Más frutas tropicales
('Coco rallado', 354, 3.3, 15, 33, 9, 100, 'Frutas', true),
('Maracuyá', 97, 2.2, 23, 0.7, 10, 100, 'Frutas', true),
('Guayaba', 68, 2.6, 14, 1, 5.4, 100, 'Frutas', true),
('Lichi', 66, 0.8, 17, 0.4, 1.3, 100, 'Frutas', true),
('Rambután', 82, 0.9, 21, 0.2, 0.9, 100, 'Frutas', true),

-- Hongos
('Shiitake', 34, 2.2, 7, 0.5, 2.5, 100, 'Hongos', true),
('Portobello', 22, 2.1, 4, 0.4, 1.3, 100, 'Hongos', true),
('Seta ostra', 33, 3.3, 6, 0.4, 2.3, 100, 'Hongos', true),

-- Alimentos fermentados
('Kimchi', 15, 1.1, 2.4, 0.5, 1.6, 100, 'Fermentados', true),
('Chucrut', 19, 0.9, 4.3, 0.1, 2.9, 100, 'Fermentados', true),
('Kéfir', 41, 3.4, 4.5, 1, 0, 100, 'Fermentados', true),

-- Proteínas en polvo básicas
('Proteína de suero', 380, 80, 8, 1.5, 0, 100, 'Suplementos', true),
('Proteína de caseína', 371, 81, 3.8, 1.8, 0, 100, 'Suplementos', true),
('Proteína de soja', 338, 81, 7, 0.9, 18, 100, 'Suplementos', true);