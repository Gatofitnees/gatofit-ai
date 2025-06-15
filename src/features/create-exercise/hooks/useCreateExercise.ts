
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { validateImageFile } from "@/utils/validation";
import { extractFrameFromVideo } from "@/utils/videoUtils";

export const useCreateExercise = () => {
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

    const validation = validateImageFile(file);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

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
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Debes iniciar sesión para crear ejercicios.");
        setSaving(false);
        return;
      }

      let videoUrl: string | null = null;
      let imageUrl: string | null = null;
      let thumbnailUrl: string | null = null;

      if (mediaFile) {
        const isVideo = mediaFile.type.startsWith('video/');
        const fileExt = mediaFile.name.split('.').pop();
        const bucket = 'exercise-media'; 
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(fileName, mediaFile);

        if (uploadError) {
            console.error('Error uploading media:', uploadError);
            toast.error(`Error al subir el archivo. Asegúrate de que el bucket de almacenamiento '${bucket}' existe y es público.`);
            setSaving(false);
            return;
        }

        const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);

        if (isVideo) {
          videoUrl = publicUrl;
          try {
            const frameBlob = await extractFrameFromVideo(mediaFile);
            if (frameBlob) {
              const thumbFileName = `${user.id}/thumb-${Date.now()}.jpg`;
              const { error: thumbUploadError } = await supabase.storage
                .from('exercise-thumbnails')
                .upload(thumbFileName, frameBlob, { contentType: 'image/jpeg' });

              if (thumbUploadError) {
                console.warn('Thumbnail upload failed:', thumbUploadError);
                toast.warning("El video se subió, pero no se pudo generar la miniatura.");
              } else {
                const { data: { publicUrl: thumbPublicUrl } } = supabase.storage
                  .from('exercise-thumbnails')
                  .getPublicUrl(thumbFileName);
                thumbnailUrl = thumbPublicUrl;
              }
            }
          } catch (thumbError) {
            console.error("Error generating thumbnail:", thumbError);
            toast.warning("El video se subió, pero no se pudo generar la miniatura.");
          }
        } else {
          imageUrl = publicUrl;
        }
      }

      let difficultyEnum: "beginner" | "intermediate" | "advanced" | null = null;
      if (difficulty === "Principiante") difficultyEnum = "beginner";
      else if (difficulty === "Intermedio") difficultyEnum = "intermediate";
      else if (difficulty === "Avanzado") difficultyEnum = "advanced";

      const exerciseData = {
        name: name.trim(),
        description: description.trim() || null,
        muscle_group_main: muscleGroup,
        equipment_required: equipment || null,
        difficulty_level: difficultyEnum,
        created_by_user_id: user.id,
        video_url: videoUrl,
        image_url: imageUrl,
        thumbnail_url: thumbnailUrl
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
      toast.error("Ocurrió un error inesperado al guardar. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (name || description || muscleGroup || equipment || mediaFile) {
      if (window.confirm("¿Descartar cambios?")) {
        navigate(-1);
      }
    } else {
      navigate(-1);
    }
  };

  return {
    formState: { name, description, muscleGroup, equipment, difficulty, mediaFile, mediaPreview },
    setters: { setName, setDescription, setMuscleGroup, setEquipment, setDifficulty },
    mediaHandlers: { handleFileChange, removeMedia },
    actionHandlers: { handleSave, handleCancel },
    saving,
  };
};
