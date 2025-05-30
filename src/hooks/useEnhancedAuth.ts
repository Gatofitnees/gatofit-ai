
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { validateStrongPassword, authRateLimiter, logSecurityEvent } from '@/utils/enhancedSecurityValidation';
import { validateUsername } from '@/utils/securityValidation';

export const useEnhancedAuth = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const secureSignUp = async (email: string, password: string, username?: string) => {
    // Rate limiting check
    const clientId = `signup_${email}`;
    if (!authRateLimiter.isAllowed(clientId)) {
      toast({
        title: "Error",
        description: "Too many signup attempts. Please wait 5 minutes before trying again.",
        variant: "destructive"
      });
      logSecurityEvent('signup_rate_limit_exceeded', email, 'medium');
      return { success: false };
    }

    // Enhanced password validation
    const passwordValidation = validateStrongPassword(password);
    if (!passwordValidation.isValid) {
      toast({
        title: "Error",
        description: passwordValidation.error,
        variant: "destructive"
      });
      return { success: false };
    }

    // Username validation if provided
    if (username) {
      const usernameValidation = validateUsername(username);
      if (!usernameValidation.isValid) {
        toast({
          title: "Error",
          description: usernameValidation.error,
          variant: "destructive"
        });
        return { success: false };
      }
    }

    setLoading(true);
    try {
      logSecurityEvent('signup_attempt', email, 'low');

      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          data: {
            username: username?.toLowerCase().trim(),
            email_confirm: true
          }
        }
      });

      if (error) {
        logSecurityEvent('signup_failed', `${email}: ${error.message}`, 'medium');
        throw error;
      }

      logSecurityEvent('signup_success', email, 'low');
      
      toast({
        title: "Success",
        description: "Account created successfully! Please check your email to verify your account.",
      });

      return { success: true, data };
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
        variant: "destructive"
      });
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const secureSignIn = async (email: string, password: string) => {
    // Rate limiting check
    const clientId = `signin_${email}`;
    if (!authRateLimiter.isAllowed(clientId)) {
      toast({
        title: "Error",
        description: "Too many login attempts. Please wait 5 minutes before trying again.",
        variant: "destructive"
      });
      logSecurityEvent('signin_rate_limit_exceeded', email, 'high');
      return { success: false };
    }

    setLoading(true);
    try {
      logSecurityEvent('signin_attempt', email, 'low');

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password
      });

      if (error) {
        logSecurityEvent('signin_failed', `${email}: ${error.message}`, 'medium');
        
        // Don't reveal whether email exists or not
        toast({
          title: "Error",
          description: "Invalid email or password",
          variant: "destructive"
        });
        return { success: false };
      }

      logSecurityEvent('signin_success', email, 'low');
      
      toast({
        title: "Success",
        description: "Successfully signed in!",
      });

      return { success: true, data };
    } catch (error: any) {
      console.error('Signin error:', error);
      logSecurityEvent('signin_error', `${email}: ${error.message}`, 'medium');
      
      toast({
        title: "Error",
        description: "Sign in failed. Please try again.",
        variant: "destructive"
      });
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const secureSignOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;

      logSecurityEvent('signout_success', 'User signed out', 'low');
      
      toast({
        title: "Success",
        description: "Successfully signed out",
      });

      return { success: true };
    } catch (error: any) {
      console.error('Signout error:', error);
      logSecurityEvent('signout_error', error.message, 'medium');
      
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive"
      });
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return {
    secureSignUp,
    secureSignIn,
    secureSignOut,
    loading
  };
};
