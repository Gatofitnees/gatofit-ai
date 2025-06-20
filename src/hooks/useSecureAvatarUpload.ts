
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { validateImageFile } from '@/utils/enhancedInputValidation';
import { logSecurityEvent } from '@/utils/securityLogger';
import { securityConfig } from '@/utils/secureConfig';

export const useSecureAvatarUpload = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const secureUploadAvatar = async (file: File): Promise<string | null> => {
    if (!user) {
      logSecurityEvent({
        timestamp: new Date().toISOString(),
        eventType: 'avatar_upload_unauthorized',
        details: 'No authenticated user',
        severity: 'high',
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
        location: typeof window !== 'undefined' ? window.location.href : undefined
      });
      return null;
    }

    // Enhanced file validation
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      toast({
        title: "Error",
        description: validation.error,
        variant: "destructive"
      });
      return null;
    }

    // Additional security checks
    if (file.size > securityConfig.fileUpload.maxSize) {
      toast({
        title: "Error",
        description: `Archivo demasiado grande (máximo ${securityConfig.fileUpload.maxSize / 1024 / 1024}MB)`,
        variant: "destructive"
      });
      return null;
    }

    // Check file header to prevent MIME type spoofing
    const fileHeader = await checkFileHeader(file);
    if (!fileHeader.isValid) {
      logSecurityEvent({
        timestamp: new Date().toISOString(),
        eventType: 'avatar_upload_invalid_header',
        details: 'File header validation failed',
        severity: 'high',
        userId: user.id,
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
        location: typeof window !== 'undefined' ? window.location.href : undefined
      });
      toast({
        title: "Error",
        description: "Archivo de imagen inválido",
        variant: "destructive"
      });
      return null;
    }

    setUploading(true);
    try {
      // Generate secure filename
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const fileName = `${user.id}/${timestamp}_${randomSuffix}.${fileExt}`;

      // Delete old avatar if exists (cleanup)
      try {
        const { data: oldFiles } = await supabase.storage
          .from('avatars')
          .list(user.id);

        if (oldFiles && oldFiles.length > 0) {
          const filesToDelete = oldFiles.map(file => `${user.id}/${file.name}`);
          await supabase.storage
            .from('avatars')
            .remove(filesToDelete);
        }
      } catch (error) {
        console.warn('Could not clean up old avatars:', error);
      }

      // Upload new avatar
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

      logSecurityEvent({
        timestamp: new Date().toISOString(),
        eventType: 'avatar_upload_success',
        details: `Successfully uploaded avatar: ${fileName}`,
        severity: 'low',
        userId: user.id,
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
        location: typeof window !== 'undefined' ? window.location.href : undefined
      });

      toast({
        title: "Éxito",
        description: "Foto de perfil actualizada"
      });

      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      logSecurityEvent({
        timestamp: new Date().toISOString(),
        eventType: 'avatar_upload_error',
        details: error.message || 'Unknown upload error',
        severity: 'medium',
        userId: user.id,
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
        location: typeof window !== 'undefined' ? window.location.href : undefined
      });
      
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
