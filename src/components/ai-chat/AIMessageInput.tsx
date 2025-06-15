
import React, { useState, useEffect } from 'react';
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

const AIMessageInput = React.forwardRef<HTMLDivElement, AIMessageInputProps>(({
  inputValue,
  onInputChange,
  onSend,
  isLoading,
  textareaRef,
  onKeyPress,
}, ref) => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto'; // Reset height
      
      const lineHeight = 24; // Corresponds to leading-6
      const maxLines = 6;
      const maxHeight = lineHeight * maxLines; // Corresponds to max-h-[144px]
      
      const scrollHeight = textarea.scrollHeight;
      const newHeight = Math.min(scrollHeight, maxHeight);
      
      textarea.style.height = `${newHeight}px`;
    }
  }, [inputValue, textareaRef]);

  // Handle virtual keyboard for mobile
  useEffect(() => {
    const visualViewport = window.visualViewport;
    if (!visualViewport) return;

    const handleResize = () => {
      const newKeyboardHeight = window.innerHeight - visualViewport.height;
      setKeyboardHeight(Math.max(0, newKeyboardHeight));
    };

    visualViewport.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      visualViewport.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="fixed left-0 right-0 w-full max-w-md mx-auto bg-background/90 backdrop-blur-sm z-20"
      style={{
        bottom: `${keyboardHeight}px`,
        paddingBottom: 'env(safe-area-inset-bottom)',
        transition: 'bottom 0.2s ease-out',
      }}
    >
      <div className="p-4 pt-2 border-t border-muted/30">
        <div className="flex gap-2 items-start bg-input rounded-xl p-2 focus-within:ring-2 focus-within:ring-ring transition-all">
          <Textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyPress={onKeyPress}
            placeholder="Escribe tu mensaje..."
            disabled={isLoading}
            className="flex-1 min-h-[24px] max-h-[144px] resize-none text-sm leading-6 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 mobile-scrollbar"
            rows={1}
          />
          <Button
            onClick={onSend}
            disabled={!inputValue.trim() || isLoading}
            size="icon"
            className="h-9 w-9 flex-shrink-0 bg-primary hover:bg-primary/90 rounded-lg touch-element self-end"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
});

AIMessageInput.displayName = 'AIMessageInput';

export default AIMessageInput;
