
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTimezone } from './useTimezone';

export const useAutoUserVerification = () => {
  const { user } = useAuth();
  const { saveTimezoneToProfile } = useTimezone();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const verifyAndSetupUser = async () => {
    if (!user || isVerifying) return;

    try {
      setIsVerifying(true);
      
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
        console.log('Creating new profile for user:', user.id);
        
        // Generate unique username from email
        const emailUsername = user.email?.split('@')[0] || 'usuario';
        const randomSuffix = Math.floor(Math.random() * 1000);
        const proposedUsername = `${emailUsername}${randomSuffix}`;

        const profileData = {
          id: user.id,
          full_name: user.user_metadata?.name || user.user_metadata?.full_name || 'Usuario',
          username: proposedUsername,
          avatar_url: user.user_metadata?.avatar_url || null,
          is_profile_public: true,
          // Save timezone info during profile creation
          timezone_offset: -new Date().getTimezoneOffset(),
          timezone_name: Intl.DateTimeFormat().resolvedOptions().timeZone
        };

        const { error: insertError } = await supabase
          .from('profiles')
          .insert(profileData);

        if (insertError) {
          console.error('Error creating profile:', insertError);
          return;
        }
        
        console.log('Profile created successfully');
      } else if (!existingProfile.timezone_offset) {
        // Update timezone info for existing profiles that don't have it
        await saveTimezoneToProfile({
          timezoneOffset: -new Date().getTimezoneOffset(),
          timezoneName: Intl.DateTimeFormat().resolvedOptions().timeZone
        });
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
        console.log('Creating initial streak record for user:', user.id);
        
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
        
        console.log('Streak record created successfully');
      }

      setIsVerified(true);
      console.log('User verification completed successfully');
      
    } catch (error) {
      console.error('Error in user verification:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    if (user && !isVerified) {
      verifyAndSetupUser();
    }
  }, [user]);

  return {
    isVerifying,
    isVerified,
    verifyAndSetupUser
  };
};
