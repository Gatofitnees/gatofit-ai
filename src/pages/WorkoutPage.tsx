
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Filter, Plus, Search, Dumbbell, Clock } from "lucide-react";
import { Card, CardBody } from "../components/Card";
import Button from "../components/Button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface WorkoutRoutine {
  id: string;
  name: string;
  type?: string;
  description?: string;
  estimated_duration_minutes?: number;
  exercise_count?: number;
  created_at: string;
}

const WorkoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [routines, setRoutines] = useState<WorkoutRoutine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  useEffect(() => {
    const fetchRoutines = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          // User not logged in, show demo routines
          setRoutines([
            {
              id: "1",
              name: "Full Body Force",
              type: "Fuerza",
              estimated_duration_minutes: 45,
              exercise_count: 8,
              created_at: new Date().toISOString()
            },
            {
              id: "2",
              name: "HIIT Quemagrasa",
              type: "Cardio",
              estimated_duration_minutes: 30,
              exercise_count: 12,
              created_at: new Date().toISOString()
            },
            {
              id: "3",
              name: "Día de Pierna",
              type: "Fuerza",
              estimated_duration_minutes: 50,
              exercise_count: 7,
              created_at: new Date().toISOString()
            }
          ]);
          setLoading(false);
          return;
        }

        // Get user's routines with exercise count
        const { data, error } = await supabase
          .from('routines')
          .select(`
            *,
            routine_exercises:routine_exercises(count)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) {
          throw error;
        }

        if (data) {
          // Transform data to include exercise count
          const formattedData = data.map(routine => ({
            ...routine,
            exercise_count: routine.routine_exercises?.[0]?.count || 0
          }));
          setRoutines(formattedData);
        }
      } catch (error) {
        console.error("Error fetching routines:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar las rutinas",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRoutines();
  }, [toast]);

  const filteredRoutines = routines.filter(routine => 
    routine.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateRoutine = () => {
    navigate("/workout/create");
  };

  const handleStartWorkout = (routineId: string) => {
    // In a future implementation, this would navigate to a workout session page
    toast({
      title: "¡Rutina iniciada!",
      description: "Funcionalidad en desarrollo"
    });
  };

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-6">Mis Rutinas</h1>
      
      {/* Search and Filter */}
      <div className="flex items-center gap-2 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Buscar rutinas..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 rounded-xl pl-10 pr-4 bg-secondary border-none focus:ring-1 focus:ring-primary outline-none shadow-neu-button"
          />
        </div>
        <Button 
          variant="secondary"
          size="sm"
          leftIcon={<Filter className="h-4 w-4" />}
        >
          Filtrar
        </Button>
      </div>

      {/* Routines List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRoutines.length > 0 ? (
            filteredRoutines.map((routine) => (
              <Card key={routine.id} className="hover:scale-[1.01] transition-transform duration-300">
                <CardBody>
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                      <Dumbbell className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{routine.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {routine.type && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                            {routine.type}
                          </span>
                        )}
                        {routine.estimated_duration_minutes && (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            {routine.estimated_duration_minutes} min
                          </div>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {routine.exercise_count} ejercicios
                        </span>
                      </div>
                    </div>
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={() => handleStartWorkout(routine.id)}
                    >
                      Iniciar
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron rutinas
            </div>
          )}

          <Button
            variant="secondary"
            fullWidth
            className="mt-4"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={handleCreateRoutine}
          >
            Crear Nueva Rutina
          </Button>
        </div>
      )}
    </div>
  );
};

export default WorkoutPage;
