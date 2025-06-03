
import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const AIChat: React.FC = () => {
  const navigate = useNavigate();

  const handleOpenChat = () => {
    navigate('/ai-chat');
  };

  return (
    <Button
      onClick={handleOpenChat}
      className="p-2 h-11 px-3 rounded-full bg-primary/10 hover:bg-primary/20 border-none"
      variant="outline"
    >
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-600 to-blue-500 animate-galaxy-pulse font-bold">
        AI
      </span>
    </Button>
  );
};

export default AIChat;
