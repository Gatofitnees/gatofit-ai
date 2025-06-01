
import * as React from "react"
import { cn } from "@/lib/utils"

interface DecimalInputProps extends Omit<React.ComponentProps<"input">, 'onChange'> {
  onChange?: (value: string) => void;
  onValueChange?: (numericValue: number | null) => void;
}

const DecimalInput = React.forwardRef<HTMLInputElement, DecimalInputProps>(
  ({ className, onChange, onValueChange, ...props }, ref) => {
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value;
      
      // Permitir solo números, punto y coma
      value = value.replace(/[^\d.,]/g, '');
      
      // Reemplazar comas por puntos para normalización
      value = value.replace(/,/g, '.');
      
      // Evitar múltiples puntos decimales
      const parts = value.split('.');
      if (parts.length > 2) {
        value = parts[0] + '.' + parts.slice(1).join('');
      }
      
      // Limitar a 2 decimales
      if (parts[1] && parts[1].length > 2) {
        value = parts[0] + '.' + parts[1].substring(0, 2);
      }
      
      // Actualizar el valor del input
      e.target.value = value;
      
      // Llamar onChange si existe
      if (onChange) {
        onChange(e);
      }
      
      // Llamar onValueChange con el valor numérico
      if (onValueChange) {
        const numericValue = value === '' ? null : parseFloat(value);
        onValueChange(isNaN(numericValue!) ? null : numericValue);
      }
    };

    return (
      <input
        inputMode="decimal"
        pattern="[0-9]*\.?[0-9]*"
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]",
          className
        )}
        ref={ref}
        onChange={handleInputChange}
        {...props}
      />
    )
  }
)
DecimalInput.displayName = "DecimalInput"

export { DecimalInput }
