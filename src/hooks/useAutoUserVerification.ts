
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useOptimizedTimezone } from './useOptimizedTimezone';

export const useAutoUserVerification = () => {
  const { user } = useAuth();
  const { getCurrentTimezone } = useOptimizedTimezone();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const verificationRef = useRef(false);

  const verifyAndSetupUser = async () => {
    if (!user || isVerifying || verificationRef.current) return;

    try {
      setIsVerifying(true);
      verificationRef.current = true;
      
      // Check if profile already exists
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error checking profile:', profileError);
        return;
      }

      // If profile doesn't exist, create it with Google data
      if (!existingProfile) {
        // Generate unique username from email
        const emailUsername = user.email?.split('@')[0] || 'usuario';
        const randomSuffix = Math.floor(Math.random() * 1000);
        const proposedUsername = `${emailUsername}${randomSuffix}`;

        const currentTimezone = getCurrentTimezone();
        const profileData = {
          id: user.id,
          full_name: user.user_metadata?.name || user.user_metadata?.full_name || 'Usuario',
          username: proposedUsername,
          avatar_url: user.user_metadata?.avatar_url || null,
          is_profile_public: true,
          // Save timezone info during profile creation
          timezone_offset: currentTimezone.timezoneOffset,
          timezone_name: currentTimezone.timezoneName
        };

        const { error: insertError } = await supabase
          .from('profiles')
          .insert(profileData);

        if (insertError) {
          console.error('Error creating profile:', insertError);
          return;
        }
      } else if (!existingProfile.timezone_offset) {
        // Update timezone info for existing profiles that don't have it
        const currentTimezone = getCurrentTimezone();
        await supabase
          .from('profiles')
          .update({
            timezone_offset: currentTimezone.timezoneOffset,
            timezone_name: currentTimezone.timezoneName
          })
          .eq('id', user.id);
      }

      // Ensure user_streaks record exists
      const { data: existingStreak, error: streakError } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (streakError) {
        console.error('Error checking streak:', streakError);
        return;
      }

      if (!existingStreak) {
        const { error: streakInsertError } = await supabase
          .from('user_streaks')
          .insert({
            user_id: user.id,
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
          return;
        }
      }

      setIsVerified(true);
      
    } catch (error) {
      console.error('Error in user verification:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    if (user && !isVerified && !verificationRef.current) {
      verifyAndSetupUser();
    }
  }, [user]);

  return {
    isVerifying,
    isVerified,
    verifyAndSetupUser
  };
};
