
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Save, X } from "lucide-react";
import { Card, CardBody } from "@/components/Card";
import Button from "@/components/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { validateImageFile } from "@/utils/validation";

const muscleGroups = [
  "Pecho", "Espalda", "Piernas", "Hombros", "Bíceps", "Tríceps", "Core", "Glúteos"
];

const equipmentTypes = [
  "Peso Corporal", "Mancuernas", "Barra", "Máquinas", "Banda Elástica", "TRX", "Kettlebell"
];

const difficultyLevels = [
  "Principiante", "Intermedio", "Avanzado"
];

const CreateExercisePage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [muscleGroup, setMuscleGroup] = useState("");
  const [equipment, setEquipment] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // FIXED: Validate file size and type using our validation utility
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    // Additional check for 10MB limit and video files
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'video/mp4'];
    
    if (file.size > maxSize) {
      toast.error("El archivo excede el límite de 10 MB. Por favor, sube un archivo más pequeño.");
      return;
    }
    
    if (!allowedTypes.includes(file.type)) {
      toast.error("Formato no permitido. Solo se aceptan archivos JPG, PNG y MP4.");
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setMediaFile(file);
    setMediaPreview(previewUrl);
  };

  const removeMedia = () => {
    if (mediaPreview) {
      URL.revokeObjectURL(mediaPreview);
    }
    setMediaFile(null);
    setMediaPreview(null);
  };

  const validateForm = () => {
    if (!name.trim()) {
      toast.error("Por favor ingresa un nombre para el ejercicio.");
      return false;
    }
    
    if (!muscleGroup) {
      toast.error("Por favor selecciona un grupo muscular principal.");
      return false;
    }
    
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Debes iniciar sesión para crear ejercicios.");
        setSaving(false);
        return;
      }

      // Map difficulty level to enum values
      let difficultyEnum: "beginner" | "intermediate" | "advanced" | null = null;
      if (difficulty === "Principiante") difficultyEnum = "beginner";
      else if (difficulty === "Intermedio") difficultyEnum = "intermediate";
      else if (difficulty === "Avanzado") difficultyEnum = "advanced";

      // FIXED: Actually save the exercise to the database
      const exerciseData = {
        name: name.trim(),
        description: description.trim() || null,
        muscle_group_main: muscleGroup,
        equipment_required: equipment || null,
        difficulty_level: difficultyEnum,
        created_by_user_id: user.id,
        video_url: null // For now, we'll implement file upload later
      };

      const { error } = await supabase
        .from('exercises')
        .insert([exerciseData]);

      if (error) {
        console.error("Error saving exercise:", error);
        toast.error("Error al guardar el ejercicio. Intenta de nuevo.");
        return;
      }

      toast.success("Ejercicio guardado exitosamente.");
      navigate(-1);
    } catch (error) {
      console.error("Error saving exercise:", error);
      toast.error("Error al guardar el ejercicio. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Show confirmation if form has been modified
    if (name || description || muscleGroup || equipment || mediaFile) {
      if (window.confirm("¿Descartar cambios?")) {
        navigate(-1);
      }
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen pb-24 max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background p-4 flex items-center justify-between border-b border-muted/20">
        <div className="flex items-center">
          <button 
            onClick={handleCancel}
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
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Guardando..." : "Guardar"}
        </Button>
      </div>

      <div className="p-4 space-y-6">
        {/* Media Upload */}
        <Card>
          <CardBody>
            {mediaPreview ? (
              <div className="relative aspect-video rounded-lg overflow-hidden">
                {mediaFile?.type.startsWith('video/') ? (
                  <video 
                    src={mediaPreview} 
                    className="w-full h-full object-cover"
                    controls 
                  />
                ) : (
                  <img 
                    src={mediaPreview} 
                    className="w-full h-full object-cover"
                    alt="Ejercicio" 
                  />
                )}
                <button 
                  onClick={removeMedia}
                  className="absolute top-2 right-2 bg-background/80 p-1 rounded-full"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="cursor-pointer flex flex-col items-center justify-center aspect-video border-2 border-dashed border-muted-foreground/30 rounded-lg hover:border-primary/40 transition-colors">
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">
                  Subir imagen o video
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  Formatos: JPG, PNG, MP4 (máx. 10MB)
                </span>
                <input 
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/png,video/mp4"
                  onChange={handleFileChange}
                />
              </label>
            )}
          </CardBody>
        </Card>

        {/* Exercise Info Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre del Ejercicio*</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Press de Banca"
              className="w-full h-10 rounded-xl px-4 bg-secondary border-none focus:ring-1 focus:ring-primary outline-none shadow-neu-button"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Grupo Muscular Principal*</label>
            <Select value={muscleGroup} onValueChange={setMuscleGroup}>
              <SelectTrigger className="w-full h-10 rounded-xl bg-secondary border-none focus:ring-1 focus:ring-primary outline-none shadow-neu-button">
                <SelectValue placeholder="Seleccionar grupo muscular" />
              </SelectTrigger>
              <SelectContent className="bg-background/95 backdrop-blur-sm border border-secondary">
                {muscleGroups.map((group) => (
                  <SelectItem key={group} value={group}>{group}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Equipamiento Necesario</label>
            <Select value={equipment} onValueChange={setEquipment}>
              <SelectTrigger className="w-full h-10 rounded-xl bg-secondary border-none focus:ring-1 focus:ring-primary outline-none shadow-neu-button">
                <SelectValue placeholder="Seleccionar equipamiento" />
              </SelectTrigger>
              <SelectContent className="bg-background/95 backdrop-blur-sm border border-secondary">
                {equipmentTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Nivel de Dificultad</label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="w-full h-10 rounded-xl bg-secondary border-none focus:ring-1 focus:ring-primary outline-none shadow-neu-button">
                <SelectValue placeholder="Seleccionar dificultad" />
              </SelectTrigger>
              <SelectContent className="bg-background/95 backdrop-blur-sm border border-secondary">
                {difficultyLevels.map((level) => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe cómo realizar correctamente el ejercicio..."
              rows={4}
              className="w-full rounded-xl p-4 bg-secondary border-none focus:ring-1 focus:ring-primary outline-none shadow-neu-button resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateExercisePage;
