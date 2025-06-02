
import React from 'react';
import { Weight, Ruler, Target } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { UserProfile } from '@/hooks/useProfile';

interface BodyMeasurementsProps {
  profile: UserProfile | null;
}

const BodyMeasurements: React.FC<BodyMeasurementsProps> = ({ profile }) => {
  const calculateBMI = () => {
    if (!profile?.height_cm || !profile?.current_weight_kg) return null;
    const heightInMeters = profile.height_cm / 100;
    return (profile.current_weight_kg / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { text: 'Bajo peso', color: 'text-blue-600' };
    if (bmi < 25) return { text: 'Normal', color: 'text-green-600' };
    if (bmi < 30) return { text: 'Sobrepeso', color: 'text-yellow-600' };
    return { text: 'Obesidad', color: 'text-red-600' };
  };

  const bmi = calculateBMI();
  const bmiCategory = bmi ? getBMICategory(parseFloat(bmi)) : null;

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Ruler className="h-5 w-5" />
        Medidas Corporales
      </h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Weight className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">Peso</p>
            <p className="font-medium">{profile?.current_weight_kg || '--'} kg</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Ruler className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">Altura</p>
            <p className="font-medium">{profile?.height_cm || '--'} cm</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">% Graso</p>
            <p className="font-medium">{profile?.body_fat_percentage || '--'}%</p>
          </div>
        </div>
        
        {bmi && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-primary" />
            <div>
              <p className="text-sm text-muted-foreground">IMC</p>
              <p className="font-medium">{bmi}</p>
              {bmiCategory && (
                <p className={`text-xs ${bmiCategory.color}`}>{bmiCategory.text}</p>
              )}
            </div>
          </div>
        )}
      </div>
      
      {profile?.target_weight_kg && (
        <div className="pt-3 border-t border-muted">
          <p className="text-sm text-muted-foreground">Peso objetivo</p>
          <p className="font-medium text-primary">{profile.target_weight_kg} kg</p>
        </div>
      )}
    </Card>
  );
};

export default BodyMeasurements;
