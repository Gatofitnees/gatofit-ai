
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface HeaderProps {
  routineName: string;
  onBack: () => void;
}

export const Header: React.FC<HeaderProps> = ({ routineName, onBack }) => {
  return (
    <div className="flex items-center justify-between p-4 pb-2 bg-background/90 backdrop-blur-md border-b border-white/5 sticky top-0 z-20">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">{routineName}</h1>
      </div>
    </div>
  );
};
