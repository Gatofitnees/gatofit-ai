import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { useToast } from "@/components/ui/use-toast";
import { createSecureErrorMessage, logSecurityEvent } from "@/utils/errorHandling";

interface AuthContextProps {
  session: Session | null;
  user: User | null;
  signUp: (email: string, password: string) => Promise<{
    error: any | null;
    data: any | null;
  }>;
  signIn: (email: string, password: string) => Promise<{
    error: any | null;
    data: any | null;
  }>;
  signInWithGoogle: () => Promise<{
    error: any | null;
    data: any | null;
  }>;
  signOut: () => Promise<void>;
  switchAccount: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  // Function to create/update user profile automatically
  const ensureUserProfile = async (userData: User) => {
    try {
      // Check if profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userData.id)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking profile:', checkError);
        return;
      }

      // If profile doesn't exist, create it
      if (!existingProfile) {
        const emailUsername = userData.email?.split('@')[0] || 'usuario';
        const randomSuffix = Math.floor(Math.random() * 1000);
        const proposedUsername = `${emailUsername}${randomSuffix}`;

        const profileData = {
          id: userData.id,
          full_name: userData.user_metadata?.name || userData.user_metadata?.full_name || 'Usuario',
          username: proposedUsername,
          avatar_url: userData.user_metadata?.avatar_url || null,
          is_profile_public: true,
          timezone_offset: -new Date().getTimezoneOffset(),
          timezone_name: Intl.DateTimeFormat().resolvedOptions().timeZone
        };

        const { error: insertError } = await supabase
          .from('profiles')
          .insert(profileData);

        if (insertError) {
          console.error('Error creating profile:', insertError);
        } else {
          console.log('Profile created successfully for user:', userData.id);
        }
      }

      // Ensure user_streaks record exists
      const { data: existingStreak, error: streakCheckError } = await supabase
        .from('user_streaks')
        .select('id')
        .eq('user_id', userData.id)
        .maybeSingle();

      if (streakCheckError) {
        console.error('Error checking streak:', streakCheckError);
        return;
      }

      if (!existingStreak) {
        const { error: streakInsertError } = await supabase
          .from('user_streaks')
          .insert({
            user_id: userData.id,
            current_streak: 0,
            total_points: 0,
            total_experience: 0,
            current_level: 1,
            experience_today: 0,
            workouts_today: 0,
            foods_today: 0,
            last_xp_date: new Date().toISOString().split('T')[0]
          });

        if (streakInsertError) {
          console.error('Error creating streak record:', streakInsertError);
        } else {
          console.log('Streak record created successfully for user:', userData.id);
        }
      }
    } catch (error) {
      console.error('Error in ensureUserProfile:', error);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        logSecurityEvent('session_load_error', error.message);
      }
      setSession(session);
      setUser(session?.user ?? null);
      
      // Auto-create profile if user exists
      if (session?.user) {
        ensureUserProfile(session.user);
      }
      
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Auto-create profile for new sessions
      if (session?.user && _event === 'SIGNED_IN') {
        ensureUserProfile(session.user);
      }
      
      // Log authentication events for security monitoring
      if (_event === 'SIGNED_IN') {
        logSecurityEvent('user_signed_in', 'User authentication successful', session?.user?.id);
      } else if (_event === 'SIGNED_OUT') {
        logSecurityEvent('user_signed_out', 'User signed out', session?.user?.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      // Basic input validation
      if (!email || !password) {
        const error = { message: 'Email y contraseña son requeridos' };
        toast({
          title: "Error de registro",
          description: error.message,
          variant: "destructive",
        });
        return { error, data: null };
      }

      if (password.length < 6) {
        const error = { message: 'La contraseña debe tener al menos 6 caracteres' };
        toast({
          title: "Error de registro",
          description: error.message,
          variant: "destructive",
        });
        return { error, data: null };
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
      });

      if (error) {
        const secureError = createSecureErrorMessage(error, 'auth');
        logSecurityEvent('signup_failed', error.message);
        toast({
          title: "Error de registro",
          description: secureError,
          variant: "destructive",
        });
        return { error, data: null };
      }

      // Auto-create profile for new user
      if (data.user) {
        await ensureUserProfile(data.user);
      }

      toast({
        title: "Cuenta creada",
        description: "Por favor, verifica tu email",
      });
      
      logSecurityEvent('user_registered', 'New user registration', data.user?.id);
      return { error: null, data };
    } catch (err: any) {
      const secureError = createSecureErrorMessage(err, 'auth');
      logSecurityEvent('signup_error', err.message);
      toast({
        title: "Error",
        description: secureError,
        variant: "destructive",
      });
      return { error: err, data: null };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Basic input validation
      if (!email || !password) {
        const error = { message: 'Email y contraseña son requeridos' };
        toast({
          title: "Error de inicio de sesión",
          description: error.message,
          variant: "destructive",
        });
        return { error, data: null };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (error) {
        const secureError = createSecureErrorMessage(error, 'auth');
        logSecurityEvent('signin_failed', error.message);
        toast({
          title: "Error de inicio de sesión",
          description: secureError,
          variant: "destructive",
        });
        return { error, data: null };
      }

      toast({
        title: "¡Bienvenido de nuevo!",
        description: "Sesión iniciada exitosamente",
      });
      
      logSecurityEvent('user_login', 'User login successful', data.user?.id);
      return { error: null, data };
    } catch (err: any) {
      const secureError = createSecureErrorMessage(err, 'auth');
      logSecurityEvent('signin_error', err.message);
      toast({
        title: "Error",
        description: secureError,
        variant: "destructive",
      });
      return { error: err, data: null };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `https://appsecret.gatofit.com/onboarding/app-transition`,
        },
      });

      if (error) {
        const secureError = createSecureErrorMessage(error, 'auth');
        logSecurityEvent('google_signin_failed', error.message);
        toast({
          title: "Error al iniciar sesión con Google",
          description: secureError,
          variant: "destructive",
        });
        return { error, data: null };
      }

      logSecurityEvent('google_signin_initiated', 'Google OAuth initiated');
      return { error: null, data };
    } catch (err: any) {
      const secureError = createSecureErrorMessage(err, 'auth');
      logSecurityEvent('google_signin_error', err.message);
      toast({
        title: "Error",
        description: secureError,
        variant: "destructive",
      });
      return { error: err, data: null };
    }
  };

  const switchAccount = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `https://appsecret.gatofit.com/onboarding/app-transition`,
          queryParams: {
            prompt: 'select_account'
          }
        },
      });

      if (error) {
        const secureError = createSecureErrorMessage(error, 'auth');
        logSecurityEvent('account_switch_failed', error.message);
        toast({
          title: "Error al cambiar cuenta",
          description: secureError,
          variant: "destructive",
        });
      } else {
        logSecurityEvent('account_switch_initiated', 'Account switch initiated');
      }
    } catch (err: any) {
      const secureError = createSecureErrorMessage(err, 'auth');
      logSecurityEvent('account_switch_error', err.message);
      toast({
        title: "Error",
        description: secureError,
        variant: "destructive",
      });
    }
  };

  const signOut = async () => {
    try {
      const userId = user?.id;
      await supabase.auth.signOut();
      logSecurityEvent('user_signout', 'User initiated signout', userId);
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión exitosamente",
      });
    } catch (err) {
      logSecurityEvent('signout_error', 'Error during signout');
      console.error('Error signing out:', err);
    }
  };

  const value = {
    session,
    user,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    switchAccount,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
