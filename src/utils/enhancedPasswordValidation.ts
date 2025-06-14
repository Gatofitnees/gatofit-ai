
export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
}

export const validateStrongPassword = (password: string): PasswordValidationResult => {
  const errors: string[] = [];
  let strength: 'weak' | 'medium' | 'strong' = 'weak';

  // Minimum length check
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  // Character type checks
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (!hasUpperCase) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!hasLowerCase) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!hasNumbers) {
    errors.push('Password must contain at least one number');
  }
  if (!hasSpecialChar) {
    errors.push('Password must contain at least one special character');
  }

  // Common password checks
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123',
    'password123', '12345678', 'welcome', 'admin', 'letmein'
  ];
  
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too common, please choose a more unique password');
  }

  // Sequential character check
  const hasSequential = /(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|123|234|345|456|567|678|789)/i.test(password);
  if (hasSequential) {
    errors.push('Password should not contain sequential characters');
  }

  // Determine strength
  const criteriaCount = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;
  if (password.length >= 12 && criteriaCount >= 3) {
    strength = 'strong';
  } else if (password.length >= 8 && criteriaCount >= 3) {
    strength = 'medium';
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength
  };
};

export const generatePasswordStrengthScore = (password: string): number => {
  let score = 0;
  
  if (password.length >= 8) score += 25;
  if (password.length >= 12) score += 25;
  if (/[a-z]/.test(password)) score += 10;
  if (/[A-Z]/.test(password)) score += 10;
  if (/[0-9]/.test(password)) score += 10;
  if (/[^A-Za-z0-9]/.test(password)) score += 20;
  
  return Math.min(score, 100);
};

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
