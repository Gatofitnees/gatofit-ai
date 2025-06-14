
import { validateWebhookPayload, logSecurityEvent, validateWebhookResponse } from '@/utils/enhancedSecurityValidation';
import { secureConfig, isWebhookEnabled } from '@/utils/secureConfig';
import { webhookRateLimiter, sanitizeUserInput } from '@/utils/securityMiddleware';

export interface SecureWebhookResponse {
  success: boolean;
  data?: any;
  error?: string;
  rateLimitInfo?: {
    remaining: number;
    resetTime: number;
  };
}

export const sendSecureWebhookRequest = async (
  imageUrl: string,
  imageBlob?: Blob
): Promise<SecureWebhookResponse> => {
  try {
    // Check if webhooks are enabled
    if (!isWebhookEnabled()) {
      logSecurityEvent('webhook_disabled', 'Webhook request blocked - feature disabled', 'low');
      return { success: false, error: 'Webhook service is not configured' };
    }

    // Rate limiting
    const clientFingerprint = `webhook_${imageUrl.substring(0, 50)}`;
    if (!webhookRateLimiter.isAllowed(clientFingerprint)) {
      const resetTime = webhookRateLimiter.getTimeToReset(clientFingerprint);
      logSecurityEvent('webhook_rate_limited', imageUrl, 'medium');
      return { 
        success: false, 
        error: 'Too many webhook requests. Please wait before trying again.',
        rateLimitInfo: {
          remaining: 0,
          resetTime
        }
      };
    }

    // Validate image URL format with enhanced security
    const urlPattern = /^https:\/\/[a-zA-Z0-9.-]{1,255}\/[a-zA-Z0-9._/-]{1,500}\.(jpg|jpeg|png|webp)(\?[a-zA-Z0-9&=._-]{0,200})?$/i;
    if (!urlPattern.test(imageUrl)) {
      logSecurityEvent('webhook_invalid_url', imageUrl, 'medium');
      return { success: false, error: 'Invalid or potentially unsafe image URL format' };
    }

    // Additional URL security checks
    const url = new URL(imageUrl);
    if (url.hostname === 'localhost' || url.hostname.startsWith('192.168.') || url.hostname.startsWith('10.')) {
      logSecurityEvent('webhook_local_url_blocked', imageUrl, 'high');
      return { success: false, error: 'Local URLs are not allowed for security reasons' };
    }

    // Get webhook URL from secure config
    const config = secureConfig.getConfig();
    const webhookUrl = config.webhookUrl;
    
    if (!webhookUrl) {
      logSecurityEvent('webhook_url_missing', 'No webhook URL configured', 'medium');
      return { success: false, error: 'Webhook endpoint not configured' };
    }

    // Validate webhook URL
    if (!webhookUrl.startsWith('https://')) {
      logSecurityEvent('webhook_insecure_url', webhookUrl, 'high');
      return { success: false, error: 'Webhook URL must use HTTPS' };
    }

    // Sanitize inputs
    const sanitizedImageUrl = sanitizeUserInput(imageUrl, 2000);
    
    const payload = {
      imageUrl: sanitizedImageUrl,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent.substring(0, 500), // Limit user agent length
      referrer: window.location.origin,
      requestId: crypto.randomUUID()
    };

    // Validate payload before sending
    const validation = validateWebhookPayload(payload);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    logSecurityEvent('webhook_request_initiated', `URL: ${sanitizedImageUrl}`, 'low');

    // Enhanced fetch configuration with security measures
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-Request-ID': payload.requestId,
        'User-Agent': 'GatoFit-App/1.0'
      },
      body: JSON.stringify(payload),
      credentials: 'omit', // Don't send credentials to external services
      mode: 'cors', // Use proper CORS
      cache: 'no-cache',
      redirect: 'error', // Don't follow redirects for security
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      logSecurityEvent('webhook_request_failed', `Status: ${response.status} - ${response.statusText}`, 'medium');
      return { 
        success: false, 
        error: `Webhook request failed with status ${response.status}` 
      };
    }

    // Validate response content type
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      logSecurityEvent('webhook_invalid_response_type', contentType || 'unknown', 'medium');
      return { success: false, error: 'Invalid response format from webhook' };
    }

    // Parse response with size limit
    const responseText = await response.text();
    if (responseText.length > 100000) { // 100KB limit
      logSecurityEvent('webhook_response_too_large', `Size: ${responseText.length}`, 'medium');
      return { success: false, error: 'Webhook response too large' };
    }

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (error) {
      logSecurityEvent('webhook_invalid_json', 'Failed to parse JSON response', 'medium');
      return { success: false, error: 'Invalid JSON response from webhook' };
    }
    
    // Validate response data structure
    const responseValidation = validateWebhookResponse(responseData);
    if (!responseValidation.isValid) {
      logSecurityEvent('webhook_response_invalid', responseValidation.error || 'Invalid response structure', 'medium');
      return { success: false, error: 'Invalid response format from webhook' };
    }

    // Sanitize response data
    if (responseData.custom_food_name) {
      responseData.custom_food_name = sanitizeUserInput(responseData.custom_food_name, 100);
    }
    if (responseData.notes) {
      responseData.notes = sanitizeUserInput(responseData.notes, 500);
    }

    logSecurityEvent('webhook_request_success', 'Response received and validated', 'low');
    
    return { 
      success: true, 
      data: responseData,
      rateLimitInfo: {
        remaining: webhookRateLimiter.getRemainingAttempts(clientFingerprint),
        resetTime: webhookRateLimiter.getTimeToReset(clientFingerprint)
      }
    };

  } catch (error: any) {
    if (error.name === 'AbortError') {
      logSecurityEvent('webhook_timeout', 'Request timed out after 30 seconds', 'medium');
      return { success: false, error: 'Webhook request timed out' };
    }

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
    
    // Block local/private IPs
    const hostname = parsedUrl.hostname;
    if (hostname === 'localhost' || 
        hostname.startsWith('192.168.') || 
        hostname.startsWith('10.') ||
        hostname.startsWith('172.16.') ||
        hostname.startsWith('127.')) {
      return false;
    }
    
    // Check for valid image extensions
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const pathname = parsedUrl.pathname.toLowerCase();
    const hasValidExtension = validExtensions.some(ext => pathname.endsWith(ext));
    
    // Check URL length
    if (url.length > 2000) {
      return false;
    }
    
    return hasValidExtension;
  } catch {
    return false;
  }
};
