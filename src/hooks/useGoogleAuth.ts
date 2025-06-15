
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
      // Always use web OAuth flow for now
      // TODO: Add native Android support when building locally
      console.log('Using web OAuth Google Sign-In');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/onboarding/app-transition`,
          queryParams: {
            prompt: 'select_account'
          }
        },
      });
      
      if (error) {
        console.error('Web Google sign-in error:', error);
        throw error;
      }
      
      console.log('Web Google Auth initiated:', data);
      return { data, error: null };
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      
      toast({
        title: "Error al iniciar sesión con Google",
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
