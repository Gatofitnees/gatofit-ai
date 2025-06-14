
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
  buttons?: string[];
}

interface WebhookResponse {
  output: {
    text: string;
    button?: string;
  };
}

export const useAIChat = () => {
  const { user } = useAuth();
  const { profile } = useProfileContext();
  const { macros } = useHomePageData();
  const { routines } = useRoutines();
  const { entries } = useFoodLog();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

      console.log('🔍 [AI CHAT DEBUG] Enviando petición al webhook:', payload);
      console.log('🔍 [AI CHAT DEBUG] URL del webhook:', 'https://gaton8n.gatofit.com/webhook/5ad29227-88fb-46ab-bff9-c44cb4e1d957');

      const requestStart = Date.now();
      
      const response = await fetch('https://gaton8n.gatofit.com/webhook/5ad29227-88fb-46ab-bff9-c44cb4e1d957', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const requestDuration = Date.now() - requestStart;
      console.log(`🔍 [AI CHAT DEBUG] Respuesta recibida en ${requestDuration}ms`);
      console.log('🔍 [AI CHAT DEBUG] Status de respuesta:', response.status);
      console.log('🔍 [AI CHAT DEBUG] Headers de respuesta:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        console.error('❌ [AI CHAT ERROR] HTTP error:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }

      // Check content type
      const contentType = response.headers.get('content-type');
      console.log('🔍 [AI CHAT DEBUG] Content-Type:', contentType);

      const responseText = await response.text();
      console.log('🔍 [AI CHAT DEBUG] Respuesta raw del webhook:', responseText);
      console.log('🔍 [AI CHAT DEBUG] Longitud de respuesta:', responseText.length);

      if (!responseText || responseText.trim() === '') {
        console.error('❌ [AI CHAT ERROR] Respuesta vacía del webhook');
        throw new Error('El webhook devolvió una respuesta vacía');
      }

      let parsedResponse: WebhookResponse[] | any;
      
      try {
        parsedResponse = JSON.parse(responseText);
        console.log('🔍 [AI CHAT DEBUG] Respuesta parseada:', parsedResponse);
        console.log('🔍 [AI CHAT DEBUG] Tipo de respuesta:', typeof parsedResponse, Array.isArray(parsedResponse) ? 'Array' : 'Object');
      } catch (parseError) {
        console.error('❌ [AI CHAT ERROR] Error parseando JSON:', parseError);
        console.log('🔍 [AI CHAT DEBUG] Intentando usar respuesta como texto plano');
        
        // Fallback to treating as plain text
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: responseText || 'Lo siento, no pude procesar tu mensaje.',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
        return;
      }

      // Handle new JSON format (array)
      if (Array.isArray(parsedResponse)) {
        console.log('🔍 [AI CHAT DEBUG] Procesando respuesta como array, longitud:', parsedResponse.length);
        
        if (parsedResponse.length === 0) {
          console.error('❌ [AI CHAT ERROR] Array de respuesta vacío');
          throw new Error('El webhook devolvió un array vacío');
        }

        const firstResponse = parsedResponse[0];
        console.log('🔍 [AI CHAT DEBUG] Primer elemento del array:', firstResponse);
        
        if (firstResponse && firstResponse.output) {
          console.log('🔍 [AI CHAT DEBUG] Output encontrado:', firstResponse.output);
          
          const aiMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            type: 'ai',
            content: firstResponse.output.text || 'No se recibió texto en la respuesta.',
            timestamp: new Date(),
            buttons: firstResponse.output.button ? [firstResponse.output.button] : undefined,
          };
          
          console.log('✅ [AI CHAT SUCCESS] Mensaje AI creado:', aiMessage);
          setMessages(prev => [...prev, aiMessage]);
        } else {
          console.error('❌ [AI CHAT ERROR] Estructura de respuesta inválida - falta output');
          throw new Error('Estructura de respuesta inválida - falta el campo output');
        }
      } else if (typeof parsedResponse === 'object' && parsedResponse !== null) {
        console.log('🔍 [AI CHAT DEBUG] Procesando respuesta como objeto');
        
        // Check for direct output field
        if (parsedResponse.output) {
          console.log('🔍 [AI CHAT DEBUG] Output directo encontrado:', parsedResponse.output);
          
          const aiMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            type: 'ai',
            content: parsedResponse.output.text || 'No se recibió texto en la respuesta.',
            timestamp: new Date(),
            buttons: parsedResponse.output.button ? [parsedResponse.output.button] : undefined,
          };
          
          console.log('✅ [AI CHAT SUCCESS] Mensaje AI creado desde objeto:', aiMessage);
          setMessages(prev => [...prev, aiMessage]);
        } else if (parsedResponse.text) {
          // Direct text field
          console.log('🔍 [AI CHAT DEBUG] Campo text directo encontrado:', parsedResponse.text);
          
          const aiMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            type: 'ai',
            content: parsedResponse.text,
            timestamp: new Date(),
          };
          
          console.log('✅ [AI CHAT SUCCESS] Mensaje AI creado desde text directo:', aiMessage);
          setMessages(prev => [...prev, aiMessage]);
        } else {
          console.error('❌ [AI CHAT ERROR] Objeto de respuesta sin campos reconocidos:', Object.keys(parsedResponse));
          // Fallback: try to use the whole object as text
          const aiMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            type: 'ai',
            content: JSON.stringify(parsedResponse),
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, aiMessage]);
        }
      } else {
        console.error('❌ [AI CHAT ERROR] Tipo de respuesta no reconocido:', typeof parsedResponse);
        // Fallback to string representation
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: String(parsedResponse) || 'Lo siento, no pude procesar tu mensaje.',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('❌ [AI CHAT ERROR] Error completo:', error);
      console.error('❌ [AI CHAT ERROR] Tipo de error:', error instanceof Error ? error.constructor.name : typeof error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('❌ [AI CHAT ERROR] Error de red - problema de conectividad');
      }
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}. Por favor, inténtalo de nuevo.`,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      console.log('🔍 [AI CHAT DEBUG] Proceso completado, isLoading = false');
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
  };
};
