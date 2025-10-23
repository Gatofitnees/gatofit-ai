import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePlatform } from './usePlatform';
import { useToast } from '@/hooks/use-toast';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

export const useGoogleAuth = () => {
  const [loading, setLoading] = useState(false);
  const { isNative, isAndroid, isIOS } = usePlatform();
  const { toast } = useToast();

  // Initialize Google Auth plugin for native platforms
  const initializeGoogleAuth = async () => {
    if (!isNative) return;
    
    try {
      await GoogleAuth.initialize({
        clientId: '175681669860-6r9ejdog30rsm6l5auge5bmdnrak4n6e.apps.googleusercontent.com',
        scopes: ['profile', 'email'],
        grantOfflineAccess: true,
      });
      console.log('🚀 Google Auth nativo inicializado');
    } catch (error) {
      console.error('Error inicializando Google Auth:', error);
    }
  };

  // Native Google Sign-In (Android/iOS)
  const signInWithNativeGoogle = async () => {
    try {
      console.log('🔐 Iniciando autenticación Google nativa...');
      
      // Initialize plugin
      await initializeGoogleAuth();
      
      // Open native Google account picker
      const googleUser = await GoogleAuth.signIn();
      console.log('✅ Usuario de Google obtenido:', googleUser.email);
      
      // Authenticate with Supabase using Google ID token
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: googleUser.authentication.idToken,
      });
      
      if (error) {
        console.error('Error autenticando con Supabase:', error);
        throw error;
      }
      
      console.log('✅ Autenticación nativa exitosa');
      return { data, error: null };
    } catch (error: any) {
      console.error('Error en autenticación nativa:', error);
      
      // User cancelled
      if (error.message?.includes('cancel') || error.message?.includes('popup_closed')) {
        return { data: null, error: { message: 'Autenticación cancelada' } };
      }
      
      throw error;
    }
  };

  // Web OAuth Google Sign-In
  const signInWithOAuthGoogle = async () => {
    try {
      const currentOrigin = window.location.origin;
      console.log('🌐 Iniciando autenticación Google web:', currentOrigin);
      
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
      
      console.log('Google OAuth iniciado:', data);
      return { data, error: null };
    } catch (error: any) {
      console.error('Error en OAuth Google:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    
    try {
      let result;
      
      // Use native auth on mobile, OAuth on web
      if (isNative) {
        console.log(`🚀 Usando autenticación nativa para ${isAndroid ? 'Android' : 'iOS'}`);
        result = await signInWithNativeGoogle();
        
        // If native fails, fallback to OAuth
        if (result.error && result.error.message !== 'Autenticación cancelada') {
          console.log('⚠️ Autenticación nativa falló, intentando OAuth web...');
          result = await signInWithOAuthGoogle();
        }
      } else {
        console.log('🌐 Usando OAuth web');
        result = await signInWithOAuthGoogle();
      }
      
      return result;
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      
      let errorMessage = "Error al iniciar sesión con Google";
      
      if (error.message?.includes('requested path is invalid')) {
        errorMessage = "Error de configuración. Por favor, contacta al administrador.";
      } else if (error.message?.includes('redirect')) {
        errorMessage = "Error de redirección. Inténtalo de nuevo.";
      } else if (error.message !== 'Autenticación cancelada') {
        errorMessage = error.message || "Error desconocido";
      }
      
      if (error.message !== 'Autenticación cancelada') {
        toast({
          title: errorMessage,
          description: error.message || "Error desconocido",
          variant: "destructive"
        });
      }
      
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  return {
    signInWithGoogle,
    loading,
    isNative,
    isAndroid,
    isIOS
  };
};
