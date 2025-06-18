
import React, { useState, useRef, useEffect } from 'react';
import { useAIChat } from '@/hooks/ai-chat';
import { useNavigate } from 'react-router-dom';
import AIChatHeader from '@/components/ai-chat/AIChatHeader';
import AIMessageList from '@/components/ai-chat/AIMessageList';
import AIWelcomeScreen from '@/components/ai-chat/AIWelcomeScreen';
import AIMessageInput from '@/components/ai-chat/AIMessageInput';

const AIChatPage: React.FC = () => {
  const navigate = useNavigate();
  const { messages, isLoading, sendMessage, clearMessages } = useAIChat();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      // Detectar cuando el teclado se abre/cierra en móviles
      const isKeyboardOpen = window.visualViewport && 
        window.visualViewport.height < window.innerHeight * 0.75;
      
      if (chatContentRef.current) {
        if (isKeyboardOpen && window.visualViewport) {
          // Cuando el teclado está abierto, ajustar el contenido
          const keyboardHeight = window.innerHeight - window.visualViewport.height;
          chatContentRef.current.style.paddingBottom = `${keyboardHeight}px`;
        } else {
          // Cuando el teclado se cierra, resetear
          chatContentRef.current.style.paddingBottom = '';
        }
      }
    };

    // Escuchar cambios en el viewport para manejar el teclado virtual
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      return () => {
        window.visualViewport?.removeEventListener('resize', handleResize);
      };
    }
  }, []);

  useEffect(() => {
    // Auto-scroll suave para nuevos mensajes
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    const message = inputValue;
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setInputValue('');
    await sendMessage(message);
  };

  const handleButtonClick = async (buttonText: string) => {
    if (isLoading) return;
    await sendMessage(buttonText);
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="h-[100dvh] bg-background flex flex-col max-w-md mx-auto relative overflow-hidden">
      {/* Header fijo */}
      <div className="flex-shrink-0 z-20">
        <AIChatHeader 
          onBack={handleBack}
          onClear={clearMessages}
          hasMessages={messages.length > 0}
        />
      </div>

      {/* Contenido del chat scrollable */}
      <div
        ref={chatContentRef}
        className="flex-1 overflow-y-auto overscroll-contain relative"
        style={{
          paddingTop: 'var(--safe-area-inset-top, 0px)',
        }}
      >
        <div className="p-4 space-y-4 pb-4">
          {messages.length === 0 ? (
            <AIWelcomeScreen />
          ) : (
            <AIMessageList 
              messages={messages}
              isLoading={isLoading}
              onButtonClick={handleButtonClick}
            />
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input fijo en la parte inferior */}
      <div 
        className="flex-shrink-0 bg-background border-t border-muted/20 z-20"
        style={{ 
          paddingBottom: 'max(0.5rem, var(--safe-area-inset-bottom, 0px))',
          paddingLeft: 'max(0.5rem, var(--safe-area-inset-left, 0px))',
          paddingRight: 'max(0.5rem, var(--safe-area-inset-right, 0px))',
          paddingTop: '0.5rem'
        }}
      >
        <AIMessageInput
          inputValue={inputValue}
          onInputChange={setInputValue}
          onSend={handleSend}
          isLoading={isLoading}
          textareaRef={textareaRef}
        />
      </div>
    </div>
  );
};

export default AIChatPage;
