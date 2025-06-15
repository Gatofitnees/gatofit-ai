
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
    <>
      {messages.map((message) => (
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
          
          {message.type === 'ai' && message.buttons && message.buttons.length > 0 && (
            <div className="flex justify-start mt-2">
              <div className="max-w-[85%] flex flex-wrap gap-2">
                {message.buttons.map((buttonText, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => onButtonClick(buttonText)}
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
      ))}
      
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
    </>
  );
};

export default AIMessageList;
