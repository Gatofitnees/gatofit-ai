
import { useState } from 'react';
import { validateSecureEmail, validateSecureUsername, sanitizeTextInput, validateNumericInput } from '@/utils/enhancedInputValidation';
import { logDataEvent } from '@/utils/securityLogger';

export const useEnhancedValidation = () => {
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateField = (fieldName: string, value: any, validationType: string): boolean => {
    let isValid = true;
    let error = '';

    try {
      switch (validationType) {
        case 'email':
          const emailResult = validateSecureEmail(value);
          if (!emailResult.isValid) {
            error = emailResult.error || 'Invalid email';
            isValid = false;
          }
          break;

        case 'username':
          const usernameResult = validateSecureUsername(value);
          if (!usernameResult.isValid) {
            error = usernameResult.error || 'Invalid username';
            isValid = false;
          }
          break;

        case 'text':
          if (!value || typeof value !== 'string') {
            error = `${fieldName} is required`;
            isValid = false;
          } else if (value.trim().length === 0) {
            error = `${fieldName} cannot be empty`;
            isValid = false;
          }
          break;

        case 'number':
          if (isNaN(Number(value))) {
            error = `${fieldName} must be a valid number`;
            isValid = false;
          }
          break;

        case 'weight':
          const weightResult = validateNumericInput(value, 20, 500, 'Weight');
          if (!weightResult.isValid) {
            error = weightResult.error || 'Invalid weight';
            isValid = false;
          }
          break;

        case 'height':
          const heightResult = validateNumericInput(value, 50, 300, 'Height');
          if (!heightResult.isValid) {
            error = heightResult.error || 'Invalid height';
            isValid = false;
          }
          break;

        case 'bodyFat':
          const bodyFatResult = validateNumericInput(value, 1, 50, 'Body fat percentage');
          if (!bodyFatResult.isValid) {
            error = bodyFatResult.error || 'Invalid body fat percentage';
            isValid = false;
          }
          break;

        default:
          logDataEvent(`unknown_validation_type_${validationType}`, undefined, 'medium');
          break;
      }
    } catch (validationError) {
      console.error('Validation error:', validationError);
      error = 'Validation failed';
      isValid = false;
      logDataEvent('validation_error', undefined, 'medium');
    }

    // Update validation errors state
    setValidationErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));

    return isValid;
  };

  const clearValidationError = (fieldName: string) => {
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  const clearAllValidationErrors = () => {
    setValidationErrors({});
  };

  const sanitizeInput = (input: string, maxLength?: number): string => {
    return sanitizeTextInput(input, maxLength);
  };

  const hasValidationErrors = (): boolean => {
    return Object.keys(validationErrors).length > 0;
  };

  const getValidationError = (fieldName: string): string | undefined => {
    return validationErrors[fieldName];
  };

  return {
    validateField,
    clearValidationError,
    clearAllValidationErrors,
    sanitizeInput,
    hasValidationErrors,
    getValidationError,
    validationErrors
  };
};
