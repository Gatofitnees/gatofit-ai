
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useBodyMeasurements } from '@/hooks/useBodyMeasurements';
import { Card, CardBody } from '@/components/Card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const BodyMeasurementsPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { addMeasurement, isLoading } = useBodyMeasurements();
  const { toast } = useToast();

  const [measurements, setMeasurements] = useState({
    height_cm: profile?.height_cm || '',
    weight_kg: profile?.current_weight_kg || '',
    body_fat_percentage: profile?.body_fat_percentage || '',
    arm_circumference_cm: profile?.arm_circumference_cm || '',
    abdomen_circumference_cm: profile?.abdomen_circumference_cm || '',
    leg_circumference_cm: profile?.leg_circumference_cm || '',
    chest_circumference_cm: profile?.chest_circumference_cm || '',
    notes: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setMeasurements(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    const measurementData = {
      height_cm: measurements.height_cm ? Number(measurements.height_cm) : null,
      weight_kg: measurements.weight_kg ? Number(measurements.weight_kg) : null,
      body_fat_percentage: measurements.body_fat_percentage ? Number(measurements.body_fat_percentage) : null,
      arm_circumference_cm: measurements.arm_circumference_cm ? Number(measurements.arm_circumference_cm) : null,
      abdomen_circumference_cm: measurements.abdomen_circumference_cm ? Number(measurements.abdomen_circumference_cm) : null,
      leg_circumference_cm: measurements.leg_circumference_cm ? Number(measurements.leg_circumference_cm) : null,
      chest_circumference_cm: measurements.chest_circumference_cm ? Number(measurements.chest_circumference_cm) : null,
      measurement_date: new Date().toISOString().split('T')[0],
      notes: measurements.notes || null
    };

    const success = await addMeasurement(measurementData);
    
    if (success) {
      toast({
        title: "Medidas guardadas",
        description: "Tus medidas corporales han sido actualizadas exitosamente",
      });
      navigate('/profile');
    }
  };

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/profile')}
          className="mr-3 p-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold">Medidas Corporales</h1>
      </div>

      <Card>
        <CardBody>
          <div className="space-y-4">
            {/* Basic Measurements */}
            <div>
              <Label htmlFor="height">Altura (cm)</Label>
              <Input
                id="height"
                type="number"
                value={measurements.height_cm}
                onChange={(e) => handleInputChange('height_cm', e.target.value)}
                placeholder="Ej: 175"
              />
            </div>

            <div>
              <Label htmlFor="weight">Peso (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={measurements.weight_kg}
                onChange={(e) => handleInputChange('weight_kg', e.target.value)}
                placeholder="Ej: 70.5"
              />
            </div>

            <div>
              <Label htmlFor="bodyfat">Porcentaje graso (%)</Label>
              <Input
                id="bodyfat"
                type="number"
                step="0.1"
                value={measurements.body_fat_percentage}
                onChange={(e) => handleInputChange('body_fat_percentage', e.target.value)}
                placeholder="Ej: 15.2"
              />
            </div>

            {/* Circumferences */}
            <div className="pt-4 border-t border-muted/20">
              <h3 className="font-medium mb-3">Circunferencias (cm)</h3>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="arm">Brazo</Label>
                  <Input
                    id="arm"
                    type="number"
                    step="0.1"
                    value={measurements.arm_circumference_cm}
                    onChange={(e) => handleInputChange('arm_circumference_cm', e.target.value)}
                    placeholder="Ej: 32.5"
                  />
                </div>

                <div>
                  <Label htmlFor="chest">Pecho</Label>
                  <Input
                    id="chest"
                    type="number"
                    step="0.1"
                    value={measurements.chest_circumference_cm}
                    onChange={(e) => handleInputChange('chest_circumference_cm', e.target.value)}
                    placeholder="Ej: 95.0"
                  />
                </div>

                <div>
                  <Label htmlFor="abdomen">Abdomen</Label>
                  <Input
                    id="abdomen"
                    type="number"
                    step="0.1"
                    value={measurements.abdomen_circumference_cm}
                    onChange={(e) => handleInputChange('abdomen_circumference_cm', e.target.value)}
                    placeholder="Ej: 80.0"
                  />
                </div>

                <div>
                  <Label htmlFor="leg">Pierna</Label>
                  <Input
                    id="leg"
                    type="number"
                    step="0.1"
                    value={measurements.leg_circumference_cm}
                    onChange={(e) => handleInputChange('leg_circumference_cm', e.target.value)}
                    placeholder="Ej: 55.0"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Input
                id="notes"
                value={measurements.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Añade cualquier observación..."
              />
            </div>

            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="w-full mt-6"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Guardando...' : 'Guardar Medidas'}
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Info */}
      <Card className="mt-4">
        <CardBody>
          <h3 className="font-medium mb-2">💡 Información</h3>
          <p className="text-sm text-muted-foreground">
            Al guardar estas medidas, se actualizarán automáticamente tus objetivos de macros 
            diarios en la sección de nutrición basándose en tus nuevos datos corporales.
          </p>
        </CardBody>
      </Card>
    </div>
  );
};

export default BodyMeasurementsPage;
