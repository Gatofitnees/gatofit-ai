
import React, { useState, useRef, useEffect } from 'react';
import { useAIChat } from '@/hooks/ai-chat';
import { useNavigate } from 'react-router-dom';
import AIChatHeader from '@/components/ai-chat/AIChatHeader';
import AIMessageList from '@/components/ai-chat/AIMessageList';
import AIWelcomeScreen from '@/components/ai-chat/AIWelcomeScreen';
import AIMessageInput from '@/components/ai-chat/AIMessageInput';
import { useVirtualKeyboard } from '@/hooks/useVirtualKeyboard';

const AIChatPage: React.FC = () => {
  const navigate = useNavigate();
  const { messages, isLoading, sendMessage, clearMessages } = useAIChat();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputWrapperRef = useRef<HTMLDivElement>(null);
  const [inputWrapperHeight, setInputWrapperHeight] = useState(0);
  const keyboardHeight = useVirtualKeyboard();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    }, 150);
    return () => clearTimeout(timer);
  }, [keyboardHeight, inputWrapperHeight]);

  // Medimos la altura del contenedor del input para añadir el padding de scroll.
  useEffect(() => {
    const inputEl = inputWrapperRef.current;
    if (inputEl) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setInputWrapperHeight(entry.target.getBoundingClientRect().height);
        }
      });
      resizeObserver.observe(inputEl);
      return () => resizeObserver.disconnect();
    }
  }, []);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    const message = inputValue;
    setInputValue('');
    await sendMessage(message);
  };

  const handleButtonClick = async (buttonText: string) => {
    if (isLoading) return;
    await sendMessage(buttonText);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { // Se envía con Enter, nueva línea con Shift+Enter
      e.preventDefault();
      handleSend();
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="h-[100dvh] bg-background flex flex-col max-w-md mx-auto overflow-hidden">
      <AIChatHeader 
        onBack={handleBack}
        onClear={clearMessages}
        hasMessages={messages.length > 0}
      />

      <div
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ scrollPaddingBottom: `${inputWrapperHeight}px` }}
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
      
      {/* Contenedor fijo para el input flotante */}
      <div
        ref={inputWrapperRef}
        className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-20 p-3 pointer-events-none"
        style={{ 
          bottom: `${keyboardHeight}px`,
          transition: 'bottom 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
      >
        <AIMessageInput
          inputValue={inputValue}
          onInputChange={setInputValue}
          onSend={handleSend}
          isLoading={isLoading}
          textareaRef={textareaRef}
          onKeyPress={handleKeyPress}
        />
      </div>
    </div>
  );
};

export default AIChatPage;
