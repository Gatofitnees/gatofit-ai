
import { validateWebhookRequest, logSecurityEvent } from '@/utils/enhancedSecurityValidation';
import { validateWebhookResponse, RateLimiter } from '@/utils/securityValidation';
import { createSecureFormData } from '@/utils/securityHelpers';

// Enhanced rate limiter with stricter limits
const enhancedWebhookLimiter = new RateLimiter(5, 60000); // 5 calls per minute

interface SecureWebhookOptions {
  timeout?: number;
  retries?: number;
  validateResponse?: boolean;
  includeAuth?: boolean;
}

export class EnhancedWebhookService {
  private static readonly DEFAULT_TIMEOUT = 15000; // Reduced to 15 seconds
  private static readonly DEFAULT_RETRIES = 1; // Reduced retries
  private static readonly MAX_RESPONSE_SIZE = 5 * 1024 * 1024; // 5MB max response

  static async callSecureWebhook(
    url: string,
    data: any,
    userId: string,
    options: SecureWebhookOptions = {}
  ): Promise<any> {
    const {
      timeout = this.DEFAULT_TIMEOUT,
      retries = this.DEFAULT_RETRIES,
      validateResponse = true,
      includeAuth = false
    } = options;

    // Enhanced rate limiting
    if (!enhancedWebhookLimiter.isAllowed(userId)) {
      logSecurityEvent('webhook_rate_limit_exceeded', `User ${userId}`, 'high');
      throw new Error('Rate limit exceeded. Please wait before trying again.');
    }

    // Validate request before sending
    const requestValidation = validateWebhookRequest(url, data);
    if (!requestValidation.isValid) {
      logSecurityEvent('webhook_request_validation_failed', requestValidation.error || 'Unknown validation error', 'high');
      throw new Error(`Request validation failed: ${requestValidation.error}`);
    }

    let lastError: Error | null = null;
    const startTime = Date.now();

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        // Create secure headers
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'User-Agent': 'GatoFit/2.0 (Security Enhanced)',
          'X-Request-ID': crypto.randomUUID(),
          'X-Timestamp': Date.now().toString(),
          'X-Client-Version': '2.0',
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        };

        // Add authentication if required
        if (includeAuth) {
          // Could add API key or other auth here
          headers['X-User-ID'] = userId;
        }

        logSecurityEvent('webhook_request_initiated', `URL: ${url}, Attempt: ${attempt + 1}`, 'low');

        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            ...data,
            _security: {
              userId,
              timestamp: Date.now(),
              version: '2.0',
              requestId: headers['X-Request-ID']
            }
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        // Check response size before processing
        const contentLength = response.headers.get('content-length');
        if (contentLength && parseInt(contentLength) > this.MAX_RESPONSE_SIZE) {
          throw new Error('Response too large');
        }

        if (!response.ok) {
          const errorText = await response.text();
          logSecurityEvent('webhook_http_error', `Status: ${response.status}, Body: ${errorText.substring(0, 500)}`, 'medium');
          throw new Error(`Webhook request failed with status ${response.status}: ${errorText}`);
        }

        const responseText = await response.text();
        
        // Validate response size
        if (responseText.length > this.MAX_RESPONSE_SIZE) {
          throw new Error('Response body too large');
        }

        let responseData: any;
        try {
          responseData = JSON.parse(responseText);
        } catch (parseError) {
          logSecurityEvent('webhook_parse_error', `Invalid JSON response: ${responseText.substring(0, 200)}`, 'medium');
          throw new Error('Invalid JSON response from webhook');
        }

        // Validate response if requested
        if (validateResponse) {
          const validation = validateWebhookResponse(responseData);
          if (!validation.isValid) {
            logSecurityEvent('webhook_response_validation_failed', validation.error || 'Unknown validation error', 'medium');
            throw new Error(`Invalid webhook response: ${validation.error}`);
          }
        }

        const duration = Date.now() - startTime;
        logSecurityEvent('webhook_request_completed', `Duration: ${duration}ms, Size: ${responseText.length} bytes`, 'low');

        return responseData;

      } catch (error) {
        lastError = error as Error;
        const duration = Date.now() - startTime;
        
        logSecurityEvent('webhook_request_failed', 
          `Attempt ${attempt + 1}/${retries + 1}, Duration: ${duration}ms, Error: ${lastError.message}`, 
          'medium'
        );
        
        // If it's the last attempt, don't wait
        if (attempt < retries) {
          // Exponential backoff with jitter
          const baseDelay = Math.min(1000 * Math.pow(2, attempt), 5000);
          const jitter = Math.random() * 1000;
          const delay = baseDelay + jitter;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    logSecurityEvent('webhook_request_failed_all_attempts', `Final error: ${lastError?.message}`, 'high');
    throw lastError || new Error('Webhook request failed after all retries');
  }

  static async analyzeFoodSecure(imageData: string, userId: string): Promise<any> {
    const webhookUrl = 'https://gaton8n.gatofit.com/webhook/e39f095b-fb33-4ce3-b41a-619a650149f5';
    
    return this.callSecureWebhook(
      webhookUrl,
      { image: imageData },
      userId,
      { 
        validateResponse: true,
        includeAuth: true,
        timeout: 20000 // Longer timeout for image analysis
      }
    );
  }
}
