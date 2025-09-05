-- Fix security vulnerability: Remove public access to discount codes
-- Only admins should be able to view discount codes directly
-- The apply_discount_code function will still work due to SECURITY DEFINER

-- Drop the public access policy
DROP POLICY IF EXISTS "Anyone can view active discount codes" ON discount_codes;

-- Keep only admin access for direct queries
-- The existing "Admins can manage discount codes" policy already covers admin access