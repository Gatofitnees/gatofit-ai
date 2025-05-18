
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { Card, CardHeader, CardBody } from "../components/Card";
import Button from "../components/Button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const muscleGroups = [
  "Pecho", "Espalda", "Hombros", "Bíceps", "Tríceps", 
  "Antebrazos", "Abdominales", "Core", "Cuádriceps", 
  "Isquiotibiales", "Glúteos", "Gemelos", "Cardio"
];

const equipmentOptions = [
  "Peso Corporal", "Barra", "Mancuernas", "Máquina", 
  "Kettlebell", "Bandas de Resistencia", "TRX", "Balón Medicinal"
];

// Define proper difficulty mapping that matches the database enum values
const difficultyMap: { [key: string]: "beginner" | "intermediate" | "advanced" } = {
  "Principiante": "beginner",
  "Intermedio": "intermediate",
  "Avanzado": "advanced"
};

const CreateExercisePage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [exerciseName, setExerciseName] = useState("");
  const [muscleGroup, setMuscleGroup] = useState("");
  const [equipment, setEquipment] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<"Principiante" | "Intermedio" | "Avanzado" | "">("");
  const [videoUrl, setVideoUrl] = useState("");
  
  const handleBack = () => {
    navigate("/workout/select-exercises");
  };

  const handleSaveExercise = async () => {
    if (!exerciseName || !muscleGroup) {
      toast({
        title: "Error",
        description: "Por favor ingresa al menos nombre y grupo muscular",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      // Create exercise object with correct mapping of difficulty level
      const exerciseData = {
        name: exerciseName,
        muscle_group_main: muscleGroup,
        equipment_required: equipment || null,
        description: description || null,
        // Only set difficulty_level if a value has been selected
        ...(difficulty && { difficulty_level: difficultyMap[difficulty] }),
        video_url: videoUrl || null,
        created_by_user_id: user?.id || null
      };
      
      // Insert exercise
      const { data, error } = await supabase
        .from('exercises')
        .insert(exerciseData)
        .select();

      if (error) {
        throw error;
      }

      toast({
        title: "¡Ejercicio creado!",
        description: `El ejercicio ${exerciseName} ha sido añadido correctamente`,
      });

      // Redirect back to select-exercises page
      navigate("/workout/select-exercises");
    } catch (error) {
      console.error("Error saving exercise:", error);
      toast({
        title: "Error al guardar",
        description: "Ha ocurrido un error al guardar el ejercicio",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <button 
            onClick={handleBack}
            className="mr-3 p-1 rounded-full hover:bg-secondary/50"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold">Crear Ejercicio</h1>
        </div>
        <Button 
          variant="primary" 
          size="sm"
          leftIcon={<Save className="h-4 w-4" />}
          onClick={handleSaveExercise}
          disabled={isSubmitting}
        >
          Guardar
        </Button>
      </div>
      
      <Card>
        <CardHeader title="Información del Ejercicio" />
        <CardBody>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre del Ejercicio *</label>
              <input 
                type="text" 
                placeholder="Ej: Press de Banca" 
                value={exerciseName}
                onChange={(e) => setExerciseName(e.target.value)}
                className="w-full h-10 rounded-xl px-4 bg-secondary border-none focus:ring-1 focus:ring-primary outline-none shadow-neu-button"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Grupo Muscular Principal *</label>
              <Select value={muscleGroup} onValueChange={setMuscleGroup}>
                <SelectTrigger className="w-full h-10 rounded-xl px-4 bg-secondary border-none focus:ring-1 focus:ring-primary outline-none shadow-neu-button">
                  <SelectValue placeholder="Seleccionar grupo muscular" />
                </SelectTrigger>
                <SelectContent className="bg-background/95 backdrop-blur-sm border border-secondary">
                  <SelectGroup>
                    {muscleGroups.map((group) => (
                      <SelectItem key={group} value={group}>{group}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Equipamiento Necesario</label>
              <Select value={equipment} onValueChange={setEquipment}>
                <SelectTrigger className="w-full h-10 rounded-xl px-4 bg-secondary border-none focus:ring-1 focus:ring-primary outline-none shadow-neu-button">
                  <SelectValue placeholder="Seleccionar equipamiento" />
                </SelectTrigger>
                <SelectContent className="bg-background/95 backdrop-blur-sm border border-secondary">
                  <SelectGroup>
                    {equipmentOptions.map((option) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Dificultad</label>
              <Select value={difficulty} onValueChange={(value) => setDifficulty(value as any)}>
                <SelectTrigger className="w-full h-10 rounded-xl px-4 bg-secondary border-none focus:ring-1 focus:ring-primary outline-none shadow-neu-button">
                  <SelectValue placeholder="Seleccionar dificultad" />
                </SelectTrigger>
                <SelectContent className="bg-background/95 backdrop-blur-sm border border-secondary">
                  <SelectGroup>
                    <SelectItem value="Principiante">Principiante</SelectItem>
                    <SelectItem value="Intermedio">Intermedio</SelectItem>
                    <SelectItem value="Avanzado">Avanzado</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">URL del Video (opcional)</label>
              <input 
                type="text" 
                placeholder="URL de video demostrativo" 
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full h-10 rounded-xl px-4 bg-secondary border-none focus:ring-1 focus:ring-primary outline-none shadow-neu-button"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Descripción (opcional)</label>
              <textarea 
                rows={3}
                placeholder="Describe cómo realizar el ejercicio correctamente..." 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl p-4 bg-secondary border-none focus:ring-1 focus:ring-primary outline-none shadow-neu-button resize-none"
              />
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default CreateExercisePage;
