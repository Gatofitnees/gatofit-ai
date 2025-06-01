
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { useProfile, UserProfile } from '@/hooks/useProfile';

interface ProfileContextType {
  profile: UserProfile | null;
  loading: boolean;
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  refreshProfile: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { profile: hookProfile, loading: hookLoading, updateProfile: hookUpdateProfile, refetch } = useProfile();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize profile with Google fallback data to prevent flash
  useEffect(() => {
    if (user && !hookLoading) {
      if (hookProfile) {
        // Use profile data if available
        setProfile(hookProfile);
      } else {
        // Create fallback profile with Google data
        const fallbackProfile: UserProfile = {
          id: user.id,
          full_name: user.user_metadata?.name || user.user_metadata?.full_name || null,
          username: user.user_metadata?.preferred_username || user.email?.split('@')[0] || null,
          avatar_url: user.user_metadata?.avatar_url || null,
          bio: null,
          is_profile_public: true,
          height_cm: null,
          current_weight_kg: null,
          body_fat_percentage: null
        };
        setProfile(fallbackProfile);
      }
      setLoading(false);
    } else if (!user) {
      setProfile(null);
      setLoading(false);
    }
  }, [user, hookProfile, hookLoading]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    const success = await hookUpdateProfile(updates);
    if (success) {
      // Update local state immediately
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      // Then refetch to ensure consistency
      refetch();
    }
    return success;
  };

  const refreshProfile = () => {
    refetch();
  };

  return (
    <ProfileContext.Provider value={{
      profile,
      loading,
      updateProfile,
      refreshProfile
    }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfileContext = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfileContext must be used within a ProfileProvider');
  }
  return context;
};
