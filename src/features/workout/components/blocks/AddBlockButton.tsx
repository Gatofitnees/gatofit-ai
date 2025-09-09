import React from "react";
import Button from "@/components/Button";
import { Plus } from "lucide-react";

interface AddBlockButtonProps {
  onClick: () => void;
}

const AddBlockButton: React.FC<AddBlockButtonProps> = ({ onClick }) => {
  return (
    <div className="pt-2">
      <Button 
        variant="primary"
        fullWidth 
        leftIcon={<Plus className="h-4 w-4" />}
        onClick={onClick}
        type="button"
      >
        Añadir Bloque
      </Button>
    </div>
  );
};

export default AddBlockButton;