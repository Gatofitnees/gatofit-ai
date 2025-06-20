
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { logAuthEvent } from '@/utils/securityLogger';
import { validateEmail, validatePassword } from '@/utils/enhancedInputValidation';

interface AuthCredentials {
  email: string;
  password: string;
  confirmPassword?: string;
}

interface AuthResult {
  success: boolean;
  error?: string;
  requiresVerification?: boolean;
}

export const useEnhancedAuth = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const checkRateLimit = async (identifier: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('check_auth_rate_limit', {
        p_identifier: identifier,
        p_max_attempts: 5,
        p_window_minutes: 15
      });

      if (error) throw error;
      return data as boolean;
    } catch (error) {
      console.error('Error checking rate limit:', error);
      return true; // Allow if check fails
    }
  };

  const signUp = async (credentials: AuthCredentials): Promise<AuthResult> => {
    const { email, password, confirmPassword } = credentials;

    // Enhanced input validation
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return { success: false, error: emailValidation.error };
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return { success: false, error: passwordValidation.error };
    }

    if (password !== confirmPassword) {
      return { success: false, error: 'Las contraseñas no coinciden' };
    }

    // Check rate limiting
    const isAllowed = await checkRateLimit(email);
    if (!isAllowed) {
      logAuthEvent('signup_rate_limited', undefined, 'high', email);
      return { 
        success: false, 
        error: 'Demasiados intentos. Espera 15 minutos antes de intentar de nuevo.' 
      };
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        logAuthEvent('signup_failed', undefined, 'medium', error.message);
        return { success: false, error: error.message };
      }

      logAuthEvent('signup_success', undefined, 'low', email);
      return { 
        success: true, 
        requiresVerification: true 
      };
    } catch (error: any) {
      logAuthEvent('signup_error', undefined, 'high', error.message);
      return { success: false, error: 'Error interno del servidor' };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (credentials: AuthCredentials): Promise<AuthResult> => {
    const { email, password } = credentials;

    // Basic validation
    if (!email || !password) {
      return { success: false, error: 'Email y contraseña son requeridos' };
    }

    // Check rate limiting
    const isAllowed = await checkRateLimit(email);
    if (!isAllowed) {
      logAuthEvent('signin_rate_limited', undefined, 'high', email);
      return { 
        success: false, 
        error: 'Demasiados intentos fallidos. Espera 15 minutos antes de intentar de nuevo.' 
      };
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        logAuthEvent('signin_failed', undefined, 'medium', `${email}: ${error.message}`);
        return { success: false, error: 'Email o contraseña incorrectos' };
      }

      if (data.user) {
        logAuthEvent('signin_success', data.user.id, 'low', email);
        
        // Ensure user has profile and subscription
        await supabase.rpc('ensure_user_subscription', { p_user_id: data.user.id });
      }

      return { success: true };
    } catch (error: any) {
      logAuthEvent('signin_error', undefined, 'high', error.message);
      return { success: false, error: 'Error interno del servidor' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<AuthResult> => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        logAuthEvent('signout_failed', undefined, 'medium', error.message);
        return { success: false, error: error.message };
      }

      logAuthEvent('signout_success', undefined, 'low');
      return { success: true };
    } catch (error: any) {
      logAuthEvent('signout_error', undefined, 'high', error.message);
      return { success: false, error: 'Error al cerrar sesión' };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<AuthResult> => {
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return { success: false, error: emailValidation.error };
    }

    // Check rate limiting
    const isAllowed = await checkRateLimit(email);
    if (!isAllowed) {
      logAuthEvent('reset_password_rate_limited', undefined, 'medium', email);
      return { 
        success: false, 
        error: 'Demasiados intentos. Espera antes de solicitar otro enlace.' 
      };
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) {
        logAuthEvent('reset_password_failed', undefined, 'medium', error.message);
        return { success: false, error: error.message };
      }

      logAuthEvent('reset_password_requested', undefined, 'low', email);
      return { success: true };
    } catch (error: any) {
      logAuthEvent('reset_password_error', undefined, 'high', error.message);
      return { success: false, error: 'Error al enviar el enlace de recuperación' };
    } finally {
      setLoading(false);
    }
  };

  return {
    signUp,
    signIn,
    signOut,
    resetPassword,
    loading
  };
};
