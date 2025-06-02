
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Target, Calendar, Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProfileContext } from '@/contexts/ProfileContext';

const UserInformationPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile, updateProfile } = useProfileContext();
  
  const [formData, setFormData] = useState({
    main_goal: profile?.main_goal || '',
    trainings_per_week: profile?.trainings_per_week || '',
    target_pace: profile?.target_pace || '',
    target_kg_per_week: profile?.target_kg_per_week || '',
    previous_app_experience: profile?.previous_app_experience ?? null,
    gender: profile?.gender || '',
    date_of_birth: profile?.date_of_birth || ''
  });
  
  const [saving, setSaving] = useState(false);

  const handleInputChange = (field: string, value: string | boolean | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    
    const updates: any = {};
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== '' && value !== null) {
        if (key === 'trainings_per_week' || key === 'target_kg_per_week') {
          updates[key] = parseFloat(value as string) || null;
        } else {
          updates[key] = value;
        }
      }
    });

    const success = await updateProfile(updates);
    if (success) {
      navigate('/profile');
    }
    setSaving(false);
  };

  const mainGoalOptions = [
    { value: 'lose_weight', label: 'Perder peso' },
    { value: 'gain_weight', label: 'Ganar peso' },
    { value: 'maintain_weight', label: 'Mantener peso' },
    { value: 'build_muscle', label: 'Ganar músculo' },
    { value: 'improve_health', label: 'Mejorar salud' },
    { value: 'increase_strength', label: 'Aumentar fuerza' }
  ];

  const targetPaceOptions = [
    { value: 'slow', label: 'Lento' },
    { value: 'moderate', label: 'Moderado' },
    { value: 'fast', label: 'Rápido' }
  ];

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/profile')}
          className="p-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <h1 className="text-xl font-bold">Información del Usuario</h1>
        
        <Button
          onClick={handleSave}
          disabled={saving}
          size="sm"
          className="px-3"
        >
          <Save className="h-4 w-4 mr-1" />
          {saving ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>

      <div className="space-y-6">
        {/* Información personal */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Información Personal
          </h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="gender">Género</Label>
              <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tu género" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Masculino</SelectItem>
                  <SelectItem value="female">Femenino</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="experience">Experiencia previa con apps de fitness</Label>
              <Select 
                value={formData.previous_app_experience === null ? '' : formData.previous_app_experience.toString()} 
                onValueChange={(value) => handleInputChange('previous_app_experience', value === 'true')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="¿Has usado apps de fitness antes?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Sí</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Objetivos y entrenamiento */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Target className="h-5 w-5" />
            Objetivos y Entrenamiento
          </h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="mainGoal">Objetivo Principal</Label>
              <Select value={formData.main_goal} onValueChange={(value) => handleInputChange('main_goal', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tu objetivo principal" />
                </SelectTrigger>
                <SelectContent>
                  {mainGoalOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="trainingsPerWeek">Entrenamientos por semana</Label>
              <Input
                id="trainingsPerWeek"
                type="number"
                min="1"
                max="7"
                value={formData.trainings_per_week}
                onChange={(e) => handleInputChange('trainings_per_week', e.target.value)}
                placeholder="3"
              />
            </div>
            
            <div>
              <Label htmlFor="targetPace">Ritmo objetivo</Label>
              <Select value={formData.target_pace} onValueChange={(value) => handleInputChange('target_pace', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="¿A qué ritmo quieres lograr tu objetivo?" />
                </SelectTrigger>
                <SelectContent>
                  {targetPaceOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="targetKgPerWeek">Meta kg por semana</Label>
              <Input
                id="targetKgPerWeek"
                type="number"
                step="0.1"
                value={formData.target_kg_per_week}
                onChange={(e) => handleInputChange('target_kg_per_week', e.target.value)}
                placeholder="0.5"
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UserInformationPage;
