
import { validateWebhookPayload, validateWebhookResponse } from '@/utils/enhancedSecurityValidation';
import { securityConfig, isWebhookEnabled } from '@/utils/secureConfig';
import { webhookRateLimiter, sanitizeUserInput } from '@/utils/securityMiddleware';
import { logSecurityEvent } from '@/utils/securityLogger';

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
      logSecurityEvent({
        timestamp: new Date().toISOString(),
        eventType: 'webhook_disabled',
        details: 'Webhook request blocked - feature disabled',
        severity: 'low',
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
        location: typeof window !== 'undefined' ? window.location.href : undefined
      });
      return { success: false, error: 'Webhook service is not configured' };
    }

    // Rate limiting
    const clientFingerprint = `webhook_${imageUrl.substring(0, 50)}`;
    if (!webhookRateLimiter.isAllowed(clientFingerprint)) {
      const resetTime = webhookRateLimiter.getTimeToReset(clientFingerprint);
      logSecurityEvent({
        timestamp: new Date().toISOString(),
        eventType: 'webhook_rate_limited',
        details: imageUrl,
        severity: 'medium',
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
        location: typeof window !== 'undefined' ? window.location.href : undefined
      });
      return { 
        success: false, 
        error: 'Too many webhook requests. Please wait before trying again.',
        rateLimitInfo: {
          remaining: 0,
          resetTime
        }
      };
    }

    // Enhanced URL validation with stricter security
    const urlPattern = /^https:\/\/[a-zA-Z0-9.-]{1,255}\/[a-zA-Z0-9._/-]{1,500}\.(jpg|jpeg|png|webp)(\?[a-zA-Z0-9&=._-]{0,200})?$/i;
    if (!urlPattern.test(imageUrl)) {
      logSecurityEvent({
        timestamp: new Date().toISOString(),
        eventType: 'webhook_invalid_url',
        details: imageUrl,
        severity: 'medium',
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
        location: typeof window !== 'undefined' ? window.location.href : undefined
      });
      return { success: false, error: 'Invalid or potentially unsafe image URL format' };
    }

    // Block local/private network URLs
    const url = new URL(imageUrl);
    const hostname = url.hostname;
    
    // Block localhost and private IP ranges
    const blockedPatterns = [
      /^localhost$/i,
      /^127\./,
      /^10\./,
      /^192\.168\./,
      /^172\.(1[6-9]|2[0-9]|3[01])\./,
      /^169\.254\./, // Link-local
      /^::1$/, // IPv6 localhost
      /^fc00::/i, // IPv6 private
    ];

    if (blockedPatterns.some(pattern => pattern.test(hostname))) {
      logSecurityEvent({
        timestamp: new Date().toISOString(),
        eventType: 'webhook_blocked_private_url',
        details: imageUrl,
        severity: 'high',
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
        location: typeof window !== 'undefined' ? window.location.href : undefined
      });
      return { success: false, error: 'Private network URLs are not allowed for security reasons' };
    }

    // Get webhook URL from environment variable
    const webhookUrl = import.meta.env.VITE_WEBHOOK_URL;
    
    if (!webhookUrl) {
      logSecurityEvent({
        timestamp: new Date().toISOString(),
        eventType: 'webhook_url_missing',
        details: 'No webhook URL configured',
        severity: 'medium',
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
        location: typeof window !== 'undefined' ? window.location.href : undefined
      });
      return { success: false, error: 'Webhook endpoint not configured' };
    }

    // Validate webhook URL security
    if (!webhookUrl.startsWith('https://')) {
      logSecurityEvent({
        timestamp: new Date().toISOString(),
        eventType: 'webhook_insecure_url',
        details: webhookUrl,
        severity: 'high',
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
        location: typeof window !== 'undefined' ? window.location.href : undefined
      });
      return { success: false, error: 'Webhook URL must use HTTPS' };
    }

    // Sanitize inputs with strict limits
    const sanitizedImageUrl = sanitizeUserInput(imageUrl, 1000);
    
    const payload = {
      imageUrl: sanitizedImageUrl,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent.substring(0, 200), // Reduced length
      referrer: window.location.origin,
      requestId: crypto.randomUUID()
    };

    // Validate payload before sending
    const validation = validateWebhookPayload(payload);
    if (!validation.isValid) {
      logSecurityEvent({
        timestamp: new Date().toISOString(),
        eventType: 'webhook_payload_invalid',
        details: validation.error || 'Invalid payload',
        severity: 'medium',
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
        location: typeof window !== 'undefined' ? window.location.href : undefined
      });
      return { success: false, error: validation.error };
    }

    logSecurityEvent({
      timestamp: new Date().toISOString(),
      eventType: 'webhook_request_initiated',
      details: `URL: ${sanitizedImageUrl}`,
      severity: 'low',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      location: typeof window !== 'undefined' ? window.location.href : undefined
    });

    // Enhanced fetch configuration with stricter security
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // Reduced to 15 seconds

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
      credentials: 'omit',
      mode: 'cors',
      cache: 'no-cache',
      redirect: 'error',
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      logSecurityEvent({
        timestamp: new Date().toISOString(),
        eventType: 'webhook_request_failed',
        details: `Status: ${response.status}`,
        severity: 'medium',
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
        location: typeof window !== 'undefined' ? window.location.href : undefined
      });
      return { 
        success: false, 
        error: `Webhook request failed with status ${response.status}` 
      };
    }

    // Validate response content type
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      logSecurityEvent({
        timestamp: new Date().toISOString(),
        eventType: 'webhook_invalid_response_type',
        details: contentType ||'unknown',
        severity: 'medium',
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
        location: typeof window !== 'undefined' ? window.location.href : undefined
      });
      return { success: false, error: 'Invalid response format from webhook' };
    }

    // Parse response with stricter size limit
    const responseText = await response.text();
    if (responseText.length > 50000) { // Reduced to 50KB
      logSecurityEvent({
        timestamp: new Date().toISOString(),
        eventType: 'webhook_response_too_large',
        details: `Size: ${responseText.length}`,
        severity: 'medium',
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
        location: typeof window !== 'undefined' ? window.location.href : undefined
      });
      return { success: false, error: 'Webhook response too large' };
    }

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (error) {
      logSecurityEvent({
        timestamp: new Date().toISOString(),
        eventType: 'webhook_invalid_json',
        details: 'Failed to parse JSON response',
        severity: 'medium',
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
        location: typeof window !== 'undefined' ? window.location.href : undefined
      });
      return { success: false, error: 'Invalid JSON response from webhook' };
    }
    
    // Validate response data structure
    const responseValidation = validateWebhookResponse(responseData);
    if (!responseValidation.isValid) {
      logSecurityEvent({
        timestamp: new Date().toISOString(),
        eventType: 'webhook_response_invalid',
        details: responseValidation.error || 'Invalid response structure',
        severity: 'medium',
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
        location: typeof window !== 'undefined' ? window.location.href : undefined
      });
      return { success: false, error: 'Invalid response format from webhook' };
    }

    // Sanitize response data with strict limits
    if (responseData.custom_food_name) {
      responseData.custom_food_name = sanitizeUserInput(responseData.custom_food_name, 50);
    }
    if (responseData.notes) {
      responseData.notes = sanitizeUserInput(responseData.notes, 200);
    }

    logSecurityEvent({
      timestamp: new Date().toISOString(),
      eventType: 'webhook_request_success',
      details: 'Response received and validated',
      severity: 'low',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      location: typeof window !== 'undefined' ? window.location.href : undefined
    });
    
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
      logSecurityEvent({
        timestamp: new Date().toISOString(),
        eventType: 'webhook_timeout',
        details: 'Request timed out',
        severity: 'medium',
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
        location: typeof window !== 'undefined' ? window.location.href : undefined
      });
      return { success: false, error: 'Webhook request timed out' };
    }

    logSecurityEvent({
      timestamp: new Date().toISOString(),
      eventType: 'webhook_request_error',
      details: error.message,
      severity: 'medium',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      location: typeof window !== 'undefined' ? window.location.href : undefined
    });
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
    
    // Block local/private IPs with comprehensive checks
    const hostname = parsedUrl.hostname;
    const blockedPatterns = [
      /^localhost$/i,
      /^127\./,
      /^10\./,
      /^192\.168\./,
      /^172\.(1[6-9]|2[0-9]|3[01])\./,
      /^169\.254\./,
      /^::1$/,
      /^fc00::/i,
    ];

    if (blockedPatterns.some(pattern => pattern.test(hostname))) {
      return false;
    }
    
    // Check for valid image extensions
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const pathname = parsedUrl.pathname.toLowerCase();
    const hasValidExtension = validExtensions.some(ext => pathname.endsWith(ext));
    
    // Check URL length (reduced limit)
    if (url.length > 1000) {
      return false;
    }
    
    return hasValidExtension;
  } catch {
    return false;
  }
};
