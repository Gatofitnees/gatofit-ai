
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface UsageLimits {
  routines_created: number;
  nutrition_photos_used: number;
  ai_chat_messages_used: number;
  week_start_date: string;
}

export interface LimitCheck {
  canProceed: boolean;
  currentUsage: number;
  limit: number;
  isOverLimit: boolean;
}

export const useUsageLimits = () => {
  const [usage, setUsage] = useState<UsageLimits | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsage();
  }, []);

  const fetchUsage = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.rpc('get_user_weekly_usage', {
        user_id: user.id
      });

      if (error) throw error;
      
      if (data && data.length > 0) {
        setUsage(data[0]);
      }
    } catch (error) {
      console.error('Error fetching usage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const incrementUsage = async (type: 'routines' | 'nutrition_photos' | 'ai_chat_messages') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase.rpc('increment_usage_counter', {
        user_id: user.id,
        counter_type: type,
        increment_by: 1
      });

      if (error) throw error;

      // Refetch usage after increment
      await fetchUsage();
      return true;
    } catch (error) {
      console.error('Error incrementing usage:', error);
      return false;
    }
  };

  const checkLimit = async (
    type: 'routines' | 'nutrition_photos' | 'ai_chat_messages',
    isPremium: boolean
  ): Promise<LimitCheck> => {
    const limits = {
      routines: 4,
      nutrition_photos: 10,
      ai_chat_messages: 5
    };

    if (isPremium) {
      return {
        canProceed: true,
        currentUsage: 0,
        limit: -1, // Unlimited
        isOverLimit: false
      };
    }

    if (!usage) {
      await fetchUsage();
    }

    const currentUsage = usage ? usage[`${type}_used`] || 0 : 0;
    const limit = limits[type];
    const isOverLimit = currentUsage >= limit;

    return {
      canProceed: !isOverLimit,
      currentUsage,
      limit,
      isOverLimit
    };
  };

  const checkRoutineLimit = (isPremium: boolean): LimitCheck => {
    if (isPremium) {
      return {
        canProceed: true,
        currentUsage: 0,
        limit: -1,
        isOverLimit: false
      };
    }

    const currentUsage = usage?.routines_created || 0;
    const limit = 4;
    const isOverLimit = currentUsage >= limit;

    return {
      canProceed: !isOverLimit,
      currentUsage,
      limit,
      isOverLimit
    };
  };

  const checkNutritionLimit = (isPremium: boolean): LimitCheck => {
    if (isPremium) {
      return {
        canProceed: true,
        currentUsage: 0,
        limit: -1,
        isOverLimit: false
      };
    }

    const currentUsage = usage?.nutrition_photos_used || 0;
    const limit = 10;
    const isOverLimit = currentUsage >= limit;

    return {
      canProceed: !isOverLimit,
      currentUsage,
      limit,
      isOverLimit
    };
  };

  const checkAIChatLimit = (isPremium: boolean): LimitCheck => {
    if (isPremium) {
      return {
        canProceed: true,
        currentUsage: 0,
        limit: -1,
        isOverLimit: false
      };
    }

    const currentUsage = usage?.ai_chat_messages_used || 0;
    const limit = 5;
    const isOverLimit = currentUsage >= limit;

    return {
      canProceed: !isOverLimit,
      currentUsage,
      limit,
      isOverLimit
    };
  };

  const showLimitReachedToast = (type: 'routines' | 'nutrition_photos' | 'ai_chat_messages') => {
    const messages = {
      routines: 'Has alcanzado el límite de 4 rutinas. Actualiza a Premium para crear rutinas ilimitadas.',
      nutrition_photos: 'Has usado tus 10 fotos semanales. Actualiza a Premium para fotos ilimitadas.',
      ai_chat_messages: 'Has usado tus 5 mensajes semanales de IA. Actualiza a Premium para mensajes ilimitados.'
    };

    toast({
      title: "Límite alcanzado",
      description: messages[type],
      variant: "destructive"
    });
  };

  return {
    usage,
    isLoading,
    fetchUsage,
    incrementUsage,
    checkLimit,
    checkRoutineLimit,
    checkNutritionLimit,
    checkAIChatLimit,
    showLimitReachedToast
  };
};
