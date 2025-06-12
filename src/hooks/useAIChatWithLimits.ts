
import { useState } from 'react';
import { useAIChat } from '@/hooks/useAIChat';
import { useSubscription } from '@/hooks/useSubscription';
import { useUsageLimits } from '@/hooks/useUsageLimits';

export const useAIChatWithLimits = () => {
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const aiChatHook = useAIChat();
  const { isPremium } = useSubscription();
  const { incrementUsage, checkAIChatLimit, showLimitReachedToast } = useUsageLimits();

  const sendMessageWithLimitCheck = async (message: string) => {
    const limitCheck = checkAIChatLimit(isPremium);
    
    if (!limitCheck.canProceed) {
      showLimitReachedToast('ai_chat_messages');
      setShowPremiumModal(true);
      return;
    }

    try {
      // Call the original sendMessage method (which returns void)
      aiChatHook.sendMessage(message);
      
      if (!isPremium) {
        // Increment usage counter for free users
        await incrementUsage('ai_chat_messages');
      }
    } catch (error) {
      console.error('Error sending AI message:', error);
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
