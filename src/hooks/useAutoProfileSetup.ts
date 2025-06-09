
import { useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface GoogleUserMetadata {
  avatar_url?: string;
  email?: string;
  email_verified?: boolean;
  full_name?: string;
  iss?: string;
  name?: string;
  picture?: string;
  provider_id?: string;
  sub?: string;
}

export const useAutoProfileSetup = (user: User | null) => {
  const { toast } = useToast();

  useEffect(() => {
    const setupGoogleProfile = async () => {
      if (!user) return;

      // Only process if user signed in with Google
      const metadata = user.user_metadata as GoogleUserMetadata;
      if (!metadata.provider_id?.includes('google')) return;

      try {
        // Check if profile already has data
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('full_name, avatar_url, username')
          .eq('id', user.id)
          .single();

        // If profile already has name, skip auto-setup
        if (existingProfile?.full_name) return;

        // Extract Google data
        const fullName = metadata.full_name || metadata.name || '';
        const avatarUrl = metadata.avatar_url || metadata.picture || '';
        
        if (!fullName && !avatarUrl) return;

        // Generate unique username from name or email
        let username = '';
        if (fullName) {
          username = fullName.toLowerCase()
            .replace(/\s+/g, '')
            .replace(/[^a-z0-9]/g, '')
            .substring(0, 15);
        } else if (user.email) {
          username = user.email.split('@')[0].toLowerCase();
        }

        // Ensure username is unique
        if (username) {
          const { data: existingUser } = await supabase
            .from('profiles')
            .select('username')
            .eq('username', username)
            .single();

          if (existingUser) {
            username = `${username}${Math.floor(Math.random() * 1000)}`;
          }
        }

        // Update profile with Google data
        const updates: any = {};
        if (fullName) updates.full_name = fullName;
        if (avatarUrl) updates.avatar_url = avatarUrl;
        if (username) updates.username = username;

        if (Object.keys(updates).length > 0) {
          const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id);

          if (error) {
            console.error('Error updating profile with Google data:', error);
          } else {
            console.log('Profile auto-configured with Google data:', updates);
          }
        }
      } catch (error) {
        console.error('Error in auto profile setup:', error);
      }
    };

    setupGoogleProfile();
  }, [user, toast]);
};
