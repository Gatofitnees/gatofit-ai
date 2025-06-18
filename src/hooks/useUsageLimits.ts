
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
      } else {
        // Create initial usage record if it doesn't exist
        await createInitialUsageRecord(user.id);
        await fetchUsage();
      }
    } catch (error) {
      console.error('Error fetching usage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createInitialUsageRecord = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('usage_limits')
        .insert({
          user_id: userId,
          week_start_date: new Date().toISOString().split('T')[0],
          routines_created: 0,
          nutrition_photos_used: 0,
          ai_chat_messages_used: 0
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error creating initial usage record:', error);
    }
  };

  const incrementUsage = async (type: 'routines' | 'nutrition_photos' | 'ai_chat_messages') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // First ensure usage record exists
      if (!usage) {
        await createInitialUsageRecord(user.id);
        await fetchUsage();
      }

      // Manual increment for better reliability
      const currentUsage = usage || { routines_created: 0, nutrition_photos_used: 0, ai_chat_messages_used: 0 };
      const fieldMap = {
        'routines': 'routines_created',
        'nutrition_photos': 'nutrition_photos_used', 
        'ai_chat_messages': 'ai_chat_messages_used'
      };
      
      const fieldName = fieldMap[type];
      const newValue = (currentUsage[fieldName] || 0) + 1;

      const { error } = await supabase
        .from('usage_limits')
        .upsert({
          user_id: user.id,
          week_start_date: new Date().toISOString().split('T')[0],
          [fieldName]: newValue,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,week_start_date'
        });

      if (error) throw error;

      // Update local state immediately
      setUsage(prev => prev ? {
        ...prev,
        [fieldName]: newValue
      } : null);

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
      routines: 5,
      nutrition_photos: 10,
      ai_chat_messages: 3
    };

    if (isPremium) {
      return {
        canProceed: true,
        currentUsage: 0,
        limit: -1,
        isOverLimit: false
      };
    }

    if (!usage) {
      await fetchUsage();
    }

    const fieldMap = {
      'routines': 'routines_created',
      'nutrition_photos': 'nutrition_photos_used',
      'ai_chat_messages': 'ai_chat_messages_used'
    };

    const currentUsage = usage ? usage[fieldMap[type]] || 0 : 0;
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
    const limit = 5;
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
    const limit = 3;
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
      routines: 'Has alcanzado el límite de 5 rutinas. Actualiza a Premium para crear rutinas ilimitadas.',
      nutrition_photos: 'Has usado tus 10 fotos semanales. Actualiza a Premium para fotos ilimitadas.',
      ai_chat_messages: 'Has usado tus 3 chats semanales de IA. Actualiza a Premium para chats ilimitados.'
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
