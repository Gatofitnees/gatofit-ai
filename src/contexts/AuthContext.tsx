import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  useEffect(() => {
    // Initial session check
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      } catch (error) {
        console.error("Error checking session:", error);
        setLoading(false);
      }
    };
    
    checkSession();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      
      setSession(session);
      setUser(session?.user ?? null);
      
      // Handle successful sign-in events
      if (event === 'SIGNED_IN' && session) {
        // Check if user profile exists, if not create it
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (profileError || !profileData) {
            // Create a new profile if one doesn't exist
            await supabase.from('profiles').insert([
              { id: session.user.id }
            ]);
            
            console.log("Created new profile for user:", session.user.id);
          }
          
          // Navigate to app transition page on successful login
          navigate('/onboarding/app-transition');
          
          toast({
            title: "¡Bienvenido!",
            description: "Has iniciado sesión exitosamente",
          });
        } catch (err) {
          console.error("Error handling auth state change:", err);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [toast, navigate]);

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Error de registro",
          description: error.message,
          variant: "destructive",
        });
        return { error, data: null };
      }

      // Create profile record
      if (data.user) {
        const { error: profileError } = await supabase.from("profiles").insert([
          {
            id: data.user.id,
          },
        ]);

        if (profileError) {
          toast({
            title: "Error al crear perfil",
            description: profileError.message,
            variant: "destructive",
          });
          return { error: profileError, data: null };
        }
      }

      toast({
        title: "Cuenta creada",
        description: "Por favor, verifica tu email",
      });
      return { error: null, data };
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
      return { error: err, data: null };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Error de inicio de sesión",
          description: error.message,
          variant: "destructive",
        });
        return { error, data: null };
      }

      toast({
        title: "¡Bienvenido de nuevo!",
        description: "Sesión iniciada exitosamente",
      });
      return { error: null, data };
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
      return { error: err, data: null };
    }
  };

  const signInWithGoogle = async () => {
    try {
      // Use the site's domain for redirection
      const redirectTo = window.location.origin + '/onboarding/app-transition';
      console.log("Redirect URL:", redirectTo);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo,
          queryParams: {
            // We can add additional parameters to customize the OAuth flow
            prompt: 'select_account', // Always show account selection
          }
        },
      });

      if (error) {
        toast({
          title: "Error al iniciar sesión con Google",
          description: error.message,
          variant: "destructive",
        });
        return { error, data: null };
      }

      return { error: null, data };
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
      return { error: err, data: null };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión exitosamente",
    });
  };

  const value = {
    session,
    user,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
