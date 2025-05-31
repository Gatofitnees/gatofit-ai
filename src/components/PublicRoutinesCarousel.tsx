
import React, { useState, useEffect } from 'react';
import { Card, CardBody } from '@/components/Card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PublicRoutine {
  id: number;
  name: string;
  description: string | null;
  estimated_duration_minutes: number | null;
  type: string | null;
  exercises_count: number;
}

interface PublicRoutinesCarouselProps {
  userId: string;
}

const PublicRoutinesCarousel: React.FC<PublicRoutinesCarouselProps> = ({ userId }) => {
  const [routines, setRoutines] = useState<PublicRoutine[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoutine, setSelectedRoutine] = useState<PublicRoutine | null>(null);
  const [loadingCopy, setLoadingCopy] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchPublicRoutines = async () => {
    try {
      const { data, error } = await supabase
        .from('shared_routines')
        .select(`
          routine_id,
          routines!inner (
            id,
            name,
            description,
            estimated_duration_minutes,
            type
          )
        `)
        .eq('user_id', userId)
        .eq('is_public', true);

      if (error) throw error;

      // Obtener conteo de ejercicios para cada rutina
      const routinesWithCount = await Promise.all(
        (data || []).map(async (item) => {
          const { count } = await supabase
            .from('routine_exercises')
            .select('*', { count: 'exact', head: true })
            .eq('routine_id', item.routine_id);

          return {
            id: item.routines.id,
            name: item.routines.name,
            description: item.routines.description,
            estimated_duration_minutes: item.routines.estimated_duration_minutes,
            type: item.routines.type,
            exercises_count: count || 0
          };
        })
      );

      setRoutines(routinesWithCount);
    } catch (error) {
      console.error('Error fetching public routines:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyRoutine = async (routine: PublicRoutine) => {
    if (!user) return;

    setLoadingCopy(true);
    try {
      // Obtener la rutina completa con ejercicios
      const { data: routineData, error: routineError } = await supabase
        .from('routines')
        .select('*')
        .eq('id', routine.id)
        .single();

      if (routineError) throw routineError;

      const { data: exercisesData, error: exercisesError } = await supabase
        .from('routine_exercises')
        .select('*')
        .eq('routine_id', routine.id)
        .order('exercise_order');

      if (exercisesError) throw exercisesError;

      // Crear nueva rutina en el perfil del usuario
      const { data: newRoutine, error: createError } = await supabase
        .from('routines')
        .insert({
          name: `${routine.name} (Copia)`,
          description: routine.description,
          estimated_duration_minutes: routine.estimated_duration_minutes,
          type: routine.type,
          user_id: user.id,
          is_predefined: false
        })
        .select()
        .single();

      if (createError) throw createError;

      // Copiar ejercicios
      if (exercisesData.length > 0) {
        const exercisesToInsert = exercisesData.map(exercise => ({
          routine_id: newRoutine.id,
          exercise_id: exercise.exercise_id,
          exercise_order: exercise.exercise_order,
          sets: exercise.sets,
          reps_min: exercise.reps_min,
          reps_max: exercise.reps_max,
          duration_seconds: exercise.duration_seconds,
          rest_between_sets_seconds: exercise.rest_between_sets_seconds,
          block_name: exercise.block_name,
          notes: exercise.notes
        }));

        const { error: insertError } = await supabase
          .from('routine_exercises')
          .insert(exercisesToInsert);

        if (insertError) throw insertError;
      }

      toast({
        title: "Rutina copiada",
        description: `"${routine.name}" se agregó a tus rutinas`
      });

    } catch (error: any) {
      console.error('Error copying routine:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo copiar la rutina",
        variant: "destructive"
      });
    } finally {
      setLoadingCopy(false);
    }
  };

  useEffect(() => {
    fetchPublicRoutines();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex gap-3 overflow-x-auto pb-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex-shrink-0 w-64 h-24 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (routines.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-4">
        Este usuario no ha compartido rutinas públicas
      </p>
    );
  }

  return (
    <>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {routines.map((routine) => (
          <Card 
            key={routine.id} 
            className="flex-shrink-0 w-64 cursor-pointer hover:bg-muted/30 transition-colors"
            onClick={() => setSelectedRoutine(routine)}
          >
            <CardBody className="p-3">
              <h4 className="font-medium text-sm mb-1 line-clamp-1">{routine.name}</h4>
              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                {routine.description || 'Sin descripción'}
              </p>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{routine.exercises_count} ejercicios</span>
                {routine.estimated_duration_minutes && (
                  <span>{routine.estimated_duration_minutes} min</span>
                )}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Routine Detail Modal */}
      {selectedRoutine && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md max-h-[80vh] overflow-y-auto">
            <CardBody className="p-6">
              <h3 className="text-lg font-semibold mb-2">{selectedRoutine.name}</h3>
              
              {selectedRoutine.description && (
                <p className="text-sm text-muted-foreground mb-4">
                  {selectedRoutine.description}
                </p>
              )}
              
              <div className="flex justify-between text-sm text-muted-foreground mb-6">
                <span>{selectedRoutine.exercises_count} ejercicios</span>
                {selectedRoutine.estimated_duration_minutes && (
                  <span>{selectedRoutine.estimated_duration_minutes} min</span>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedRoutine(null)}
                  className="flex-1"
                >
                  Cerrar
                </Button>
                <Button
                  onClick={() => copyRoutine(selectedRoutine)}
                  disabled={loadingCopy}
                  className="flex-1"
                >
                  {loadingCopy ? 'Copiando...' : 'Cargar Rutina'}
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </>
  );
};

export default PublicRoutinesCarousel;
