
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface BodyMeasurement {
  id: number;
  user_id: string;
  weight_kg: number | null;
  height_cm: number | null;
  body_fat_percentage: number | null;
  arm_circumference_cm: number | null;
  abdomen_circumference_cm: number | null;
  leg_circumference_cm: number | null;
  chest_circumference_cm: number | null;
  measurement_date: string;
  notes: string | null;
  created_at: string;
}

export const useBodyMeasurements = () => {
  const { user } = useAuth();
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMeasurements = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('body_measurements')
        .select('*')
        .eq('user_id', user.id)
        .order('measurement_date', { ascending: false });

      if (error) throw error;
      setMeasurements(data || []);
    } catch (err) {
      setError('Error al cargar medidas');
      console.error('Error fetching measurements:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const addMeasurement = async (measurement: Omit<BodyMeasurement, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return false;

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('body_measurements')
        .insert({
          ...measurement,
          user_id: user.id
        });

      if (error) throw error;
      
      // Also update the profile with the latest measurements
      await supabase
        .from('profiles')
        .update({
          current_weight_kg: measurement.weight_kg,
          height_cm: measurement.height_cm,
          body_fat_percentage: measurement.body_fat_percentage,
          arm_circumference_cm: measurement.arm_circumference_cm,
          abdomen_circumference_cm: measurement.abdomen_circumference_cm,
          leg_circumference_cm: measurement.leg_circumference_cm,
          chest_circumference_cm: measurement.chest_circumference_cm
        })
        .eq('id', user.id);

      await fetchMeasurements();
      return true;
    } catch (err) {
      setError('Error al guardar medidas');
      console.error('Error adding measurement:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMeasurements();
  }, [user]);

  return {
    measurements,
    isLoading,
    error,
    addMeasurement,
    refetch: fetchMeasurements
  };
};
