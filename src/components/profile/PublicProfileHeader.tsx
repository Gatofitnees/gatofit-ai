
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PublicProfileHeaderProps {
  onBack: () => void;
}

const PublicProfileHeader: React.FC<PublicProfileHeaderProps> = ({ onBack }) => {
  return (
    <div className="flex items-center gap-3 mb-6">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onBack}
        className="h-8 w-8"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <h1 className="text-xl font-bold">Perfil</h1>
    </div>
  );
};

export default PublicProfileHeader;
