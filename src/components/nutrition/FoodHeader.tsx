
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/Button';

interface FoodHeaderProps {
  imageUrl?: string;
}

export const FoodHeader: React.FC<FoodHeaderProps> = ({ imageUrl }) => {
  const navigate = useNavigate();

  return (
    <div className="relative h-64 bg-gradient-to-b from-primary/20 to-background">
      {imageUrl && (
        <img 
          src={imageUrl} 
          alt="Food"
          className="w-full h-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-black/30" />
      
      {/* Back Button */}
      <Button
        variant="secondary"
        size="sm"
        onClick={() => navigate('/nutrition')}
        className="absolute top-6 left-4 h-10 w-10 rounded-full p-0"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
    </div>
  );
};
