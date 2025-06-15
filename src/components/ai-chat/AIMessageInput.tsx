
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
  onKeyPress: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

const AIMessageInput: React.FC<AIMessageInputProps> = ({
  inputValue,
  onInputChange,
  onSend,
  isLoading,
  textareaRef,
  onKeyPress,
}) => {
  useEffect(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto'; // Reset height
      
      const lineHeight = 24; // Corresponde a leading-6
      const maxLines = 6;
      const maxHeight = lineHeight * maxLines; // Corresponde a max-h-[144px]
      
      const scrollHeight = textarea.scrollHeight;
      const newHeight = Math.min(scrollHeight, maxHeight);
      
      textarea.style.height = `${newHeight}px`;
    }
  }, [inputValue, textareaRef]);

  return (
    <div
      className="w-full bg-background/75 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl focus-within:ring-2 focus-within:ring-ring pointer-events-auto"
    >
      <div 
        className="p-2 flex gap-2 items-end"
      >
        <Textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyPress={onKeyPress}
          placeholder="Escribe tu mensaje..."
          disabled={isLoading}
          className="flex-1 min-h-[24px] max-h-[144px] resize-none text-base leading-6 bg-transparent border-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0 mobile-scrollbar"
          rows={1}
        />
        <Button
          onClick={onSend}
          disabled={!inputValue.trim() || isLoading}
          size="icon"
          className="h-9 w-9 flex-shrink-0 bg-primary hover:bg-primary/90 rounded-lg touch-element"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default AIMessageInput;
