
import React from "react";
import { Filter } from "lucide-react";
import Button from "@/components/Button";

interface FilterButtonProps {
  onClick: () => void;
}

const FilterButton: React.FC<FilterButtonProps> = ({ onClick }) => {
  return (
    <Button 
      variant="secondary"
      size="sm"
      leftIcon={<Filter className="h-4 w-4" />}
      onClick={onClick}
    >
      Filtrar
    </Button>
  );
};

export default FilterButton;
