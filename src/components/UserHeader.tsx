
import React from 'react';
import { Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PremiumAvatar } from '@/components/premium/PremiumAvatar';
import { useProfile } from '@/hooks/useProfile';

interface UserHeaderProps {
  onSettingsClick?: () => void;
}

const UserHeader: React.FC<UserHeaderProps> = ({ onSettingsClick }) => {
  const navigate = useNavigate();
  const { profile } = useProfile();

  const handleSettingsClick = () => {
    if (onSettingsClick) {
      onSettingsClick();
    } else {
      navigate('/profile');
    }
  };

  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center space-x-3">
        <PremiumAvatar
          src={profile?.avatar_url || undefined}
          alt="Usuario"
          fallback={profile?.username?.charAt(0).toUpperCase() || profile?.full_name?.charAt(0).toUpperCase() || 'U'}
          size="lg"
        />
        <div>
          <h2 className="text-lg font-bold text-foreground">
            ¡Hola{profile?.username ? `, ${profile.username}` : ''}!
          </h2>
          <p className="text-sm text-muted-foreground">
            Listo para entrenar hoy 💪
          </p>
        </div>
      </div>
      <button
        onClick={handleSettingsClick}
        className="p-2 rounded-full hover:bg-secondary/80 transition-colors"
      >
        <Settings className="h-5 w-5 text-muted-foreground" />
      </button>
    </div>
  );
};

export default UserHeader;
