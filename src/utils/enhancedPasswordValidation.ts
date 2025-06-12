
// Enhanced password validation with stronger requirements
export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong' | 'very_strong';
}

export const validateStrongPassword = (password: string): PasswordValidationResult => {
  const errors: string[] = [];
  let score = 0;

  // Minimum length check
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  } else if (password.length >= 12) {
    score += 2;
  } else {
    score += 1;
  }

  // Uppercase letter check
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else {
    score += 1;
  }

  // Lowercase letter check
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else {
    score += 1;
  }

  // Number check
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  } else {
    score += 1;
  }

  // Special character check
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  } else {
    score += 1;
  }

  // Common password patterns check
  const commonPatterns = [
    /123456/,
    /password/i,
    /qwerty/i,
    /abc123/i,
    /admin/i,
    /welcome/i
  ];

  if (commonPatterns.some(pattern => pattern.test(password))) {
    errors.push('Password contains common patterns and is too predictable');
  }

  // Sequential characters check
  if (/(.)\1{2,}/.test(password)) {
    errors.push('Password should not contain repeated characters');
  }

  // Determine strength
  let strength: 'weak' | 'medium' | 'strong' | 'very_strong' = 'weak';
  if (score >= 6 && errors.length === 0) {
    strength = 'very_strong';
  } else if (score >= 4 && errors.length <= 1) {
    strength = 'strong';
  } else if (score >= 3 && errors.length <= 2) {
    strength = 'medium';
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength
  };
};

// Password strength indicator
export const getPasswordStrengthColor = (strength: string): string => {
  switch (strength) {
    case 'very_strong': return 'text-green-600';
    case 'strong': return 'text-blue-600';
    case 'medium': return 'text-yellow-600';
    default: return 'text-red-600';
  }
};

export const getPasswordStrengthText = (strength: string): string => {
  switch (strength) {
    case 'very_strong': return 'Very Strong';
    case 'strong': return 'Strong';
    case 'medium': return 'Medium';
    default: return 'Weak';
  }
};
