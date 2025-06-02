import React from 'react';
import { Target, Calendar, Dumbbell, Apple, TrendingUp, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { UserProfile } from '@/types/userProfile';
import { useProfileContext } from '@/contexts/ProfileContext';

interface UserInformationProps {
  profile: UserProfile | null;
}

const UserInformation: React.FC<UserInformationProps> = ({ profile }) => {
  const { recalculatingMacros } = useProfileContext();

  const getAge = () => {
    if (!profile?.date_of_birth) return null;
    const today = new Date();
    const birthDate = new Date(profile.date_of_birth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getMainGoalText = (goal: string | null) => {
    if (!goal) return '--';
    const goalMap: { [key: string]: string } = {
      'lose_weight': 'Perder peso',
      'gain_weight': 'Ganar peso',
      'maintain_weight': 'Mantener peso',
      'build_muscle': 'Ganar músculo',
      'improve_health': 'Mejorar salud',
      'increase_strength': 'Aumentar fuerza'
    };
    return goalMap[goal] || goal;
  };

  const getGenderText = (gender: string | null) => {
    if (!gender) return '--';
    const genderMap: { [key: string]: string } = {
      'male': 'Masculino',
      'female': 'Femenino',
      'other': 'Otro',
      'prefer_not_to_say': 'Prefiero no decir'
    };
    return genderMap[gender] || gender;
  };

  const getTargetPaceText = (pace: string | null) => {
    if (!pace) return '--';
    const paceMap: { [key: string]: string } = {
      'slow': 'Lento',
      'moderate': 'Moderado',
      'fast': 'Rápido'
    };
    return paceMap[pace] || pace;
  };

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Target className="h-5 w-5" />
        Información del Usuario
      </h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Edad</p>
              <p className="font-medium">{getAge() || '--'} años</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Género</p>
              <p className="font-medium">{getGenderText(profile?.gender)}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">Objetivo Principal</p>
            <p className="font-medium">{getMainGoalText(profile?.main_goal)}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Entrenamientos/semana</p>
              <p className="font-medium">{profile?.trainings_per_week || '--'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Ritmo objetivo</p>
              <p className="font-medium">{getTargetPaceText(profile?.target_pace)}</p>
            </div>
          </div>
        </div>
        
        {profile?.target_kg_per_week && (
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Meta kg/semana</p>
              <p className="font-medium">{profile.target_kg_per_week} kg</p>
            </div>
          </div>
        )}
        
        <div className="pt-3 border-t border-muted">
          <div className="flex items-center gap-2">
            <Apple className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Experiencia previa</p>
              <p className="font-medium">
                {profile?.previous_app_experience ? 'Sí' : 'No'}
              </p>
            </div>
          </div>
        </div>
        
        {profile?.initial_recommended_calories && (
          <div className="pt-3 border-t border-muted">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-medium">Recomendaciones Iniciales</h4>
              {recalculatingMacros && (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground">Calorías</p>
                <p className="font-medium">{profile.initial_recommended_calories}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Proteína</p>
                <p className="font-medium">{profile.initial_recommended_protein_g}g</p>
              </div>
              <div>
                <p className="text-muted-foreground">Carbohidratos</p>
                <p className="font-medium">{profile.initial_recommended_carbs_g}g</p>
              </div>
              <div>
                <p className="text-muted-foreground">Grasas</p>
                <p className="font-medium">{profile.initial_recommended_fats_g}g</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default UserInformation;
