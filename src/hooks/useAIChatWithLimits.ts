
import { useState, useEffect } from 'react';
import { useAIChat } from '@/hooks/ai-chat';
import { useSubscription } from '@/hooks/useSubscription';
import { useUsageLimits } from '@/hooks/useUsageLimits';

export const useAIChatWithLimits = () => {
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const aiChatHook = useAIChat();
  const { isPremium } = useSubscription();
  const { incrementUsage, checkAIChatLimit, showLimitReachedToast, fetchUsage } = useUsageLimits();

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
      console.log('📈 [AI CHAT LIMITS] Incrementando contador de uso');
      const success = await incrementUsage('ai_chat_messages');
      
      if (success) {
        console.log('✅ [AI CHAT LIMITS] Contador incrementado exitosamente');
        // Refrescar datos de uso después de incrementar
        await fetchUsage();
      } else {
        console.error('❌ [AI CHAT LIMITS] Error incrementando contador');
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
