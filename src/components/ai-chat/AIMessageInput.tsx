
import React from 'react';
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
  return (
    <div className="w-full max-w-md mx-auto bg-background/80 backdrop-blur-sm z-20">
      <div className="p-4 border-t border-muted/30">
        <div className="flex gap-2 items-end bg-input rounded-xl p-2 focus-within:ring-2 focus-within:ring-ring transition-all">
          <Textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyPress={onKeyPress}
            placeholder="Escribe tu mensaje..."
            disabled={isLoading}
            className="flex-1 min-h-[24px] max-h-[144px] resize-none text-sm leading-6 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 hide-scrollbar"
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
    </div>
  );
};

export default AIMessageInput;
