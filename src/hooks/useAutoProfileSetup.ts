
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
        console.log('AutoProfileSetup: Starting for user:', user.id);
        console.log('User metadata:', user.user_metadata);

        // Check if profile already has data
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('full_name, avatar_url, username, height_cm, current_weight_kg')
          .eq('id', user.id)
          .single();

        console.log('Existing profile:', existingProfile);

        const metadata = user.user_metadata as GoogleUserMetadata;
        const isGoogleUser = metadata.provider_id?.includes('google') || user.app_metadata?.provider === 'google';

        console.log('Is Google user:', isGoogleUser);

        let fullName = '';
        let avatarUrl = '';
        let baseUsername = '';

        if (isGoogleUser) {
          // Extract Google data - try multiple possible fields
          fullName = metadata.full_name || metadata.name || '';
          
          // Try different avatar URL fields from Google
          avatarUrl = metadata.avatar_url || metadata.picture || '';
          
          console.log('Google data extracted:', { fullName, avatarUrl });
          
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
          console.log('Setting avatar URL:', avatarUrl);
        }
        if (!existingProfile?.username) {
          updates.username = uniqueUsername;
        }

        console.log('Updates to apply:', updates);

        if (Object.keys(updates).length > 0) {
          const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id);

          if (error) {
            console.error('Error updating profile with auto data:', error);
          } else {
            console.log('Profile auto-configured successfully:', updates);
          }
        }

        // Check if this is a Google user who might have onboarding data pending
        if (isGoogleUser && (!existingProfile?.height_cm || !existingProfile?.current_weight_kg)) {
          console.log('Google user detected, checking for pending onboarding data...');
          
          // Check localStorage for onboarding data (this might exist if the flow was interrupted)
          try {
            const pendingDataStr = localStorage.getItem('gatofit_google_auth_pending');
            const regularDataStr = localStorage.getItem('gatofit_onboarding_data');
            
            if (pendingDataStr || regularDataStr) {
              console.log('Found potential onboarding data for Google user');
              toast({
                title: "Datos de configuración detectados",
                description: "Procesando tu información del onboarding...",
              });
            }
          } catch (storageError) {
            console.log('No accessible localStorage data:', storageError);
          }
        }
        
      } catch (error) {
        console.error('Error in auto profile setup:', error);
      }
    };

    setupUserProfile();
  }, [user, toast]);
};
