
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export const useCreateExercise = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [muscleGroups, setMuscleGroups] = useState<string[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const formState = {
    name,
    description,
    muscleGroups,
    equipmentTypes,
    difficulty,
    mediaFile,
    mediaPreview
  };

  const setters = {
    setName,
    setDescription,
    setMuscleGroups,
    setEquipmentTypes,
    setDifficulty
  };

  const handleFileChange = (file: File | null) => {
    setMediaFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setMediaPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setMediaPreview("");
    }
  };

  const removeMedia = () => {
    setMediaFile(null);
    setMediaPreview("");
  };

  const mediaHandlers = {
    handleFileChange,
    removeMedia
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("El nombre del ejercicio es obligatorio");
      return;
    }

    if (muscleGroups.length === 0) {
      toast.error("Debes seleccionar al menos un grupo muscular");
      return;
    }

    if (!user) {
      toast.error("Debes estar autenticado para crear un ejercicio");
      return;
    }

    setSaving(true);

    try {
      let videoUrl = "";
      let imageUrl = "";

      // Upload media file if exists
      if (mediaFile) {
        const fileExt = mediaFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `exercises/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('exercise-media')
          .upload(filePath, mediaFile);

        if (uploadError) {
          console.error("Error uploading file:", uploadError);
          toast.error("Error al subir el archivo multimedia");
          return;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('exercise-media')
          .getPublicUrl(filePath);

        if (mediaFile.type.startsWith('video/')) {
          videoUrl = publicUrl;
        } else {
          imageUrl = publicUrl;
        }
      }

      // Normalize difficulty level
      const normalizedDifficulty = difficulty === "Principiante" ? "beginner" :
                                 difficulty === "Intermedio" ? "intermediate" :
                                 difficulty === "Avanzado" ? "advanced" : "beginner";

      // Create exercise
      const { error: insertError } = await supabase
        .from('exercises')
        .insert({
          name: name.trim(),
          description: description.trim() || null,
          muscle_group_main: muscleGroups.join(' '),
          equipment_required: equipmentTypes.length > 0 ? equipmentTypes.join(' ') : null,
          difficulty_level: normalizedDifficulty,
          video_url: videoUrl || null,
          image_url: imageUrl || null,
          created_by_user_id: user.id
        });

      if (insertError) {
        console.error("Error creating exercise:", insertError);
        toast.error("Error al crear el ejercicio");
        return;
      }

      toast.success("Ejercicio creado exitosamente");
      navigate(-1);

    } catch (error) {
      console.error("Error creating exercise:", error);
      toast.error("Error inesperado al crear el ejercicio");
    } finally {
      setSaving(false);
    }
  };

  const actionHandlers = {
    handleCancel,
    handleSave
  };

  return {
    formState,
    setters,
    mediaHandlers,
    actionHandlers,
    saving
  };
};
