import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface AddBlockButtonProps {
  onClick: () => void;
}

export const AddBlockButton: React.FC<AddBlockButtonProps> = ({ onClick }) => {
  return (
    <div className="fixed right-4 bottom-20 z-30">
      <Button
        variant="default"
        size="lg"
        className="h-14 w-14 rounded-full shadow-lg"
        onClick={onClick}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
};