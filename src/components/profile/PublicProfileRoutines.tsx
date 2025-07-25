
import React, { useState, useEffect } from 'react';
import { Card, CardBody } from '@/components/Card';
import { Button } from '@/components/ui/button';
import { Download, Clock, Dumbbell } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import RoutineLoadedDialog from '@/components/RoutineLoadedDialog';

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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loadedRoutineName, setLoadedRoutineName] = useState('');
  const { user } = useAuth();

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
    } finally {
      setLoading(false);
    }
  };

  const copyRoutine = async (routineId: number, routineName: string) => {
    if (!user) {
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
      setLoadedRoutineName(routineName);
      setDialogOpen(true);
    } catch (error: any) {
      console.error('Error in copyRoutine:', error);
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
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded-lg animate-pulse" />
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
    <>
      <Card>
        <CardBody>
          <h3 className="font-semibold mb-4 text-center">Rutinas Públicas</h3>
          <Carousel className="w-full" opts={{ loop: true }}>
            <CarouselContent>
              {routines.map((routine) => (
                <CarouselItem key={routine.routine_id} className="basis-full">
                  <Card className="h-full hover:shadow-md transition-shadow">
                    <CardBody className="p-6 flex flex-col h-full text-center">
                      <div className="flex-1">
                        <h4 className="font-medium text-lg mb-3 line-clamp-2">
                          {routine.routine_name}
                        </h4>
                        
                        {routine.routine_description && (
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                            {routine.routine_description}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-2">
                            <Dumbbell className="h-4 w-4" />
                            <span>{routine.exercise_count} ejercicios</span>
                          </div>
                          
                          {routine.estimated_duration_minutes && (
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>{routine.estimated_duration_minutes} min</span>
                            </div>
                          )}
                        </div>

                        {routine.routine_type && (
                          <div className="mb-4 flex justify-center">
                            <span className="inline-block bg-primary/10 text-primary text-sm px-3 py-1 rounded-full">
                              {routine.routine_type}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <Button
                        onClick={() => copyRoutine(routine.routine_id, routine.routine_name)}
                        disabled={copyingRoutineId === routine.routine_id || !user}
                        className="w-full mt-auto"
                      >
                        {copyingRoutineId === routine.routine_id ? (
                          <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                        ) : (
                          <Download className="h-4 w-4 mr-2" />
                        )}
                        {copyingRoutineId === routine.routine_id ? 'Cargando...' : 'Cargar rutina'}
                      </Button>
                    </CardBody>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </CardBody>
      </Card>
      
      <RoutineLoadedDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        routineName={loadedRoutineName}
      />
    </>
  );
};

export default PublicProfileRoutines;
