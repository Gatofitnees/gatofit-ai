
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export const useSecureAvatarUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const deleteOldAvatar = async (userId: string): Promise<void> => {
    try {
      console.log('Cleaning up old avatars for user:', userId);
      
      // Listar todos los archivos del usuario en el bucket avatars
      const { data: files, error: listError } = await supabase.storage
        .from('avatars')
        .list(userId);

      if (listError) {
        console.error('Error listing old avatars:', listError);
        return; // No fallar si no se pueden listar
      }

      if (!files || files.length === 0) {
        console.log('No old avatars found to delete');
        return;
      }

      // Crear array de paths para borrar
      const filesToDelete = files.map(file => `${userId}/${file.name}`);
      
      console.log('Deleting old avatars:', filesToDelete);

      // Borrar todos los archivos antiguos
      const { error: deleteError } = await supabase.storage
        .from('avatars')
        .remove(filesToDelete);

      if (deleteError) {
        console.error('Error deleting old avatars:', deleteError);
        // No lanzar error, solo loggearlo
      } else {
        console.log('Old avatars deleted successfully');
      }
    } catch (error) {
      console.error('Unexpected error during avatar cleanup:', error);
      // No lanzar error para no afectar el flujo principal
    }
  };

  const uploadAvatar = async (file: File): Promise<string | null> => {
    if (!file) return null;

    setIsUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // Limpiar avatares antiguos ANTES de subir el nuevo
      await deleteOldAvatar(user.id);

      // Crear nombre único para el archivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      console.log('Uploading new avatar:', fileName);

      // Subir el nuevo archivo
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false // No sobreescribir, crear nuevo archivo
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      console.log('Avatar uploaded successfully:', publicUrl);

      // Actualizar perfil con nueva URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating profile:', updateError);
        throw updateError;
      }

      toast({
        title: "Éxito",
        description: "Avatar actualizado correctamente",
      });

      return publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error",
        description: "Error al subir el avatar",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadAvatar,
    isUploading
  };
};
