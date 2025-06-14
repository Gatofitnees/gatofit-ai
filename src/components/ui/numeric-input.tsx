
import * as React from "react"
import { cn } from "@/lib/utils"

interface NumericInputProps extends React.ComponentProps<"input"> {
  allowDecimals?: boolean;
  maxDecimals?: number;
}

const NumericInput = React.forwardRef<HTMLInputElement, NumericInputProps>(
  ({ className, allowDecimals = false, maxDecimals = 1, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value;
      
      if (allowDecimals) {
        // Replace comma with dot for consistency
        value = value.replace(',', '.');
        
        // Create regex pattern based on maxDecimals
        const decimalPattern = maxDecimals === 1 
          ? /^(\d+)?([.]?\d{0,1})?$/ // For 1 decimal: 34.5
          : new RegExp(`^(\\d+)?([.]?\\d{0,${maxDecimals}})?$`); // For multiple decimals
        
        // Allow empty string or valid decimal pattern
        if (value === '' || decimalPattern.test(value)) {
          // Prevent multiple dots
          const dotCount = (value.match(/\./g) || []).length;
          if (dotCount <= 1) {
            // Update the input value to show dot instead of comma
            e.target.value = value;
            onChange?.(e);
          }
        }
      } else {
        // Original integer-only behavior
        if (/^\d*$/.test(value)) {
          onChange?.(e);
        }
      }
    };

    const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
      // Additional input event handling for better mobile support
      const target = e.currentTarget;
      let value = target.value;
      
      if (allowDecimals) {
        // Normalize comma to dot
        value = value.replace(',', '.');
        
        // Create regex pattern based on maxDecimals
        const decimalPattern = maxDecimals === 1 
          ? /^(\d+)?([.]?\d{0,1})?$/ 
          : new RegExp(`^(\\d+)?([.]?\\d{0,${maxDecimals}})?$`);
        
        if (value !== '' && !decimalPattern.test(value)) {
          // Prevent invalid input by reverting to last valid value
          const lastValidValue = target.getAttribute('data-last-valid') || '';
          target.value = lastValidValue;
          return;
        }
        
        // Store last valid value
        target.setAttribute('data-last-valid', value);
        
        // Update display value
        if (target.value !== value) {
          target.value = value;
        }
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (allowDecimals) {
        // Allow comma key to act as decimal separator
        if (e.key === ',' && !e.currentTarget.value.includes('.') && !e.currentTarget.value.includes(',')) {
          e.preventDefault();
          const newValue = e.currentTarget.value + '.';
          e.currentTarget.value = newValue;
          
          // Trigger change event
          const event = new Event('input', { bubbles: true });
          e.currentTarget.dispatchEvent(event);
        }
      }
    };

    return (
      <input
        type="tel"
        inputMode="numeric"
        pattern={allowDecimals ? "[0-9]*[.]?[0-9]*" : "[0-9]*"}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]",
          className
        )}
        onChange={handleChange}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        ref={ref}
        {...props}
      />
    )
  }
)
NumericInput.displayName = "NumericInput"

export { NumericInput }
