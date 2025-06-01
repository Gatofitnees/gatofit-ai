
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
  
  // Only use the profile hook if we have a user
  const profileHook = useProfile();
  
  // Provide a safe fallback when profile hook is not available
  const profile = profileHook?.profile || null;
  const loading = profileHook?.loading || false;
  const hookUpdateProfile = profileHook?.updateProfile;
  const refetch = profileHook?.refetch;

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!hookUpdateProfile) {
      console.warn('updateProfile called but hook not available');
      return false;
    }
    
    const success = await hookUpdateProfile(updates);
    if (success && refetch) {
      // Refrescar el perfil después de una actualización exitosa
      refetch();
    }
    return success;
  };

  const refreshProfile = () => {
    if (refetch) {
      refetch();
    }
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
