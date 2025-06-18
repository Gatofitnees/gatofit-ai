
import { useState, useEffect } from 'react';
import { useAIChat } from '@/hooks/ai-chat';
import { useSubscription } from '@/hooks/useSubscription';
import { useUsageLimits } from '@/hooks/useUsageLimits';

export const useAIChatWithLimits = () => {
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const aiChatHook = useAIChat();
  const { isPremium } = useSubscription();
  const { incrementUsage, checkAIChatLimit, showLimitReachedToast } = useUsageLimits();

  // Check session status on mount
  useEffect(() => {
    const sessionKey = `ai-chat-session-${new Date().toDateString()}`;
    const hasActiveSession = localStorage.getItem(sessionKey) === 'true';
    setSessionActive(hasActiveSession);
  }, []);

  // Clean up session when component unmounts (user leaves chat)
  useEffect(() => {
    return () => {
      if (sessionActive) {
        const sessionKey = `ai-chat-session-${new Date().toDateString()}`;
        localStorage.removeItem(sessionKey);
        setSessionActive(false);
      }
    };
  }, [sessionActive]);

  const sendMessageWithLimitCheck = async (message: string) => {
    const limitCheck = checkAIChatLimit(isPremium);
    
    // If user is free and already at limit, block
    if (!limitCheck.canProceed) {
      showLimitReachedToast('ai_chat_messages');
      setShowPremiumModal(true);
      return;
    }

    // If this is the first message of a new session for free users
    if (!isPremium && !sessionActive) {
      const sessionKey = `ai-chat-session-${new Date().toDateString()}`;
      
      // Check limit again before starting session
      const finalCheck = checkAIChatLimit(isPremium);
      if (!finalCheck.canProceed) {
        showLimitReachedToast('ai_chat_messages');
        setShowPremiumModal(true);
        return;
      }

      // Mark session as active and increment counter
      localStorage.setItem(sessionKey, 'true');
      setSessionActive(true);
      await incrementUsage('ai_chat_messages');
    }

    try {
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
