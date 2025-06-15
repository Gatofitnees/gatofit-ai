
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
    <div className="p-4 border-t border-muted/30 bg-background">
      <div className="flex gap-2 items-end">
        <Textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyPress={onKeyPress}
          placeholder="Escribe tu mensaje..."
          disabled={isLoading}
          className="flex-1 min-h-[40px] max-h-[144px] resize-none overflow-y-auto text-sm leading-6"
          rows={1}
        />
        <Button
          onClick={onSend}
          disabled={!inputValue.trim() || isLoading}
          size="sm"
          className="px-3 h-10 flex-shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default AIMessageInput;
