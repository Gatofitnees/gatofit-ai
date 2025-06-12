
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { validateStrongPassword } from '@/utils/enhancedPasswordValidation';
import { validateSecureEmail, validateSecureUsername } from '@/utils/enhancedInputValidation';
import { logAuthEvent } from '@/utils/securityLogger';
import { RateLimiter } from '@/utils/securityValidation';

// Enhanced rate limiting for auth operations
const authRateLimiter = new RateLimiter(5, 300000); // 5 attempts per 5 minutes

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
      logAuthEvent('signup_rate_limit_exceeded', undefined, 'medium');
      return { success: false };
    }

    // Enhanced email validation
    const emailValidation = validateSecureEmail(email);
    if (!emailValidation.isValid) {
      toast({
        title: "Error",
        description: emailValidation.error,
        variant: "destructive"
      });
      return { success: false };
    }

    // Enhanced password validation
    const passwordValidation = validateStrongPassword(password);
    if (!passwordValidation.isValid) {
      toast({
        title: "Error",
        description: passwordValidation.errors[0],
        variant: "destructive"
      });
      return { success: false };
    }

    // Username validation if provided
    if (username) {
      const usernameValidation = validateSecureUsername(username);
      if (!usernameValidation.isValid) {
        toast({
          title: "Error",
          description: usernameValidation.error,
          variant: "destructive"
        });
        return { success: false };
      }

      // Check username availability
      const { data: existingUsers } = await supabase
        .from('profiles')
        .select('username')
        .ilike('username', username);

      if (existingUsers && existingUsers.length > 0) {
        toast({
          title: "Error",
          description: "This username is already taken",
          variant: "destructive"
        });
        return { success: false };
      }
    }

    setLoading(true);
    try {
      logAuthEvent('signup_attempt', undefined, 'low');

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
        logAuthEvent('signup_failed', undefined, 'medium');
        throw error;
      }

      logAuthEvent('signup_success', data.user?.id, 'low');
      
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
      logAuthEvent('signin_rate_limit_exceeded', undefined, 'high');
      return { success: false };
    }

    // Basic email validation
    const emailValidation = validateSecureEmail(email);
    if (!emailValidation.isValid) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return { success: false };
    }

    setLoading(true);
    try {
      logAuthEvent('signin_attempt', undefined, 'low');

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password
      });

      if (error) {
        logAuthEvent('signin_failed', undefined, 'medium');
        
        // Don't reveal whether email exists or not
        toast({
          title: "Error",
          description: "Invalid email or password",
          variant: "destructive"
        });
        return { success: false };
      }

      logAuthEvent('signin_success', data.user?.id, 'low');
      
      toast({
        title: "Success",
        description: "Successfully signed in!",
      });

      return { success: true, data };
    } catch (error: any) {
      console.error('Signin error:', error);
      logAuthEvent('signin_error', undefined, 'medium');
      
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

      logAuthEvent('signout_success', undefined, 'low');
      
      toast({
        title: "Success",
        description: "Successfully signed out",
      });

      return { success: true };
    } catch (error: any) {
      console.error('Signout error:', error);
      logAuthEvent('signout_error', undefined, 'medium');
      
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
