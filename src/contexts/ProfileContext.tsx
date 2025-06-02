
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { UserProfile } from '@/types/userProfile';
import { useToast } from '@/components/ui/use-toast';

interface ProfileContextType {
  profile: UserProfile | null;
  loading: boolean;
  recalculatingMacros: boolean;
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  refreshProfile: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { profile, loading, updateProfile: hookUpdateProfile, refetch } = useProfile();
  const [recalculatingMacros, setRecalculatingMacros] = useState(false);
  const { toast } = useToast();

  const updateProfile = async (updates: Partial<UserProfile>) => {
    // Check if we need to recalculate macros
    const shouldRecalculateMacros = [
      'current_weight_kg', 'height_cm', 'date_of_birth', 'gender',
      'main_goal', 'trainings_per_week', 'target_pace'
    ].some(field => field in updates);

    if (shouldRecalculateMacros) {
      setRecalculatingMacros(true);
      toast({
        title: "Actualizando perfil",
        description: "Recalculando recomendaciones nutricionales...",
      });
    }

    try {
      const success = await hookUpdateProfile(updates);
      
      if (success) {
        // Refresh the profile to get the latest data including updated macros
        await refetch();
        
        if (shouldRecalculateMacros) {
          toast({
            title: "¡Perfecto!",
            description: "Perfil y recomendaciones nutricionales actualizados correctamente"
          });
        }
      }
      
      return success;
    } finally {
      if (shouldRecalculateMacros) {
        setRecalculatingMacros(false);
      }
    }
  };

  const refreshProfile = () => {
    refetch();
  };

  return (
    <ProfileContext.Provider value={{
      profile,
      loading,
      recalculatingMacros,
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
