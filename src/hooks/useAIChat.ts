
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfileContext } from '@/contexts/ProfileContext';
import { useHomePageData } from '@/hooks/useHomePageData';
import { useRoutines } from '@/hooks/useRoutines';
import { useFoodLog } from '@/hooks/useFoodLog';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export const useAIChat = () => {
  const { user } = useAuth();
  const { profile } = useProfileContext();
  const { macros } = useHomePageData();
  const { routines } = useRoutines();
  const { entries } = useFoodLog();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Filter today's food entries
  const todayEntries = entries.filter(entry => {
    const today = new Date().toISOString().split('T')[0];
    const entryDate = new Date(entry.log_date).toISOString().split('T')[0];
    return entryDate === today;
  });

  const collectUserData = () => {
    // Calculate age from date of birth
    const getAge = () => {
      if (!profile?.date_of_birth) return null;
      const today = new Date();
      const birthDate = new Date(profile.date_of_birth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    };

    return {
      user: {
        id: user?.id,
        email: user?.email,
        name: profile?.full_name || profile?.username,
      },
      profile: {
        weight_kg: profile?.current_weight_kg,
        height_cm: profile?.height_cm,
        age: getAge(),
        gender: profile?.gender,
        body_fat_percentage: profile?.body_fat_percentage,
        main_goal: profile?.main_goal,
        target_weight_kg: profile?.target_weight_kg,
        target_pace: profile?.target_pace,
        target_kg_per_week: profile?.target_kg_per_week,
        trainings_per_week: profile?.trainings_per_week,
        previous_app_experience: profile?.previous_app_experience,
      },
      nutrition: {
        daily_targets: {
          calories: macros.calories.target,
          protein_g: macros.protein.target,
          carbs_g: macros.carbs.target,
          fats_g: macros.fats.target,
        },
        today_consumed: {
          calories: macros.calories.current,
          protein_g: macros.protein.current,
          carbs_g: macros.carbs.current,
          fats_g: macros.fats.current,
        },
        food_entries_today: todayEntries?.map(entry => ({
          food_name: entry.custom_food_name,
          portion_size: entry.quantity_consumed,
          calories: entry.calories_consumed,
          protein_g: entry.protein_g_consumed,
          carbs_g: entry.carbs_g_consumed,
          fat_g: entry.fat_g_consumed,
          meal_type: entry.meal_type,
        })) || [],
      },
      routines: routines.map(routine => ({
        id: routine.id,
        name: routine.name,
        type: routine.type,
        description: routine.description,
        estimated_duration_minutes: routine.estimated_duration_minutes,
        exercise_count: routine.exercise_count,
      })),
      chat_history: messages.map(msg => ({
        type: msg.type,
        content: msg.content,
        timestamp: msg.timestamp,
      })),
    };
  };

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const userData = collectUserData();
      const payload = {
        message: content.trim(),
        user_data: userData,
      };

      console.log('Sending AI chat request:', payload);

      const response = await fetch('https://gaton8n.gatofit.com/webhook-test/5ad29227-88fb-46ab-bff9-c44cb4e1d957', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.text();
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: responseData || 'Lo siento, no pude procesar tu mensaje.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message to AI:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Lo siento, hubo un error al procesar tu mensaje. Inténtalo de nuevo.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const openChat = () => setIsOpen(true);
  const closeChat = () => setIsOpen(false);

  return {
    messages,
    isLoading,
    isOpen,
    sendMessage,
    clearMessages,
    openChat,
    closeChat,
  };
};
