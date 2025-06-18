
import { useState, useEffect, useRef } from 'react';
import { useAIChat } from '@/hooks/ai-chat';
import { useSubscription } from '@/hooks/useSubscription';
import { useUsageLimits } from '@/hooks/useUsageLimits';

export const useAIChatWithLimits = () => {
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [messagesSentInSession, setMessagesSentInSession] = useState(0);
  const aiChatHook = useAIChat();
  const { isPremium } = useSubscription();
  const { incrementUsage, checkAIChatLimit, showLimitReachedToast } = useUsageLimits();
  const sessionInitialized = useRef(false);

  // Inicializar sesión al montar el componente
  useEffect(() => {
    const sessionKey = `ai-chat-session-${new Date().toDateString()}`;
    const hasActiveSession = localStorage.getItem(sessionKey) === 'true';
    const messagesCount = parseInt(localStorage.getItem(`ai-chat-messages-${new Date().toDateString()}`) || '0');
    
    setSessionActive(hasActiveSession);
    setMessagesSentInSession(messagesCount);
    sessionInitialized.current = true;

    // Listener para detectar cuando el usuario sale de la página/app
    const handleBeforeUnload = () => {
      if (sessionActive) {
        localStorage.removeItem(sessionKey);
        localStorage.removeItem(`ai-chat-messages-${new Date().toDateString()}`);
        setSessionActive(false);
        setMessagesSentInSession(0);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && sessionActive) {
        // Usuario cambió de pestaña o minimizó, pero no salió completamente
        // No hacer nada aquí, mantener la sesión
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      // Al desmontar el componente (salir del chat), terminar sesión
      if (sessionActive) {
        localStorage.removeItem(sessionKey);
        localStorage.removeItem(`ai-chat-messages-${new Date().toDateString()}`);
      }
    };
  }, [sessionActive]);

  const sendMessageWithLimitCheck = async (message: string) => {
    if (!sessionInitialized.current) return;

    const limitCheck = checkAIChatLimit(isPremium);
    
    // Para usuarios premium, no hay límites
    if (isPremium) {
      aiChatHook.sendMessage(message);
      return;
    }

    // Para usuarios free, verificar si ya alcanzaron el límite
    if (!limitCheck.canProceed) {
      showLimitReachedToast('ai_chat_messages');
      setShowPremiumModal(true);
      return;
    }

    const sessionKey = `ai-chat-session-${new Date().toDateString()}`;
    const messagesKey = `ai-chat-messages-${new Date().toDateString()}`;

    try {
      // Si no hay sesión activa, iniciar una nueva
      if (!sessionActive) {
        // Verificar límite una vez más antes de iniciar sesión
        const finalCheck = checkAIChatLimit(isPremium);
        if (!finalCheck.canProceed) {
          showLimitReachedToast('ai_chat_messages');
          setShowPremiumModal(true);
          return;
        }

        // Iniciar sesión y incrementar contador
        localStorage.setItem(sessionKey, 'true');
        localStorage.setItem(messagesKey, '1');
        setSessionActive(true);
        setMessagesSentInSession(1);
        
        await incrementUsage('ai_chat_messages');
      } else {
        // Sesión ya activa, solo incrementar contador local
        const newCount = messagesSentInSession + 1;
        localStorage.setItem(messagesKey, newCount.toString());
        setMessagesSentInSession(newCount);
      }

      // Enviar mensaje
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
      isOverLimit: limitCheck.isOverLimit,
      sessionActive,
      messagesSentInSession
    };
  };

  return {
    ...aiChatHook,
    sendMessage: sendMessageWithLimitCheck,
    getAIChatUsageInfo,
    showPremiumModal,
    setShowPremiumModal,
    isPremium,
    sessionActive
  };
};
