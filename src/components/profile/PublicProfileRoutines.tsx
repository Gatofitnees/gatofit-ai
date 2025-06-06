
import React, { useState, useEffect } from 'react';
import { Card, CardBody } from '@/components/Card';
import { Button } from '@/components/ui/button';
import { Download, Clock, Dumbbell } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { translateRoutineType } from '@/utils/routineTypeTranslations';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

interface PublicRoutine {
  routine_id: number;
  routine_name: string;
  routine_type: string | null;
  routine_description: string | null;
  estimated_duration_minutes: number | null;
  exercise_count: number;
  created_at: string;
}

interface PublicProfileRoutinesProps {
  userId: string;
}

const PublicProfileRoutines: React.FC<PublicProfileRoutinesProps> = ({ userId }) => {
  const [routines, setRoutines] = useState<PublicRoutine[]>([]);
  const [loading, setLoading] = useState(true);
  const [copyingRoutineId, setCopyingRoutineId] = useState<number | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchPublicRoutines = async () => {
    try {
      setLoading(true);
      console.log('Fetching public routines for user:', userId);
      
      const { data, error } = await supabase.rpc('get_public_routines', {
        target_user_id: userId
      });

      if (error) {
        console.error('Error fetching public routines:', error);
        throw error;
      }

      console.log('Public routines data:', data);
      setRoutines(data || []);
    } catch (error: any) {
      console.error('Error in fetchPublicRoutines:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las rutinas públicas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyRoutine = async (routineId: number, routineName: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para cargar rutinas",
        variant: "destructive"
      });
      return;
    }

    setCopyingRoutineId(routineId);
    try {
      console.log('Copying routine:', routineId, 'for user:', user.id);
      
      const { data, error } = await supabase.rpc('copy_routine', {
        source_routine_id: routineId,
        target_user_id: user.id
      });

      if (error) {
        console.error('Error copying routine:', error);
        throw error;
      }

      console.log('Routine copied successfully:', data);
      toast({
        title: "¡Rutina cargada!",
        description: `"${routineName}" se ha agregado a tus rutinas`,
        variant: "default"
      });
    } catch (error: any) {
      console.error('Error in copyRoutine:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo cargar la rutina",
        variant: "destructive"
      });
    } finally {
      setCopyingRoutineId(null);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchPublicRoutines();
    }
  }, [userId]);

  if (loading) {
    return (
      <Card>
        <CardBody>
          <h3 className="font-semibold mb-4">Rutinas Públicas</h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-80 h-40 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </CardBody>
      </Card>
    );
  }

  if (routines.length === 0) {
    return (
      <Card>
        <CardBody>
          <h3 className="font-semibold mb-4">Rutinas Públicas</h3>
          <div className="text-center py-8 text-muted-foreground">
            <p>Este usuario no ha compartido rutinas públicas</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody>
        <h3 className="font-semibold mb-4">Rutinas Públicas</h3>
        
        <Carousel className="w-full">
          <CarouselContent className="-ml-2">
            {routines.map((routine) => (
              <CarouselItem key={routine.routine_id} className="pl-2 basis-[85%]">
                <Card className="h-full hover:shadow-md transition-shadow">
                  <CardBody className="p-4 flex flex-col h-full min-h-[160px]">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm mb-2 line-clamp-2">
                        {routine.routine_name}
                      </h4>
                      
                      {routine.routine_description && (
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                          {routine.routine_description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <Dumbbell className="h-3 w-3" />
                          <span>{routine.exercise_count} ejercicios</span>
                        </div>
                        
                        {routine.estimated_duration_minutes && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{routine.estimated_duration_minutes} min</span>
                          </div>
                        )}
                      </div>

                      {routine.routine_type && (
                        <div className="mb-3">
                          <span className="inline-block bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                            {translateRoutineType(routine.routine_type)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <Button
                      onClick={() => copyRoutine(routine.routine_id, routine.routine_name)}
                      disabled={copyingRoutineId === routine.routine_id || !user}
                      size="sm"
                      className="w-full mt-auto"
                    >
                      {copyingRoutineId === routine.routine_id ? (
                        <div className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full mr-2" />
                      ) : (
                        <Download className="h-3 w-3 mr-2" />
                      )}
                      {copyingRoutineId === routine.routine_id ? 'Cargando...' : 'Cargar rutina'}
                    </Button>
                  </CardBody>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          
          {routines.length > 1 && (
            <>
              <CarouselPrevious className="left-2" />
              <CarouselNext className="right-2" />
            </>
          )}
        </Carousel>
      </CardBody>
    </Card>
  );
};

export default PublicProfileRoutines;
