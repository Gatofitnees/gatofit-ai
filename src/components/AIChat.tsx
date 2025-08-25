import React from 'react';
import { useNavigate } from 'react-router-dom';

const AIChat: React.FC = () => {
  const navigate = useNavigate();

  const handleOpenChat = () => {
    navigate('/ai-chat');
  };

  return (
    <div className="relative">
      {/* Moving aura effects */}
      <div className="absolute inset-0 opacity-40 blur-lg animate-spin" style={{ animationDuration: '12s' }}>
        <div className="w-full h-full rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-red-500" />
      </div>
      <div className="absolute inset-0 opacity-30 blur-xl animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }}>
        <div className="w-full h-full rounded-full bg-gradient-to-r from-red-500 via-blue-500 to-purple-500" />
      </div>
      <div className="absolute inset-0 opacity-20 blur-2xl animate-pulse">
        <div className="w-full h-full rounded-full bg-gradient-to-r from-purple-500 via-red-500 to-blue-500" />
      </div>
      
      <button
        onClick={handleOpenChat}
        className="relative w-11 h-11 transition-all duration-300 hover:scale-110 active:scale-95"
      >
        {/* Animated hollow wheel */}
        <svg 
          viewBox="0 0 44 44" 
          className="w-full h-full animate-spin"
          style={{ animationDuration: '8s' }}
        >
          {/* Gradient definition */}
          <defs>
            <linearGradient id="wheel-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2094F3" />
              <stop offset="50%" stopColor="#9333EA" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
            <linearGradient id="wheel-gradient-hover" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1976D2" />
              <stop offset="50%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#DB2777" />
            </linearGradient>
          </defs>
          
          {/* Hollow wheel ring */}
          <circle
            cx="22"
            cy="22"
            r="18"
            fill="none"
            stroke="url(#wheel-gradient)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="113"
            strokeDashoffset="0"
            className="transition-all duration-300 hover:stroke-[url(#wheel-gradient-hover)]"
          />
        </svg>
        
        {/* Center AI text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white font-bold text-sm drop-shadow-lg bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 bg-clip-text text-transparent">
            AI
          </span>
        </div>
      </button>
    </div>
  );
};

export default AIChat;