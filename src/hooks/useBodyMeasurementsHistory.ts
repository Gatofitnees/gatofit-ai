
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface BodyMeasurement {
  id: string;
  weight_kg: number | null;
  body_fat_percentage: number | null;
  chest_circumference_cm: number | null;
  leg_circumference_cm: number | null;
  abdomen_circumference_cm: number | null;
  arm_circumference_cm: number | null;
  height_cm: number | null;
  notes: string | null;
  measured_at: string;
}

interface ProgressStats {
  current: number | null;
  initial: number | null;
  change: number | null;
  changePercentage: number | null;
  trend: 'up' | 'down' | 'stable';
}

export const useBodyMeasurementsHistory = () => {
  const { user } = useAuth();
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    weight: ProgressStats;
    bodyFat: ProgressStats;
    bmi: ProgressStats;
  }>({
    weight: { current: null, initial: null, change: null, changePercentage: null, trend: 'stable' },
    bodyFat: { current: null, initial: null, change: null, changePercentage: null, trend: 'stable' },
    bmi: { current: null, initial: null, change: null, changePercentage: null, trend: 'stable' }
  });

  const fetchMeasurements = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('body_measurements_history')
        .select('*')
        .eq('user_id', user.id)
        .order('measured_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setMeasurements(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error('Error fetching body measurements history:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: BodyMeasurement[]) => {
    if (data.length === 0) return;

    const latest = data[0];
    const oldest = data[data.length - 1];

    // Weight stats
    const weightStats: ProgressStats = {
      current: latest.weight_kg,
      initial: oldest.weight_kg,
      change: null,
      changePercentage: null,
      trend: 'stable'
    };

    if (latest.weight_kg && oldest.weight_kg) {
      weightStats.change = latest.weight_kg - oldest.weight_kg;
      weightStats.changePercentage = ((latest.weight_kg - oldest.weight_kg) / oldest.weight_kg) * 100;
      weightStats.trend = weightStats.change > 0.5 ? 'up' : weightStats.change < -0.5 ? 'down' : 'stable';
    }

    // Body fat stats
    const bodyFatStats: ProgressStats = {
      current: latest.body_fat_percentage,
      initial: oldest.body_fat_percentage,
      change: null,
      changePercentage: null,
      trend: 'stable'
    };

    if (latest.body_fat_percentage && oldest.body_fat_percentage) {
      bodyFatStats.change = latest.body_fat_percentage - oldest.body_fat_percentage;
      bodyFatStats.changePercentage = ((latest.body_fat_percentage - oldest.body_fat_percentage) / oldest.body_fat_percentage) * 100;
      bodyFatStats.trend = bodyFatStats.change > 0.5 ? 'up' : bodyFatStats.change < -0.5 ? 'down' : 'stable';
    }

    // BMI stats
    const bmiStats: ProgressStats = {
      current: null,
      initial: null,
      change: null,
      changePercentage: null,
      trend: 'stable'
    };

    if (latest.weight_kg && latest.height_cm) {
      const heightInMeters = latest.height_cm / 100;
      bmiStats.current = latest.weight_kg / (heightInMeters * heightInMeters);
    }

    if (oldest.weight_kg && oldest.height_cm) {
      const heightInMeters = oldest.height_cm / 100;
      bmiStats.initial = oldest.weight_kg / (heightInMeters * heightInMeters);
    }

    if (bmiStats.current && bmiStats.initial) {
      bmiStats.change = bmiStats.current - bmiStats.initial;
      bmiStats.changePercentage = ((bmiStats.current - bmiStats.initial) / bmiStats.initial) * 100;
      bmiStats.trend = bmiStats.change > 0.5 ? 'up' : bmiStats.change < -0.5 ? 'down' : 'stable';
    }

    setStats({
      weight: weightStats,
      bodyFat: bodyFatStats,
      bmi: bmiStats
    });
  };

  const addMeasurement = async (measurement: Omit<BodyMeasurement, 'id' | 'measured_at'>) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('body_measurements_history')
        .insert([{
          ...measurement,
          user_id: user.id
        }]);

      if (error) throw error;

      await fetchMeasurements();
      return true;
    } catch (error) {
      console.error('Error adding measurement:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchMeasurements();
  }, [user]);

  return {
    measurements,
    stats,
    loading,
    addMeasurement,
    refetch: fetchMeasurements
  };
};
