
import React from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatAIText } from '@/utils/textFormatter';
import { ChatMessage } from '@/hooks/ai-chat';

interface AIMessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onButtonClick: (buttonText: string) => void;
}

const AIMessageList: React.FC<AIMessageListProps> = ({ messages, isLoading, onButtonClick }) => {
  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div key={message.id} className="space-y-2">
          <div
            className={cn(
              "flex",
              message.type === 'user' ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[85%] p-3 rounded-xl text-sm transition-all duration-200",
                message.type === 'user'
                  ? "bg-primary text-primary-foreground rounded-br-sm shadow-md"
                  : "bg-muted rounded-bl-sm shadow-sm"
              )}
            >
              {message.type === 'ai' ? (
                <div 
                  className="whitespace-pre-wrap leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: formatAIText(message.content) }}
                />
              ) : (
                <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
              )}
              <p className={cn(
                "text-xs mt-2 opacity-70 transition-opacity",
                message.type === 'user' ? "text-primary-foreground/70" : "text-muted-foreground"
              )}>
                {message.timestamp.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          </div>
          
          {message.type === 'ai' && message.buttons && message.buttons.length > 0 && (
            <div className="flex justify-start">
              <div className="max-w-[85%] flex flex-wrap gap-2">
                {message.buttons.map((buttonText, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => onButtonClick(buttonText)}
                    disabled={isLoading}
                    className="text-xs bg-background hover:bg-muted transition-all duration-200 active:scale-95 border-border/50"
                  >
                    {buttonText}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
      
      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-muted p-3 rounded-xl rounded-bl-sm max-w-[85%] shadow-sm">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Pensando...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIMessageList;
