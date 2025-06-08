
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { validateUsername, RateLimiter } from '@/utils/securityValidation';
import { UserProfile } from '@/types/userProfile';

// Rate limiter for profile updates (max 5 updates per minute)
const profileUpdateLimiter = new RateLimiter(5, 60000);

export const useSecureProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const secureUpdateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return false;

    // Rate limiting
    if (!profileUpdateLimiter.isAllowed(user.id)) {
      toast({
        title: "Error",
        description: "Too many profile updates. Please wait a moment before trying again.",
        variant: "destructive"
      });
      return false;
    }

    setLoading(true);
    try {
      // Enhanced username validation if username is being updated
      if (updates.username !== undefined) {
        const validation = validateUsername(updates.username);
        if (!validation.isValid) {
          toast({
            title: "Error",
            description: validation.error,
            variant: "destructive"
          });
          return false;
        }

        // Check case-insensitive availability
        const { data: existingUsers, error: checkError } = await supabase
          .from('profiles')
          .select('username')
          .ilike('username', updates.username)
          .neq('id', user.id);

        if (checkError) throw checkError;

        if (existingUsers && existingUsers.length > 0) {
          toast({
            title: "Error",
            description: "This username is already taken",
            variant: "destructive"
          });
          return false;
        }
      }

      // Sanitize text inputs
      const sanitizedUpdates: any = { ...updates };
      
      if (sanitizedUpdates.full_name) {
        sanitizedUpdates.full_name = sanitizedUpdates.full_name.trim().substring(0, 50);
      }
      
      if (sanitizedUpdates.bio) {
        sanitizedUpdates.bio = sanitizedUpdates.bio.trim().substring(0, 500);
      }

      // Validate numeric inputs
      if (sanitizedUpdates.height_cm !== undefined) {
        const height = Number(sanitizedUpdates.height_cm);
        if (isNaN(height) || height < 50 || height > 300) {
          toast({
            title: "Error",
            description: "Height must be between 50 and 300 cm",
            variant: "destructive"
          });
          return false;
        }
      }

      if (sanitizedUpdates.current_weight_kg !== undefined) {
        const weight = Number(sanitizedUpdates.current_weight_kg);
        if (isNaN(weight) || weight < 20 || weight > 500) {
          toast({
            title: "Error",
            description: "Weight must be between 20 and 500 kg",
            variant: "destructive"
          });
          return false;
        }
      }

      if (sanitizedUpdates.body_fat_percentage !== undefined) {
        const bodyFat = Number(sanitizedUpdates.body_fat_percentage);
        if (isNaN(bodyFat) || bodyFat < 1 || bodyFat > 50) {
          toast({
            title: "Error",
            description: "Body fat percentage must be between 1 and 50%",
            variant: "destructive"
          });
          return false;
        }
      }

      const { error } = await supabase
        .from('profiles')
        .update(sanitizedUpdates)
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Perfil actualizado correctamente"
      });
      return true;
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el perfil",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    secureUpdateProfile,
    loading
  };
};
