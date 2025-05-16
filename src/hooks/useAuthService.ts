
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { authNotifications } from "@/services/notifications/auth-notifications";

export const useAuthService = () => {
  const [loading, setLoading] = useState<boolean>(false);
  
  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        authNotifications.signUpError(error.message);
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
          authNotifications.profileCreationError(profileError.message);
          return { error: profileError, data: null };
        }
      }

      authNotifications.signUpSuccess();
      return { error: null, data };
    } catch (err: any) {
      authNotifications.genericError(err.message);
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
        authNotifications.signInError(error.message);
        return { error, data: null };
      }

      authNotifications.signInSuccess();
      return { error: null, data };
    } catch (err: any) {
      authNotifications.genericError(err.message);
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
        authNotifications.googleSignInError(error.message);
        return { error, data: null };
      }

      return { error: null, data };
    } catch (err: any) {
      authNotifications.genericError(err.message);
      return { error: err, data: null };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    authNotifications.signOutSuccess();
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
