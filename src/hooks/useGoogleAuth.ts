
import { useState } from 'react';
import { GoogleAuth } from '@capacitor-community/google-auth';
import { supabase } from '@/integrations/supabase/client';
import { usePlatform } from './usePlatform';
import { useToast } from '@/hooks/use-toast';

export const useGoogleAuth = () => {
  const [loading, setLoading] = useState(false);
  const { isNative, isAndroid } = usePlatform();
  const { toast } = useToast();

  const initializeGoogleAuth = async () => {
    if (isNative && isAndroid) {
      try {
        await GoogleAuth.initialize({
          clientId: '175681669860-6r9ejdog30rsm6l5auge5bmdnrak4n6e.apps.googleusercontent.com',
          scopes: ['profile', 'email'],
          grantOfflineAccess: true
        });
        console.log('Google Auth initialized successfully');
      } catch (error) {
        console.error('Error initializing Google Auth:', error);
      }
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    
    try {
      if (isNative && isAndroid) {
        // Native Android Google Sign-In
        console.log('Using native Android Google Sign-In');
        
        await initializeGoogleAuth();
        
        const result = await GoogleAuth.signIn();
        console.log('Google Auth result:', result);
        
        if (result.authentication?.idToken) {
          // Sign in to Supabase with the Google ID token
          const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: result.authentication.idToken,
          });
          
          if (error) {
            console.error('Supabase sign-in error:', error);
            throw error;
          }
          
          console.log('Successfully signed in with Google (native):', data);
          return { data, error: null };
        } else {
          throw new Error('No ID token received from Google Auth');
        }
      } else {
        // Web OAuth flow
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
      }
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
