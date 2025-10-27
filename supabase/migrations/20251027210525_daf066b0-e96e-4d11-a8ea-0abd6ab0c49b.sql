-- 1. Agregar columnas de branding a admin_users
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS banner_image_url TEXT,
ADD COLUMN IF NOT EXISTS logo_image_url TEXT,
ADD COLUMN IF NOT EXISTS ranking_image_url TEXT,
ADD COLUMN IF NOT EXISTS primary_button_color TEXT DEFAULT '#2094F3',
ADD COLUMN IF NOT EXISTS primary_button_fill_color TEXT DEFAULT '#2094F3';

-- 2. Comentarios para documentación
COMMENT ON COLUMN admin_users.company_name IS 'Nombre de la empresa del coach que reemplaza "Gatofit"';
COMMENT ON COLUMN admin_users.banner_image_url IS 'URL del banner para HomePage';
COMMENT ON COLUMN admin_users.logo_image_url IS 'URL del logo para AI Chat y planes';
COMMENT ON COLUMN admin_users.ranking_image_url IS 'URL de imagen para ranking';
COMMENT ON COLUMN admin_users.primary_button_color IS 'Color hexadecimal para borde de botones';
COMMENT ON COLUMN admin_users.primary_button_fill_color IS 'Color hexadecimal para relleno de botones';

-- 3. Datos de ejemplo para coach existente (lusplyod@gmail.com)
UPDATE admin_users 
SET 
  company_name = 'Gatofit Pro',
  banner_image_url = 'https://storage.googleapis.com/almacenamiento-app-gatofit/Recursos%20Branding%20APP/animaciones/animacion%20gatofit%202.gif',
  logo_image_url = 'https://storage.googleapis.com/almacenamiento-app-gatofit/Recursos%20Branding%20APP/gatofit%20logo%20APP.png',
  ranking_image_url = 'https://storage.googleapis.com/almacenamiento-app-gatofit/Recursos%20Branding%20APP/animaciones/animacion%20gatofit%202.gif',
  primary_button_color = '#2094F3',
  primary_button_fill_color = '#2094F3'
WHERE email = 'lusplyod@gmail.com';