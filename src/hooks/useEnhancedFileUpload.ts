
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { validateSecureFileUpload } from '@/utils/enhancedSecurityValidation';
import { logSecurityEvent } from '@/utils/securityLogger';
import { RateLimiter } from '@/utils/enhancedSecurityValidation';

// Stricter rate limiting for file uploads
const fileUploadLimiter = new RateLimiter(10, 600000); // 10 uploads per 10 minutes

export const useEnhancedFileUpload = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const secureUploadFile = async (
    file: File, 
    bucket: string, 
    path?: string
  ): Promise<string | null> => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to upload files",
        variant: "destructive"
      });
      return null;
    }

    // Rate limiting
    if (!fileUploadLimiter.isAllowed(user.id)) {
      toast({
        title: "Error",
        description: "Too many file uploads. Please wait before trying again.",
        variant: "destructive"
      });
      logSecurityEvent({
        timestamp: new Date().toISOString(),
        eventType: 'file_upload_rate_limit_exceeded',
        userId: user.id,
        details: 'Rate limit exceeded for file upload',
        severity: 'medium',
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
        location: typeof window !== 'undefined' ? window.location.href : undefined
      });
      return null;
    }

    // Enhanced file validation
    const validation = await validateSecureFileUpload(file);
    if (!validation.isValid) {
      toast({
        title: "Error",
        description: validation.error,
        variant: "destructive"
      });
      logSecurityEvent({
        timestamp: new Date().toISOString(),
        eventType: 'file_upload_validation_failed',
        userId: user.id,
        details: validation.error || 'Unknown validation error',
        severity: 'medium',
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
        location: typeof window !== 'undefined' ? window.location.href : undefined
      });
      return null;
    }

    setUploading(true);
    try {
      // Generate secure filename
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const timestamp = Date.now();
      const randomSuffix = crypto.randomUUID().substring(0, 8);
      const fileName = path || `${user.id}/${timestamp}_${randomSuffix}.${fileExt}`;

      logSecurityEvent({
        timestamp: new Date().toISOString(),
        eventType: 'file_upload_started',
        userId: user.id,
        details: `Bucket: ${bucket}, Size: ${file.size}`,
        severity: 'low',
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
        location: typeof window !== 'undefined' ? window.location.href : undefined
      });

      // Upload with enhanced security options
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
          duplex: 'half'
        });

      if (error) {
        logSecurityEvent({
          timestamp: new Date().toISOString(),
          eventType: 'file_upload_failed',
          userId: user.id,
          details: `${bucket}/${fileName}: ${error.message}`,
          severity: 'medium',
          userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
          location: typeof window !== 'undefined' ? window.location.href : undefined
        });
        throw error;
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      logSecurityEvent({
        timestamp: new Date().toISOString(),
        eventType: 'file_upload_success',
        userId: user.id,
        details: `${bucket}/${fileName}`,
        severity: 'low',
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
        location: typeof window !== 'undefined' ? window.location.href : undefined
      });

      toast({
        title: "Success",
        description: "File uploaded successfully"
      });

      return publicUrl;

    } catch (error: any) {
      console.error('File upload error:', error);
      logSecurityEvent({
        timestamp: new Date().toISOString(),
        eventType: 'file_upload_error',
        userId: user.id,
        details: error.message,
        severity: 'medium',
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
        location: typeof window !== 'undefined' ? window.location.href : undefined
      });
      
      toast({
        title: "Error",
        description: error.message || "Failed to upload file",
        variant: "destructive"
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const secureDeleteFile = async (bucket: string, path: string): Promise<boolean> => {
    if (!user) return false;

    try {
      // Verify user owns this file (path should start with user ID)
      if (!path.startsWith(user.id + '/')) {
        logSecurityEvent({
          timestamp: new Date().toISOString(),
          eventType: 'file_delete_unauthorized',
          userId: user.id,
          details: `User ${user.id} tried to delete ${path}`,
          severity: 'high',
          userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
          location: typeof window !== 'undefined' ? window.location.href : undefined
        });
        toast({
          title: "Error",
          description: "Unauthorized file deletion attempt",
          variant: "destructive"
        });
        return false;
      }

      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) throw error;

      logSecurityEvent({
        timestamp: new Date().toISOString(),
        eventType: 'file_delete_success',
        userId: user.id,
        details: `${bucket}/${path}`,
        severity: 'low',
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
        location: typeof window !== 'undefined' ? window.location.href : undefined
      });
      return true;

    } catch (error: any) {
      console.error('File deletion error:', error);
      logSecurityEvent({
        timestamp: new Date().toISOString(),
        eventType: 'file_delete_error',
        userId: user.id,
        details: error.message,
        severity: 'medium',
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
        location: typeof window !== 'undefined' ? window.location.href : undefined
      });
      
      toast({
        title: "Error",
        description: "Failed to delete file",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    secureUploadFile,
    secureDeleteFile,
    uploading
  };
};
