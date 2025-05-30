
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { RateLimiter } from '@/utils/securityValidation';

// Rate limiter for avatar uploads (max 3 uploads per 5 minutes)
const avatarUploadLimiter = new RateLimiter(3, 300000);

export const useSecureAvatarUpload = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const secureUploadAvatar = async (file: File): Promise<string | null> => {
    if (!user) return null;

    // Rate limiting
    if (!avatarUploadLimiter.isAllowed(user.id)) {
      toast({
        title: "Error",
        description: "Demasiadas subidas de avatar. Espera unos minutos antes de intentar de nuevo.",
        variant: "destructive"
      });
      return null;
    }

    // Enhanced file validation
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (file.size > maxSize) {
      toast({
        title: "Error",
        description: "La imagen debe ser menor a 5MB",
        variant: "destructive"
      });
      return null;
    }

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Error",
        description: "Solo se permiten archivos JPG, PNG y WebP",
        variant: "destructive"
      });
      return null;
    }

    // Check file header to prevent MIME type spoofing
    const fileHeader = await checkFileHeader(file);
    if (!fileHeader.isValid) {
      toast({
        title: "Error",
        description: "Archivo de imagen inválido",
        variant: "destructive"
      });
      return null;
    }

    setUploading(true);
    try {
      // Generate secure filename with timestamp and random suffix
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const fileName = `${user.id}/${timestamp}_${randomSuffix}.${fileExt}`;

      // Delete old avatar if exists
      const { data: oldFiles } = await supabase.storage
        .from('avatars')
        .list(user.id);

      if (oldFiles && oldFiles.length > 0) {
        const filesToDelete = oldFiles.map(file => `${user.id}/${file.name}`);
        await supabase.storage
          .from('avatars')
          .remove(filesToDelete);
      }

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast({
        title: "Éxito",
        description: "Foto de perfil actualizada"
      });

      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo subir la imagen",
        variant: "destructive"
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { secureUploadAvatar, uploading };
};

// Helper function to check file headers for security
const checkFileHeader = async (file: File): Promise<{ isValid: boolean }> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (!e.target?.result) {
        resolve({ isValid: false });
        return;
      }

      const arr = new Uint8Array(e.target.result as ArrayBuffer);
      const header = arr.slice(0, 4);
      
      // Check for common image file signatures
      const signatures = {
        jpg: [0xFF, 0xD8, 0xFF],
        png: [0x89, 0x50, 0x4E, 0x47],
        webp: [0x52, 0x49, 0x46, 0x46] // RIFF (WebP container)
      };

      let isValid = false;
      for (const [type, sig] of Object.entries(signatures)) {
        if (sig.every((byte, index) => header[index] === byte)) {
          isValid = true;
          break;
        }
      }

      resolve({ isValid });
    };
    reader.onerror = () => resolve({ isValid: false });
    reader.readAsArrayBuffer(file.slice(0, 4));
  });
};
