
import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useAIChat } from '@/hooks/ai-chat';
import { useNavigate } from 'react-router-dom';
import { formatAIText } from '@/utils/textFormatter';
import GatofitAvatar from '/photo-1535268647677-300dbf3d78d1.jpeg';

const AIChatPage: React.FC = () => {
  const navigate = useNavigate();
  const { messages, isLoading, sendMessage, clearMessages } = useAIChat();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      
      // Calculate line height (approximate)
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
    
    // Reset textarea height after sending
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleButtonClick = async (buttonText: string) => {
    if (isLoading) return;
    await sendMessage(buttonText);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-muted/30 bg-background sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
            <img src={GatofitAvatar} alt="Gatofit Avatar" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="font-semibold text-lg">Chatea con Gatofit</h1>
            <p className="text-xs text-muted-foreground">Tu asistente personal de fitness</p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearMessages}
            className="text-xs"
          >
            Limpiar
          </Button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-16">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden">
              <img src={GatofitAvatar} alt="Gatofit Avatar" className="w-full h-full object-cover" />
            </div>
            <h2 className="text-lg font-semibold mb-2">¡Hola! Soy Gatofit</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Tu asistente personal de fitness. Pregúntame sobre entrenamientos, nutrición o tus objetivos.
            </p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• "¿Qué ejercicios puedo hacer hoy?"</p>
              <p>• "¿Cuántas proteínas necesito?"</p>
              <p>• "Ayúdame con mi rutina de gym"</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id}>
              <div
                className={cn(
                  "flex",
                  message.type === 'user' ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] p-3 rounded-xl text-sm",
                    message.type === 'user'
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted rounded-bl-sm"
                  )}
                >
                  {message.type === 'ai' ? (
                    <div 
                      className="whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ __html: formatAIText(message.content) }}
                    />
                  ) : (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  )}
                  <p className={cn(
                    "text-xs mt-1 opacity-70",
                    message.type === 'user' ? "text-primary-foreground/70" : "text-muted-foreground"
                  )}>
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
              
              {/* Interactive buttons for AI messages */}
              {message.type === 'ai' && message.buttons && message.buttons.length > 0 && (
                <div className="flex justify-start mt-2">
                  <div className="max-w-[85%] flex flex-wrap gap-2">
                    {message.buttons.map((buttonText, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleButtonClick(buttonText)}
                        disabled={isLoading}
                        className="text-xs bg-background hover:bg-muted flex-shrink-0"
                      >
                        {buttonText}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted p-3 rounded-xl rounded-bl-sm max-w-[85%]">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Pensando...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-muted/30 bg-background">
        <div className="flex gap-2 items-end">
          <Textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe tu mensaje..."
            disabled={isLoading}
            className="flex-1 min-h-[40px] max-h-[144px] resize-none overflow-y-auto text-sm leading-6"
            rows={1}
          />
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            size="sm"
            className="px-3 h-10 flex-shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIChatPage;
