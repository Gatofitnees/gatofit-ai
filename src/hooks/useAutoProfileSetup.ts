
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

const generateUniqueUsername = async (baseUsername: string): Promise<string> => {
  let username = baseUsername;
  let counter = 1;
  
  while (true) {
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .single();

    if (!existingUser) {
      return username;
    }
    
    username = `${baseUsername}${counter}`;
    counter++;
  }
};

export const useAutoProfileSetup = (user: User | null) => {
  const { toast } = useToast();

  useEffect(() => {
    const setupUserProfile = async () => {
      if (!user) return;

      try {
        // Check if profile already has data
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('full_name, avatar_url, username')
          .eq('id', user.id)
          .single();

        // If profile already has complete data, skip auto-setup
        if (existingProfile?.full_name && existingProfile?.username) return;

        const metadata = user.user_metadata as GoogleUserMetadata;
        const isGoogleUser = metadata.provider_id?.includes('google');

        let fullName = '';
        let avatarUrl = '';
        let baseUsername = '';

        if (isGoogleUser) {
          // Extract Google data
          fullName = metadata.full_name || metadata.name || '';
          avatarUrl = metadata.avatar_url || metadata.picture || '';
          
          if (fullName) {
            baseUsername = fullName.toLowerCase()
              .replace(/\s+/g, '')
              .replace(/[^a-z0-9]/g, '')
              .substring(0, 15);
          }
        }

        // If no name from Google or not a Google user, use email
        if (!fullName && user.email) {
          const emailPart = user.email.split('@')[0];
          fullName = emailPart.charAt(0).toUpperCase() + emailPart.slice(1);
        }

        // Generate username from email if not set
        if (!baseUsername && user.email) {
          baseUsername = user.email.split('@')[0].toLowerCase()
            .replace(/[^a-z0-9]/g, '')
            .substring(0, 15);
        }

        // Ensure we have at least something
        if (!baseUsername) {
          baseUsername = `user${Math.floor(Math.random() * 10000)}`;
        }

        // Generate unique username
        const uniqueUsername = await generateUniqueUsername(baseUsername);

        // Prepare updates - always update missing fields
        const updates: any = {};
        if (!existingProfile?.full_name && fullName) {
          updates.full_name = fullName;
        }
        if (!existingProfile?.avatar_url && avatarUrl) {
          updates.avatar_url = avatarUrl;
        }
        if (!existingProfile?.username) {
          updates.username = uniqueUsername;
        }

        if (Object.keys(updates).length > 0) {
          const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id);

          if (error) {
            console.error('Error updating profile with auto data:', error);
          } else {
            console.log('Profile auto-configured:', updates);
          }
        }
      } catch (error) {
        console.error('Error in auto profile setup:', error);
      }
    };

    setupUserProfile();
  }, [user, toast]);
};
