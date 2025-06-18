
import React, { useEffect } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface AIMessageInputProps {
  inputValue: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
}

const AIMessageInput: React.FC<AIMessageInputProps> = ({
  inputValue,
  onInputChange,
  onSend,
  isLoading,
  textareaRef,
}) => {
  useEffect(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      
      const lineHeight = 24;
      const maxLines = 6;
      const maxHeight = lineHeight * maxLines;
      
      const scrollHeight = textarea.scrollHeight;
      const newHeight = Math.min(scrollHeight, maxHeight);
      
      textarea.style.height = `${newHeight}px`;
    }
  }, [inputValue, textareaRef]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    // Permitir Shift+Enter para nueva línea, Enter solo para enviar
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="w-full bg-background rounded-2xl border border-white/10 shadow-lg focus-within:ring-2 focus-within:ring-ring transition-all duration-200">
      <div className="p-2 flex gap-2 items-end">
        <Textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Escribe tu mensaje..."
          disabled={isLoading}
          className="flex-1 min-h-[24px] max-h-[144px] resize-none text-base leading-6 bg-transparent border-none p-2 focus-visible:ring-0 focus-visible:ring-offset-0 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
          rows={1}
        />
        <Button
          onClick={onSend}
          disabled={!inputValue.trim() || isLoading}
          size="icon"
          className="h-9 w-9 flex-shrink-0 bg-primary hover:bg-primary/90 rounded-lg transition-all duration-200 active:scale-95"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default AIMessageInput;
