import { useState, useEffect, useCallback, useRef } from 'react';
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

/**
 * Optimized version of useUsageLimits that prevents duplicate calls
 * and reduces database queries.
 */
export const useOptimizedUsageLimits = () => {
  const [usage, setUsage] = useState<UsageLimits | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Prevent duplicate calls
  const fetchingRef = useRef(false);
  const lastFetchTime = useRef<number>(0);
  
  const fetchUsage = useCallback(async (forceRefresh = false) => {
    // Prevent duplicate calls within 1 second
    const now = Date.now();
    if (!forceRefresh && (fetchingRef.current || (now - lastFetchTime.current) < 1000)) {
      return;
    }

    try {
      fetchingRef.current = true;
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.rpc('get_user_weekly_usage', {
        user_id: user.id
      });

      if (error) {
        console.error('Error fetching usage:', error);
        throw error;
      }

      if (data && data.length > 0) {
        setUsage(data[0]);
      } else {
        // Create initial record only if needed
        await createInitialUsageRecord(user.id);
        // Set default empty usage instead of recursive call
        setUsage({
          routines_created: 0,
          nutrition_photos_used: 0,
          ai_chat_messages_used: 0,
          week_start_date: getWeekStartDate()
        });
      }
      
      lastFetchTime.current = now;
    } catch (error) {
      console.error('Error fetching usage:', error);
    } finally {
      setIsLoading(false);
      fetchingRef.current = false;
    }
  }, []);

  const getWeekStartDate = () => {
    const weekStart = new Date();
    const dayOfWeek = weekStart.getDay();
    const diff = weekStart.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    weekStart.setDate(diff);
    return weekStart.toISOString().split('T')[0];
  };

  const createInitialUsageRecord = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('usage_limits')
        .insert({
          user_id: userId,
          week_start_date: getWeekStartDate(),
          routines_created: 0,
          nutrition_photos_used: 0,
          ai_chat_messages_used: 0
        });

      if (error) {
        console.error('Error creating initial usage record:', error);
      }
    } catch (error) {
      console.error('Error creating initial usage record:', error);
    }
  };

  const incrementUsage = useCallback(async (type: 'routines' | 'nutrition_photos' | 'ai_chat_messages') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { error } = await supabase.rpc('increment_usage_counter', {
        p_user_id: user.id,
        counter_type: type,
        increment_by: 1
      });

      if (error) {
        console.error('Error incrementing usage:', error);
        throw error;
      }

      // Update local state immediately for better UX
      if (usage) {
        const fieldMap = {
          'routines': 'routines_created',
          'nutrition_photos': 'nutrition_photos_used',
          'ai_chat_messages': 'ai_chat_messages_used'
        };
        
        setUsage(prev => prev ? {
          ...prev,
          [fieldMap[type]]: prev[fieldMap[type]] + 1
        } as UsageLimits : null);
      }
      
      // Refresh data from server (debounced)
      setTimeout(() => fetchUsage(true), 500);
      
      return true;
    } catch (error) {
      console.error('Error incrementing usage:', error);
      return false;
    }
  }, [usage, fetchUsage]);

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