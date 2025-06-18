
import { useState, useEffect } from 'react';
import { useAIChat } from '@/hooks/ai-chat';
import { useSubscription } from '@/hooks/useSubscription';
import { useUsageLimits } from '@/hooks/useUsageLimits';

export const useAIChatWithLimits = () => {
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [hasIncrementedToday, setHasIncrementedToday] = useState(false);
  const aiChatHook = useAIChat();
  const { isPremium } = useSubscription();
  const { incrementUsage, checkAIChatLimit, showLimitReachedToast } = useUsageLimits();

  // Verificar si ya se incrementó hoy
  useEffect(() => {
    const today = new Date().toDateString();
    const lastIncrementDate = localStorage.getItem('ai-chat-last-increment');
    setHasIncrementedToday(lastIncrementDate === today);
  }, []);

  const sendMessageWithLimitCheck = async (message: string) => {
    console.log('🔍 [AI CHAT LIMITS] Verificando límites para enviar mensaje');
    
    const limitCheck = checkAIChatLimit(isPremium);
    console.log('🔍 [AI CHAT LIMITS] Resultado verificación:', limitCheck);
    
    // Para usuarios premium, sin límites
    if (isPremium) {
      console.log('✅ [AI CHAT LIMITS] Usuario premium, enviando mensaje sin restricciones');
      aiChatHook.sendMessage(message);
      return;
    }

    // Para usuarios gratuitos, verificar si pueden enviar mensaje
    if (!limitCheck.canProceed) {
      console.log('❌ [AI CHAT LIMITS] Límite alcanzado, mostrando modal premium');
      showLimitReachedToast('ai_chat_messages');
      setShowPremiumModal(true);
      return;
    }

    try {
      console.log('🔍 [AI CHAT LIMITS] hasIncrementedToday:', hasIncrementedToday);
      
      // Si es el primer mensaje hoy, incrementar uso
      if (!hasIncrementedToday) {
        console.log('📈 [AI CHAT LIMITS] Incrementando contador de uso');
        await incrementUsage('ai_chat_messages');
        
        // Marcar que ya se incrementó hoy
        const today = new Date().toDateString();
        localStorage.setItem('ai-chat-last-increment', today);
        setHasIncrementedToday(true);
        console.log('✅ [AI CHAT LIMITS] Contador incrementado y marcado para hoy');
      }

      // Enviar el mensaje
      console.log('📤 [AI CHAT LIMITS] Enviando mensaje');
      aiChatHook.sendMessage(message);
    } catch (error) {
      console.error('❌ [AI CHAT LIMITS] Error enviando mensaje:', error);
    }
  };

  const getAIChatUsageInfo = () => {
    const limitCheck = checkAIChatLimit(isPremium);
    return {
      current: limitCheck.currentUsage,
      limit: limitCheck.limit,
      canSend: limitCheck.canProceed,
      isOverLimit: limitCheck.isOverLimit
    };
  };

  return {
    ...aiChatHook,
    sendMessage: sendMessageWithLimitCheck,
    getAIChatUsageInfo,
    showPremiumModal,
    setShowPremiumModal,
    isPremium
  };
};
