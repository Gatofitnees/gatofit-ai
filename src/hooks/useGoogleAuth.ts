
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePlatform } from './usePlatform';
import { useToast } from '@/hooks/use-toast';

export const useGoogleAuth = () => {
  const [loading, setLoading] = useState(false);
  const { isNative, isAndroid } = usePlatform();
  const { toast } = useToast();

  const signInWithGoogle = async () => {
    setLoading(true);
    
    try {
      // Get the current origin dynamically
      const currentOrigin = window.location.origin;
      console.log('Current origin for Google auth:', currentOrigin);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${currentOrigin}/onboarding/app-transition`,
          queryParams: {
            prompt: 'select_account'
          }
        },
      });
      
      if (error) {
        console.error('Google sign-in error:', error);
        throw error;
      }
      
      console.log('Google Auth initiated:', data);
      return { data, error: null };
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      
      // More specific error handling for common Google auth issues
      let errorMessage = "Error al iniciar sesión con Google";
      
      if (error.message?.includes('requested path is invalid')) {
        errorMessage = "Error de configuración. Por favor, contacta al administrador.";
      } else if (error.message?.includes('redirect')) {
        errorMessage = "Error de redirección. Inténtalo de nuevo.";
      }
      
      toast({
        title: errorMessage,
        description: error.message || "Error desconocido",
        variant: "destructive"
      });
      
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  return {
    signInWithGoogle,
    loading,
    isNative,
    isAndroid
  };
};
