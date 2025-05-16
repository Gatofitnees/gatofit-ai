
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useAuthService = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState<boolean>(false);
  
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

  return {
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    loading,
    setLoading
  };
};
