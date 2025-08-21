
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
    <div className="relative">
      {/* Aura effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#2094F3] via-[#9333EA] to-[#EC4899] opacity-75 blur-md animate-pulse" />
      
      <Button
        onClick={handleOpenChat}
        className="relative p-0 h-11 w-11 rounded-full border-2 border-transparent bg-gradient-to-r from-[#2094F3] via-[#9333EA] to-[#EC4899] hover:from-[#1976D2] hover:via-[#7C3AED] hover:to-[#DB2777] transition-all duration-300 hover:scale-110 active:scale-95"
        variant="ghost"
      >
        <div className="w-full h-full rounded-full bg-gradient-to-r from-[#2094F3] via-[#9333EA] to-[#EC4899] flex items-center justify-center">
          <span className="text-white font-bold text-sm drop-shadow-sm">
            AI
          </span>
        </div>
      </Button>
    </div>
  );
};

export default AIChat;
