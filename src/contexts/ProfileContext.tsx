import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { UserProfile } from '@/types/userProfile';

interface ProfileContextType {
  profile: UserProfile | null;
  loading: boolean;
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  refreshProfile: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { profile, loading, updateProfile: hookUpdateProfile, refetch } = useProfile();

  const updateProfile = async (updates: Partial<UserProfile>) => {
    const success = await hookUpdateProfile(updates);
    if (success) {
      // Refrescar el perfil después de una actualización exitosa
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
