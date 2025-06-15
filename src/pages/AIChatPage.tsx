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
  const [inputContainerHeight, setInputContainerHeight] = useState(0);
  const inputContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const inputEl = inputContainerRef.current;
    if (inputEl) {
      const resizeObserver = new ResizeObserver(() => {
        if (inputEl.offsetHeight !== inputContainerHeight) {
          setInputContainerHeight(inputEl.offsetHeight);
        }
      });
      resizeObserver.observe(inputEl);
      
      // Set initial height to avoid jump
      if (inputEl.offsetHeight > 0) {
        setInputContainerHeight(inputEl.offsetHeight);
      }

      return () => resizeObserver.disconnect();
    }
  }, [inputContainerHeight]);

  useEffect(() => {
    // Scroll suave para nuevos mensajes, para que se vea la animación
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    const message = inputValue;
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'; // Resetea la altura al enviar
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
    <div
      className="h-[100dvh] bg-background flex flex-col max-w-md mx-auto relative overflow-hidden"
    >
      <AIChatHeader 
        onBack={handleBack}
        onClear={clearMessages}
        hasMessages={messages.length > 0}
      />

      <div
        className="flex-1 overflow-y-auto p-4 space-y-4 overscroll-contain"
        style={{ paddingBottom: inputContainerHeight ? `${inputContainerHeight}px` : '70px' }}
      >
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
      
      <div 
        ref={inputContainerRef}
        className="absolute bottom-0 left-0 right-0 bg-background"
      >
        <div 
          className="p-2 border-t border-muted/20"
          style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom))' }}
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
    </div>
  );
};

export default AIChatPage;
