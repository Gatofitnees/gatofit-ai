
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface TimezoneInfo {
  timezoneOffset: number; // in minutes
  timezoneName: string;
}

export const useTimezone = () => {
  const { user } = useAuth();
  const [timezoneInfo, setTimezoneInfo] = useState<TimezoneInfo>({
    timezoneOffset: 0,
    timezoneName: 'UTC'
  });
  const [isLoading, setIsLoading] = useState(false);

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
  const getUserCurrentDate = (userTimezoneOffset?: number): Date => {
    const offset = userTimezoneOffset ?? timezoneInfo.timezoneOffset;
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const userTime = new Date(utc + (offset * 60000));
    
    // Reset to start of day in user's timezone
    userTime.setHours(0, 0, 0, 0);
    return userTime;
  };

  // Get user's current date as YYYY-MM-DD string
  const getUserCurrentDateString = (userTimezoneOffset?: number): string => {
    const offset = userTimezoneOffset ?? timezoneInfo.timezoneOffset;
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const userTime = new Date(utc + (offset * 60000));
    
    return userTime.toISOString().split('T')[0];
  };

  // Convert UTC date to user's timezone
  const convertToUserTimezone = (utcDate: Date, userTimezoneOffset?: number): Date => {
    const offset = userTimezoneOffset ?? timezoneInfo.timezoneOffset;
    const utc = utcDate.getTime();
    return new Date(utc + (offset * 60000));
  };

  // Get current time in user's timezone for logging
  const getUserCurrentDateTime = (userTimezoneOffset?: number): Date => {
    const offset = userTimezoneOffset ?? timezoneInfo.timezoneOffset;
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    return new Date(utc + (offset * 60000));
  };

  // Save timezone info to profile
  const saveTimezoneToProfile = async (timezone: TimezoneInfo) => {
    if (!user) return false;
    
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          timezone_offset: timezone.timezoneOffset,
          timezone_name: timezone.timezoneName
        })
        .eq('id', user.id);

      if (error) throw error;
      
      setTimezoneInfo(timezone);
      console.log('Timezone saved to profile:', timezone);
      return true;
    } catch (error) {
      console.error('Error saving timezone:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Load timezone from profile
  const loadTimezoneFromProfile = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('timezone_offset, timezone_name')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      if (data && data.timezone_offset !== null) {
        setTimezoneInfo({
          timezoneOffset: data.timezone_offset,
          timezoneName: data.timezone_name || 'UTC'
        });
      } else {
        // No timezone saved, use current and save it
        const currentTimezone = getCurrentTimezone();
        await saveTimezoneToProfile(currentTimezone);
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

  // Initialize timezone when user changes
  useEffect(() => {
    if (user) {
      loadTimezoneFromProfile();
    } else {
      // Reset to current timezone when no user
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
    convertToUserTimezone,
    saveTimezoneToProfile,
    loadTimezoneFromProfile
  };
};
