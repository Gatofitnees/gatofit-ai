
// Security helper functions
export const generateSecureId = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

export const sanitizeWebhookData = (data: any): any => {
  if (!data || typeof data !== 'object') return {};
  
  const sanitized: any = {};
  
  // Only allow expected fields and sanitize them
  const allowedFields = [
    'custom_food_name', 'quantity_consumed', 'unit_consumed',
    'calories_consumed', 'protein_g_consumed', 'carbs_g_consumed', 
    'fat_g_consumed', 'healthScore', 'ingredients'
  ];
  
  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      if (typeof data[field] === 'string') {
        sanitized[field] = validateTextInput(data[field], field === 'custom_food_name' ? 100 : 50);
      } else if (typeof data[field] === 'number' || !isNaN(parseFloat(data[field]))) {
        sanitized[field] = validateNumericInput(data[field]);
      } else if (field === 'ingredients' && Array.isArray(data[field])) {
        sanitized[field] = data[field].map((ingredient: any) => ({
          name: validateTextInput(ingredient.name || '', 50),
          grams: validateNumericInput(ingredient.grams || 0),
          calories: validateNumericInput(ingredient.calories || 0),
          protein: validateNumericInput(ingredient.protein || 0),
          carbs: validateNumericInput(ingredient.carbs || 0),
          fat: validateNumericInput(ingredient.fat || 0)
        }));
      }
    }
  }
  
  return sanitized;
};

export const createSecureFormData = (imageBlob: Blob, imageUrl: string): FormData => {
  const formData = new FormData();
  
  // Validate and sanitize inputs
  if (imageUrl && typeof imageUrl === 'string') {
    formData.append('imageUrl', imageUrl.substring(0, 500)); // Limit URL length
  }
  
  // Add secure timestamp
  formData.append('timestamp', new Date().toISOString());
  
  // Add request ID for tracking
  formData.append('requestId', generateSecureId());
  
  // Add the image with validation
  if (imageBlob) {
    const extension = getSecureImageExtension(imageBlob);
    formData.append('image', imageBlob, `food-image.${extension}`);
  }
  
  return formData;
};

const getSecureImageExtension = (file: Blob): string => {
  const mimeType = file.type;
  switch (mimeType) {
    case 'image/png': return 'png';
    case 'image/jpeg': return 'jpg';
    case 'image/webp': return 'webp';
    case 'image/gif': return 'gif';
    default: return 'jpg';
  }
};
