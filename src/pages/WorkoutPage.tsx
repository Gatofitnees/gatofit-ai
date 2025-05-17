
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown, Clock, Dumbbell, Filter, Plus, Search } from "lucide-react";
import { Card, CardHeader, CardBody } from "../components/Card";
import Button from "../components/Button";
import TabMenu from "../components/TabMenu";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToastHelper } from "@/hooks/useToastHelper";

interface WorkoutRoutine {
  id: string;
  name: string;
  type: string;
  duration: string;
  exercises: number;
}

const WorkoutPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("routines");
  const [routines, setRoutines] = useState<WorkoutRoutine[]>([]);
  const [routineName, setRoutineName] = useState("");
  const [routineType, setRoutineType] = useState("");
  const [routineDescription, setRoutineDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToastHelper();
  
  // Fetch user routines
  useEffect(() => {
    const fetchRoutines = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session.session) return;
        
        // First get the basic routine info
        const { data: routinesData, error } = await supabase
          .from('routines')
          .select('*')
          .eq('user_id', session.session.user.id);
          
        if (error) throw error;
        
        if (routinesData) {
          // Now fetch exercise counts for each routine
          const routinesWithExercises = await Promise.all(
            routinesData.map(async (routine) => {
              const { count: exerciseCount, error: countError } = await supabase
                .from('routine_exercises')
                .select('*', { count: 'exact', head: true })
                .eq('routine_id', routine.id);
              
              if (countError) {
                console.error("Error counting exercises:", countError);
              }
              
              // Use the routine.type if it exists, otherwise use a default value
              const routineType = (routine as any).type || "Mixto";
              
              return {
                id: routine.id.toString(),
                name: routine.name,
                type: routineType, // Using the safely accessed type value
                duration: `${routine.estimated_duration_minutes || 45} min`,
                exercises: exerciseCount || 0
              };
            })
          );
          
          setRoutines(routinesWithExercises);
        }
      } catch (error) {
        console.error("Error fetching routines:", error);
        toast.showError(
          "Error", 
          "No se pudieron cargar las rutinas"
        );
      }
    };
    
    if (activeTab === "routines") {
      fetchRoutines();
    }
  }, [activeTab, toast]);

  const handleNewRoutine = () => {
    // Just navigate to the create tab
    setActiveTab("create");
  };

  const handleSelectExercises = async () => {
    // Return early if routine name is empty
    if (!routineName.trim()) {
      toast.showError(
        "Nombre requerido",
        "Por favor añade un nombre para tu rutina"
      );
      return;
    }

    try {
      setIsLoading(true);
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        toast.showError(
          "Error de autenticación",
          "Debes iniciar sesión para crear rutinas"
        );
        return;
      }
      
      // Create a temporary routine in the database
      const { data, error } = await supabase.from('routines').insert({
        name: routineName,
        type: routineType || "Mixto",
        description: routineDescription,
        user_id: session.session.user.id,
        is_predefined: false
      }).select().single();
      
      if (error) throw error;
      
      // Navigate to exercise selection with the routine id
      navigate("/workout/select-exercises", { 
        state: { 
          routineId: data.id,
          routineName: routineName
        }
      });
    } catch (error) {
      console.error("Error creating routine:", error);
      toast.showError(
        "Error",
        "No se pudo crear la rutina"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartRoutine = (routineId: string) => {
    // Navigate to start the workout
    navigate(`/workout/start/${routineId}`);
  };

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-6">Entrenamiento</h1>
      
      <TabMenu 
        tabs={[
          { id: "routines", label: "Mis Rutinas" },
          { id: "create", label: "Crear Rutina" }
        ]}
        defaultTab="routines"
        onChange={setActiveTab}
        className="mb-6"
      />
      
      {activeTab === "routines" ? (
        <>
          {/* Search and Filter */}
          <div className="flex items-center gap-2 mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Buscar rutinas..." 
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
          <div className="space-y-4">
            {routines.length > 0 ? (
              routines.map((routine) => (
                <Card key={routine.id} className="hover:scale-[1.01] transition-transform duration-300">
                  <CardBody>
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                        <Dumbbell className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{routine.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                            {routine.type}
                          </span>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            {routine.duration}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {routine.exercises} ejercicios
                          </span>
                        </div>
                      </div>
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={() => handleStartRoutine(routine.id)}
                      >
                        Iniciar
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No tienes rutinas guardadas</p>
                <p className="text-sm mt-2">Crea tu primera rutina usando el botón de abajo</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="animate-fade-in">
          <Card>
            <CardHeader title="Crear Nueva Rutina" />
            <CardBody>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre de la Rutina</label>
                  <input 
                    type="text" 
                    placeholder="Ej: Día de Pierna" 
                    className="w-full h-10 rounded-xl px-4 bg-secondary border-none focus:ring-1 focus:ring-primary outline-none shadow-neu-button"
                    value={routineName}
                    onChange={(e) => setRoutineName(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Tipo de Rutina</label>
                  <Select value={routineType} onValueChange={setRoutineType}>
                    <SelectTrigger className="w-full h-10 rounded-xl px-4 bg-secondary border-none focus:ring-1 focus:ring-primary outline-none shadow-neu-button">
                      <SelectValue placeholder="Seleccionar tipo" />
                      <ChevronDown className="h-4 w-4 text-primary" />
                    </SelectTrigger>
                    <SelectContent className="bg-background/95 backdrop-blur-sm border border-secondary">
                      <SelectGroup>
                        <SelectItem value="strength">Fuerza</SelectItem>
                        <SelectItem value="cardio">Cardio</SelectItem>
                        <SelectItem value="flexibility">Flexibilidad</SelectItem>
                        <SelectItem value="mixed">Mixto</SelectItem>
                        <SelectItem value="custom">Personalizado</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Descripción (opcional)</label>
                  <textarea 
                    rows={3}
                    placeholder="Describe brevemente esta rutina..." 
                    className="w-full rounded-xl p-4 bg-secondary border-none focus:ring-1 focus:ring-primary outline-none shadow-neu-button resize-none"
                    value={routineDescription}
                    onChange={(e) => setRoutineDescription(e.target.value)}
                  />
                </div>
                
                <div className="pt-2">
                  <Button 
                    variant="primary" 
                    fullWidth 
                    leftIcon={<Plus className="h-4 w-4" />}
                    onClick={handleSelectExercises}
                    disabled={isLoading}
                  >
                    {isLoading ? "Creando..." : "Añadir Ejercicios"}
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
};

export default WorkoutPage;
