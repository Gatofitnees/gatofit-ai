
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
  const [hybridProfile, setHybridProfile] = useState<UserProfile | null>(null);
  
  // Only use the profile hook if we have a user
  const profileHook = useProfile();
  
  // Provide a safe fallback when profile hook is not available
  const profile = profileHook?.profile || null;
  const loading = profileHook?.loading || false;
  const hookUpdateProfile = profileHook?.updateProfile;
  const refetch = profileHook?.refetch;

  // Crear un perfil híbrido que combine datos personalizados con fallbacks de Google
  useEffect(() => {
    if (user && profile !== undefined) {
      const googleFallback = {
        full_name: user.user_metadata?.name || user.user_metadata?.full_name,
        avatar_url: user.user_metadata?.avatar_url,
        username: user.email?.split('@')[0]
      };

      if (profile) {
        // Si tenemos datos del perfil, usar esos como prioridad
        setHybridProfile({
          ...profile,
          // Solo usar fallbacks de Google si no hay datos personalizados
          full_name: profile.full_name || googleFallback.full_name || null,
          avatar_url: profile.avatar_url || googleFallback.avatar_url || null,
          username: profile.username || googleFallback.username || null
        });
      } else if (user) {
        // Si no hay perfil aún, crear uno temporal con datos de Google
        setHybridProfile({
          id: user.id,
          full_name: googleFallback.full_name || null,
          username: googleFallback.username || null,
          avatar_url: googleFallback.avatar_url || null,
          bio: null,
          is_profile_public: true,
          height_cm: null,
          current_weight_kg: null,
          body_fat_percentage: null
        });
      }
    } else {
      setHybridProfile(null);
    }
  }, [user, profile]);

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
      profile: hybridProfile,
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
