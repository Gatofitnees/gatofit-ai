-- Crear vista con solo campos de branding (más seguro)
CREATE VIEW coach_branding_public AS
SELECT 
  id,
  company_name,
  banner_image_url,
  logo_image_url,
  ranking_image_url,
  primary_button_color,
  primary_button_fill_color
FROM admin_users;

-- Otorgar permisos SELECT a usuarios autenticados
GRANT SELECT ON coach_branding_public TO authenticated;