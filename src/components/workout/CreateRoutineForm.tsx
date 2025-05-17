
import React, { useState } from "react";
import { Card, CardBody, CardHeader } from "@/components/Card";
import { ChevronDown, Plus } from "lucide-react";
import Button from "@/components/Button";
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToastHelper } from "@/hooks/useToastHelper";
import { supabase } from "@/integrations/supabase/client";

interface CreateRoutineFormProps {
  onSelectExercises: () => void;
}

const CreateRoutineForm: React.FC<CreateRoutineFormProps> = ({ 
  onSelectExercises 
}) => {
  const [routineName, setRoutineName] = useState("");
  const [routineType, setRoutineType] = useState("");
  const [routineDescription, setRoutineDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToastHelper();

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
      
      // After successful creation, call the parent function with routine data
      onSelectExercises();
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

  return (
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
  );
};

export default CreateRoutineForm;
