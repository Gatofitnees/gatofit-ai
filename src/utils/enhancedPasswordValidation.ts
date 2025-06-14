
export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong' | 'very_strong';
  score: number;
}

export const validateStrongPassword = (password: string): PasswordValidationResult => {
  const errors: string[] = [];
  let score = 0;
  let strength: 'weak' | 'medium' | 'strong' | 'very_strong' = 'weak';

  // Minimum length check (increased to 12 for better security)
  if (password.length < 12) {
    errors.push('Password must be at least 12 characters long');
  } else if (password.length >= 12) {
    score += 20;
  }

  if (password.length >= 16) {
    score += 10;
  }

  // Character type checks
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>[\]\\~`_+=\-]/.test(password);
  const hasUnicode = /[^\x00-\x7F]/.test(password);

  if (!hasUpperCase) {
    errors.push('Password must contain at least one uppercase letter');
  } else {
    score += 10;
  }

  if (!hasLowerCase) {
    errors.push('Password must contain at least one lowercase letter');
  } else {
    score += 10;
  }

  if (!hasNumbers) {
    errors.push('Password must contain at least one number');
  } else {
    score += 10;
  }

  if (!hasSpecialChar) {
    errors.push('Password must contain at least one special character (!@#$%^&*(),.?":{}|<>[]\\~`_+=-)');
  } else {
    score += 15;
  }

  if (hasUnicode) {
    score += 5; // Bonus for unicode characters
  }

  // Advanced security checks
  
  // Common password checks (expanded list)
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123', 'password123', 
    '12345678', 'welcome', 'admin', 'letmein', '1234567890', 'qwerty123',
    'password1', 'welcome123', 'admin123', 'login', 'user', 'root',
    'master', 'guest', 'test', 'temp', 'demo', 'changeme', 'default'
  ];
  
  if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
    errors.push('Password contains common words or patterns');
    score -= 20;
  }

  // Sequential character check (enhanced)
  const sequentialPatterns = [
    /(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i,
    /(?:123|234|345|456|567|678|789|890)/,
    /(?:qwe|wer|ert|rty|tyu|yui|uio|iop)/i,
    /(?:asd|sdf|dfg|fgh|ghj|hjk|jkl)/i,
    /(?:zxc|xcv|cvb|vbn|bnm)/i
  ];

  if (sequentialPatterns.some(pattern => pattern.test(password))) {
    errors.push('Password should not contain sequential characters or keyboard patterns');
    score -= 10;
  }

  // Repetitive character check
  if (/(.)\1{2,}/.test(password)) {
    errors.push('Password should not contain repeated characters (aaa, 111, etc.)');
    score -= 10;
  }

  // Dictionary word check (basic)
  const commonWords = ['love', 'hate', 'life', 'work', 'home', 'family', 'money', 'time'];
  if (commonWords.some(word => password.toLowerCase().includes(word))) {
    errors.push('Avoid using common dictionary words');
    score -= 5;
  }

  // Bonus points for length
  if (password.length > 20) {
    score += 15;
  }

  // Ensure score is between 0 and 100
  score = Math.max(0, Math.min(100, score));

  // Determine strength based on score and error count
  if (errors.length === 0 && score >= 80) {
    strength = 'very_strong';
  } else if (errors.length <= 1 && score >= 60) {
    strength = 'strong';
  } else if (errors.length <= 2 && score >= 40) {
    strength = 'medium';
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength,
    score
  };
};

export const generatePasswordStrengthScore = (password: string): number => {
  const result = validateStrongPassword(password);
  return result.score;
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

export const generateSecurePassword = (length: number = 16): string => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*(),.?":{}|<>[]\\~`_+=-';
  
  const allChars = uppercase + lowercase + numbers + symbols;
  let password = '';
  
  // Ensure at least one character from each category
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
};
