
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

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (allowDecimals) {
        // Allow comma key to act as decimal separator on mobile
        if (e.key === ',' && !e.currentTarget.value.includes('.') && !e.currentTarget.value.includes(',')) {
          e.preventDefault();
          // Directly update the input value
          const input = e.currentTarget;
          const newValue = input.value + '.';
          input.value = newValue;
          
          // Create a synthetic change event that matches the expected structure
          const syntheticEvent = {
            target: input,
            currentTarget: input,
            nativeEvent: e.nativeEvent,
            type: 'change',
            bubbles: true,
            cancelable: true,
            defaultPrevented: false,
            eventPhase: 2,
            timeStamp: Date.now(),
            isTrusted: true,
            isDefaultPrevented: () => false,
            isPropagationStopped: () => false,
            persist: () => {},
            preventDefault: () => {},
            stopPropagation: () => {}
          } as React.ChangeEvent<HTMLInputElement>;
          
          // Trigger the change handler
          if (onChange) {
            onChange(syntheticEvent);
          }
        }
      }
    };

    // Handle paste events to support comma decimal separator
    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      if (allowDecimals) {
        e.preventDefault();
        const pastedText = e.clipboardData.getData('text');
        const normalizedText = pastedText.replace(',', '.');
        
        // Update input value directly
        const input = e.currentTarget;
        input.value = normalizedText;
        
        // Create a synthetic change event
        const syntheticEvent = {
          target: input,
          currentTarget: input,
          nativeEvent: e.nativeEvent,
          type: 'change',
          bubbles: true,
          cancelable: true,
          defaultPrevented: false,
          eventPhase: 2,
          timeStamp: Date.now(),
          isTrusted: true,
          isDefaultPrevented: () => false,
          isPropagationStopped: () => false,
          persist: () => {},
          preventDefault: () => {},
          stopPropagation: () => {}
        } as React.ChangeEvent<HTMLInputElement>;
        
        // Validate and trigger change if valid
        if (onChange) {
          onChange(syntheticEvent);
        }
      }
    };

    return (
      <input
        type="text"
        inputMode={allowDecimals ? "decimal" : "numeric"}
        pattern={allowDecimals ? "[0-9]*[.,]?[0-9]*" : "[0-9]*"}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]",
          className
        )}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        ref={ref}
        {...props}
      />
    )
  }
)
NumericInput.displayName = "NumericInput"

export { NumericInput }
