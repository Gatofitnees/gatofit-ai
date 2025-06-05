
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useSharedRoutines = () => {
  const { toast } = useToast();
  const [isPublishing, setIsPublishing] = useState(false);

  const publishRoutine = useCallback(async (routineId: number) => {
    try {
      setIsPublishing(true);
      
      // Check if routine is already published
      const { data: existingShare, error: checkError } = await supabase
        .from('shared_routines')
        .select('id')
        .eq('routine_id', routineId)
        .eq('is_public', true)
        .maybeSingle();

      if (checkError) {
        throw checkError;
      }

      if (existingShare) {
        toast({
          title: "Rutina ya publicada",
          description: "Esta rutina ya está en tu perfil público",
          variant: "default"
        });
        return;
      }

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Usuario no autenticado');
      }

      // Publish the routine
      const { error: publishError } = await supabase
        .from('shared_routines')
        .insert({
          routine_id: routineId,
          user_id: user.id,
          is_public: true
        });

      if (publishError) {
        throw publishError;
      }

      toast({
        title: "¡Rutina publicada!",
        description: "Tu rutina ahora es visible en tu perfil público",
        variant: "success"
      });

    } catch (error: any) {
      console.error('Error publishing routine:', error);
      toast({
        title: "Error",
        description: "No se pudo publicar la rutina. Intenta de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsPublishing(false);
    }
  }, [toast]);

  const unpublishRoutine = useCallback(async (routineId: number) => {
    try {
      setIsPublishing(true);

      const { error } = await supabase
        .from('shared_routines')
        .delete()
        .eq('routine_id', routineId)
        .eq('is_public', true);

      if (error) {
        throw error;
      }

      toast({
        title: "Rutina despublicada",
        description: "Tu rutina ya no es visible en tu perfil público",
        variant: "success"
      });

    } catch (error: any) {
      console.error('Error unpublishing routine:', error);
      toast({
        title: "Error",
        description: "No se pudo despublicar la rutina. Intenta de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsPublishing(false);
    }
  }, [toast]);

  const checkIfPublished = useCallback(async (routineId: number) => {
    try {
      const { data, error } = await supabase
        .from('shared_routines')
        .select('id')
        .eq('routine_id', routineId)
        .eq('is_public', true)
        .maybeSingle();

      if (error) {
        console.error('Error checking publication status:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error checking publication status:', error);
      return false;
    }
  }, []);

  return {
    publishRoutine,
    unpublishRoutine,
    checkIfPublished,
    isPublishing
  };
};
