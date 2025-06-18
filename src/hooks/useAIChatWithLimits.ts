
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

  // Check if we've already incremented today
  useEffect(() => {
    const today = new Date().toDateString();
    const lastIncrementDate = localStorage.getItem('ai-chat-last-increment');
    setHasIncrementedToday(lastIncrementDate === today);
  }, []);

  const sendMessageWithLimitCheck = async (message: string) => {
    const limitCheck = checkAIChatLimit(isPremium);
    
    // For premium users, no limits
    if (isPremium) {
      aiChatHook.sendMessage(message);
      return;
    }

    // For free users, check if they can send a message
    if (!limitCheck.canProceed) {
      showLimitReachedToast('ai_chat_messages');
      setShowPremiumModal(true);
      return;
    }

    try {
      // If this is the first message today, increment usage
      if (!hasIncrementedToday) {
        await incrementUsage('ai_chat_messages');
        
        // Mark that we've incremented today
        const today = new Date().toDateString();
        localStorage.setItem('ai-chat-last-increment', today);
        setHasIncrementedToday(true);
      }

      // Send the message
      aiChatHook.sendMessage(message);
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
