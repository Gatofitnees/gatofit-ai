
import { useState, useEffect } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { authNotifications } from "@/services/notifications/auth-notifications";

export const useAuthSession = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
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
          
          authNotifications.signedInWelcome();
        } catch (err) {
          console.error("Error handling auth state change:", err);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return { user, session, loading };
};
