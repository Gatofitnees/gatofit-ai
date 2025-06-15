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
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const [inputHeight, setInputHeight] = useState(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, inputHeight]);

  // Measure the height of the input container to add padding to the message list
  useEffect(() => {
    const inputEl = inputContainerRef.current;
    if (inputEl) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setInputHeight(entry.target.offsetHeight);
        }
      });
      resizeObserver.observe(inputEl);
      return () => resizeObserver.disconnect();
    }
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      
      const lineHeight = 24; // Tailwind text-sm line height
      const maxLines = 6;
      const maxHeight = lineHeight * maxLines;
      
      const scrollHeight = textarea.scrollHeight;
      const newHeight = Math.min(scrollHeight, maxHeight);
      
      textarea.style.height = `${newHeight}px`;
    }
  }, [inputValue]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    const message = inputValue;
    setInputValue('');
    await sendMessage(message);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleButtonClick = async (buttonText: string) => {
    if (isLoading) return;
    await sendMessage(buttonText);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="h-screen bg-background flex flex-col max-w-md mx-auto overflow-hidden">
      <AIChatHeader 
        onBack={handleBack}
        onClear={clearMessages}
        hasMessages={messages.length > 0}
      />

      <div
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ paddingBottom: `${inputHeight}px` }}
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
      
      <AIMessageInput
        ref={inputContainerRef}
        inputValue={inputValue}
        onInputChange={setInputValue}
        onSend={handleSend}
        isLoading={isLoading}
        textareaRef={textareaRef}
        onKeyPress={handleKeyPress}
      />
    </div>
  );
};

export default AIChatPage;
