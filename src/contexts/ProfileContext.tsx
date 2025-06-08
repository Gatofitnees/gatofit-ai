
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useAutoUserVerification } from '@/hooks/useAutoUserVerification';
import { UserProfile } from '@/types/userProfile';
import { useToast } from '@/components/ui/use-toast';

interface ProfileContextType {
  profile: UserProfile | null;
  loading: boolean;
  updating: boolean;
  recalculatingMacros: boolean;
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  refreshProfile: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { profile, loading, updating, updateProfile: hookUpdateProfile, refetch } = useProfile();
  const { isVerifying, isVerified } = useAutoUserVerification();
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
      
      if (success && shouldRecalculateMacros) {
        // Wait a moment for the macro calculation to complete
        console.log('Waiting for macro recalculation to complete...');
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Refresh the profile to ensure we get the updated data
        console.log('Refreshing profile data...');
        await refetch();
        
        toast({
          title: "¡Perfecto!",
          description: "Perfil y recomendaciones nutricionales actualizados correctamente"
        });
      } else if (success) {
        toast({
          title: "¡Perfecto!",
          description: "Perfil actualizado correctamente"
        });
      }
      
      return success;
    } catch (error) {
      console.error('Error in profile update:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil. Por favor, inténtalo de nuevo.",
        variant: "destructive"
      });
      return false;
    } finally {
      if (shouldRecalculateMacros) {
        setRecalculatingMacros(false);
      }
    }
  };

  const refreshProfile = () => {
    console.log('ProfileContext: Refreshing profile...');
    refetch();
  };

  // Auto-refresh when user verification completes
  useEffect(() => {
    if (isVerified && user && !loading) {
      console.log('User verification completed, refreshing profile...');
      setTimeout(() => {
        refreshProfile();
      }, 500);
    }
  }, [isVerified, user]);

  return (
    <ProfileContext.Provider value={{
      profile,
      loading: loading || isVerifying,
      updating,
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
