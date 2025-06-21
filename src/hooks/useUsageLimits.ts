
import { useState, useEffect, useCallback } from 'react';
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

  const fetchUsage = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log('🔍 [USAGE LIMITS] Fetching usage for user:', user.id);

      const { data, error } = await supabase.rpc('get_user_weekly_usage', {
        user_id: user.id
      });

      if (error) {
        console.error('❌ [USAGE LIMITS] Error fetching usage:', error);
        throw error;
      }
      
      console.log('📊 [USAGE LIMITS] Raw usage data:', data);

      if (data && data.length > 0) {
        setUsage(data[0]);
        console.log('✅ [USAGE LIMITS] Usage set:', data[0]);
      } else {
        await createInitialUsageRecord(user.id);
        // Recursive call after creating initial record
        setTimeout(() => fetchUsage(), 100);
      }
    } catch (error) {
      console.error('❌ [USAGE LIMITS] Error fetching usage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createInitialUsageRecord = async (userId: string) => {
    try {
      const weekStart = new Date();
      const dayOfWeek = weekStart.getDay();
      const diff = weekStart.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      weekStart.setDate(diff);
      
      console.log('📅 [USAGE LIMITS] Creating initial record for week start:', weekStart.toISOString().split('T')[0]);
      
      const { error } = await supabase
        .from('usage_limits')
        .insert({
          user_id: userId,
          week_start_date: weekStart.toISOString().split('T')[0],
          routines_created: 0,
          nutrition_photos_used: 0,
          ai_chat_messages_used: 0
        });

      if (error) {
        console.error('❌ [USAGE LIMITS] Error creating initial usage record:', error);
        throw error;
      }
      
      console.log('✅ [USAGE LIMITS] Initial usage record created');
    } catch (error) {
      console.error('❌ [USAGE LIMITS] Error creating initial usage record:', error);
    }
  };

  const incrementUsage = useCallback(async (type: 'routines' | 'nutrition_photos' | 'ai_chat_messages') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      console.log(`📈 [USAGE LIMITS] Incrementing ${type} for user:`, user.id);

      // Incrementar en base de datos
      const { data, error } = await supabase.rpc('increment_usage_counter', {
        p_user_id: user.id,
        counter_type: type,
        increment_by: 1
      });

      if (error) {
        console.error('❌ [USAGE LIMITS] Error incrementing usage:', error);
        throw error;
      }

      console.log('✅ [USAGE LIMITS] Usage incremented successfully in DB:', data);
      
      // Refetch inmediato para sincronizar estado
      await fetchUsage();
      
      return true;
    } catch (error) {
      console.error('❌ [USAGE LIMITS] Error incrementing usage:', error);
      return false;
    }
  }, [fetchUsage]);

  const checkLimitWithoutFetch = useCallback((
    type: 'routines' | 'nutrition_photos' | 'ai_chat_messages',
    isPremium: boolean
  ): LimitCheck => {
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

    const fieldMap = {
      'routines': 'routines_created',
      'nutrition_photos': 'nutrition_photos_used',
      'ai_chat_messages': 'ai_chat_messages_used'
    };

    const currentUsage = usage ? usage[fieldMap[type]] || 0 : 0;
    const limit = limits[type];
    const isOverLimit = currentUsage >= limit;

    console.log(`🔍 [USAGE LIMITS] Check limit for ${type}:`, {
      currentUsage,
      limit,
      isOverLimit,
      canProceed: !isOverLimit,
      hasUsageData: !!usage
    });

    return {
      canProceed: !isOverLimit,
      currentUsage,
      limit,
      isOverLimit
    };
  }, [usage]);

  const checkRoutineLimit = useCallback(async (isPremium: boolean): Promise<LimitCheck> => {
    return checkLimitWithoutFetch('routines', isPremium);
  }, [checkLimitWithoutFetch]);

  const checkNutritionLimit = useCallback(async (isPremium: boolean): Promise<LimitCheck> => {
    return checkLimitWithoutFetch('nutrition_photos', isPremium);
  }, [checkLimitWithoutFetch]);

  const checkAIChatLimit = useCallback(async (isPremium: boolean): Promise<LimitCheck> => {
    return checkLimitWithoutFetch('ai_chat_messages', isPremium);
  }, [checkLimitWithoutFetch]);

  const showLimitReachedToast = useCallback((type: 'routines' | 'nutrition_photos' | 'ai_chat_messages') => {
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
  }, [toast]);

  // Fetch inicial solo una vez
  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  return {
    usage,
    isLoading,
    fetchUsage,
    incrementUsage,
    checkRoutineLimit,
    checkNutritionLimit,
    checkAIChatLimit,
    checkLimitWithoutFetch,
    showLimitReachedToast
  };
};
