
import * as React from "react"
import { cn } from "@/lib/utils"

interface NumericInputProps extends React.ComponentProps<"input"> {
  allowDecimals?: boolean;
}

const NumericInput = React.forwardRef<HTMLInputElement, NumericInputProps>(
  ({ className, allowDecimals = false, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (allowDecimals) {
        // Allow numbers with up to one decimal place
        const value = e.target.value;
        const regex = /^(\d+)?([,.]?\d?)?$/;
        
        if (regex.test(value) || value === '') {
          // Replace comma with dot for consistency
          const normalizedValue = value.replace(',', '.');
          e.target.value = normalizedValue;
          onChange?.(e);
        }
      } else {
        // Original integer-only behavior
        const value = e.target.value;
        if (/^\d*$/.test(value)) {
          onChange?.(e);
        }
      }
    };

    return (
      <input
        inputMode={allowDecimals ? "decimal" : "numeric"}
        pattern={allowDecimals ? "[0-9]*[.,]?[0-9]?" : "[0-9]*"}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]",
          className
        )}
        onChange={handleChange}
        ref={ref}
        {...props}
      />
    )
  }
)
NumericInput.displayName = "NumericInput"

export { NumericInput }
