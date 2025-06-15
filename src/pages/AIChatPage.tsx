
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
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const visualViewport = window.visualViewport;
    // Este polyfill es para navegadores más antiguos o entornos donde visualViewport no está disponible
    if (!visualViewport) return;

    const handleResize = () => {
      if (pageRef.current) {
        // Un chequeo simple para ver si el teclado está abierto.
        // Asumimos que está abierto si la altura del viewport es significantemente menor que la de la ventana.
        const isKeyboardOpen = window.innerHeight > visualViewport.height + 100;

        if (isKeyboardOpen) {
          // Cuando el teclado está abierto, ajustamos la altura al área visible.
          pageRef.current.style.height = `${visualViewport.height}px`;
        } else {
          // Cuando el teclado se cierra, eliminamos el estilo en línea para que se aplique la clase de CSS.
          pageRef.current.style.height = '';
        }
      }
    };

    visualViewport.addEventListener('resize', handleResize);
    handleResize(); // Llamada inicial para establecer el tamaño correcto

    return () => {
      visualViewport.removeEventListener('resize', handleResize);
    };
  }, []);

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
      ref={pageRef}
      className="h-[100dvh] bg-background flex flex-col max-w-md mx-auto overflow-hidden"
    >
      <AIChatHeader 
        onBack={handleBack}
        onClear={clearMessages}
        hasMessages={messages.length > 0}
      />

      <div
        className="flex-1 overflow-y-auto p-4 space-y-4 overscroll-contain"
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
      
      {/* El contenedor del input es ahora parte del flujo natural, pegado abajo */}
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
  );
};

export default AIChatPage;
