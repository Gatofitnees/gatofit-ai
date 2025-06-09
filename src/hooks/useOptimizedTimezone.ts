
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface TimezoneInfo {
  timezoneOffset: number; // in minutes
  timezoneName: string;
}

export const useOptimizedTimezone = () => {
  const { user } = useAuth();
  const [timezoneInfo, setTimezoneInfo] = useState<TimezoneInfo>({
    timezoneOffset: -new Date().getTimezoneOffset(),
    timezoneName: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
  const [isLoading, setIsLoading] = useState(false);
  const initializationRef = useRef(false);

  // Get user's current timezone info
  const getCurrentTimezone = (): TimezoneInfo => {
    const now = new Date();
    const timezoneOffset = -now.getTimezoneOffset(); // Convert to positive for east of UTC
    const timezoneName = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    return {
      timezoneOffset,
      timezoneName
    };
  };

  // Get user's current date based on their timezone (always returns today for the user)
  const getUserCurrentDate = (): Date => {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const userTime = new Date(utc + (timezoneInfo.timezoneOffset * 60000));
    
    // Reset to start of day in user's timezone
    userTime.setHours(0, 0, 0, 0);
    return userTime;
  };

  // Get user's current date as YYYY-MM-DD string
  const getUserCurrentDateString = (): string => {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const userTime = new Date(utc + (timezoneInfo.timezoneOffset * 60000));
    
    return userTime.toISOString().split('T')[0];
  };

  // Convert UTC date to user's timezone
  const convertToUserTimezone = (utcDate: Date): Date => {
    const utc = utcDate.getTime();
    return new Date(utc + (timezoneInfo.timezoneOffset * 60000));
  };

  // Get current time in user's timezone for logging
  const getUserCurrentDateTime = (): Date => {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    return new Date(utc + (timezoneInfo.timezoneOffset * 60000));
  };

  // Load timezone from profile (optimized to run only once)
  const loadTimezoneFromProfile = async () => {
    if (!user || initializationRef.current) return;
    
    try {
      setIsLoading(true);
      initializationRef.current = true;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('timezone_offset, timezone_name')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      if (data && data.timezone_offset !== null) {
        const profileTimezone = {
          timezoneOffset: data.timezone_offset,
          timezoneName: data.timezone_name || 'UTC'
        };
        setTimezoneInfo(profileTimezone);
      } else {
        // Save current timezone to profile silently
        const currentTimezone = getCurrentTimezone();
        setTimezoneInfo(currentTimezone);
        
        // Save to profile without waiting - properly handle the Promise
        try {
          await supabase
            .from('profiles')
            .update({
              timezone_offset: currentTimezone.timezoneOffset,
              timezone_name: currentTimezone.timezoneName
            })
            .eq('id', user.id);
        } catch (saveError) {
          console.error('Error saving timezone:', saveError);
        }
      }
    } catch (error) {
      console.error('Error loading timezone:', error);
      // Fallback to current timezone
      const currentTimezone = getCurrentTimezone();
      setTimezoneInfo(currentTimezone);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize timezone when user changes (only once)
  useEffect(() => {
    if (user && !initializationRef.current) {
      loadTimezoneFromProfile();
    } else if (!user) {
      // Reset when user logs out
      initializationRef.current = false;
      const currentTimezone = getCurrentTimezone();
      setTimezoneInfo(currentTimezone);
    }
  }, [user]);

  return {
    timezoneInfo,
    isLoading,
    getCurrentTimezone,
    getUserCurrentDate,
    getUserCurrentDateString,
    getUserCurrentDateTime,
    convertToUserTimezone
  };
};
