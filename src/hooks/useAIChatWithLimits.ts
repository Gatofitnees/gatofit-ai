
import { useState, useCallback } from 'react';
import { useAIChat } from '@/hooks/ai-chat/useAIChat';
import { useSubscription } from '@/hooks/useSubscription';
import { useUsageLimits } from '@/hooks/useUsageLimits';

export const useAIChatWithLimits = () => {
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const { isPremium } = useSubscription();
  const { 
    incrementUsage, 
    checkAIChatLimit, 
    showLimitReachedToast,
    usage 
  } = useUsageLimits();
  const { messages, isLoading, sendMessage: originalSendMessage, clearMessages } = useAIChat();

  const sendMessage = useCallback(async (content: string) => {
    console.log('🤖 [AI CHAT WITH LIMITS] Attempting to send message');
    
    // Verificar límite antes de enviar
    const limitCheck = await checkAIChatLimit(isPremium);
    
    if (!limitCheck.canProceed) {
      console.log('🚫 [AI CHAT WITH LIMITS] Limit reached, showing premium modal');
      showLimitReachedToast('ai_chat_messages');
      setShowPremiumModal(true);
      return;
    }

    try {
      // Incrementar uso primero si no es premium
      if (!isPremium) {
        console.log('📈 [AI CHAT WITH LIMITS] Incrementing AI chat usage');
        await incrementUsage('ai_chat_messages');
      }

      // Enviar mensaje
      await originalSendMessage(content);
      console.log('✅ [AI CHAT WITH LIMITS] Message sent successfully');
    } catch (error) {
      console.error('❌ [AI CHAT WITH LIMITS] Error sending message:', error);
    }
  }, [checkAIChatLimit, isPremium, showLimitReachedToast, incrementUsage, originalSendMessage]);

  const getAIChatUsageInfo = useCallback(async () => {
    const limitCheck = await checkAIChatLimit(isPremium);
    return {
      current: limitCheck.currentUsage,
      limit: limitCheck.limit,
      canSend: limitCheck.canProceed,
      isOverLimit: limitCheck.isOverLimit
    };
  }, [checkAIChatLimit, isPremium]);

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    showPremiumModal,
    setShowPremiumModal,
    getAIChatUsageInfo,
    isPremium,
    usage
  };
};
