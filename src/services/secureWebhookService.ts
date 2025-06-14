
import { validateWebhookPayload, logSecurityEvent } from '@/utils/enhancedSecurityValidation';

export interface SecureWebhookResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export const sendSecureWebhookRequest = async (
  imageUrl: string,
  imageBlob?: Blob
): Promise<SecureWebhookResponse> => {
  try {
    // Validate image URL format
    const urlPattern = /^https:\/\/[a-zA-Z0-9.-]+\/[a-zA-Z0-9._/-]+\.(jpg|jpeg|png|webp)$/i;
    if (!urlPattern.test(imageUrl)) {
      logSecurityEvent('webhook_invalid_url', imageUrl, 'medium');
      return { success: false, error: 'Invalid image URL format' };
    }

    // Get webhook URL from environment or use secure default
    const webhookUrl = process.env.REACT_APP_WEBHOOK_URL || 'https://webhook.site/#!/view/your-secure-endpoint';
    
    // Validate webhook URL
    if (!webhookUrl.startsWith('https://')) {
      logSecurityEvent('webhook_insecure_url', webhookUrl, 'high');
      return { success: false, error: 'Webhook URL must use HTTPS' };
    }

    const payload = {
      imageUrl,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      referrer: window.location.origin
    };

    // Validate payload before sending
    const validation = validateWebhookPayload(payload);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    logSecurityEvent('webhook_request_initiated', `URL: ${imageUrl}`, 'low');

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload),
      credentials: 'omit', // Don't send credentials to external services
      mode: 'cors' // Use proper CORS instead of no-cors
    });

    if (!response.ok) {
      logSecurityEvent('webhook_request_failed', `Status: ${response.status}`, 'medium');
      return { 
        success: false, 
        error: `Webhook request failed with status ${response.status}` 
      };
    }

    const responseData = await response.json();
    
    // Validate response data
    const responseValidation = validateWebhookPayload(responseData);
    if (!responseValidation.isValid) {
      logSecurityEvent('webhook_response_invalid', responseValidation.error || 'Invalid response', 'medium');
      return { success: false, error: 'Invalid response from webhook' };
    }

    logSecurityEvent('webhook_request_success', 'Response received', 'low');
    
    return { success: true, data: responseData };

  } catch (error: any) {
    logSecurityEvent('webhook_request_error', error.message, 'medium');
    console.error('Secure webhook request failed:', error);
    
    return { 
      success: false, 
      error: 'Failed to process webhook request' 
    };
  }
};

export const validateImageUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    
    // Must be HTTPS
    if (parsedUrl.protocol !== 'https:') {
      return false;
    }
    
    // Check for valid image extensions
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const hasValidExtension = validExtensions.some(ext => 
      parsedUrl.pathname.toLowerCase().endsWith(ext)
    );
    
    return hasValidExtension;
  } catch {
    return false;
  }
};
