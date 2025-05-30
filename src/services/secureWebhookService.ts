
import { validateWebhookResponse, RateLimiter } from '@/utils/securityValidation';

// Rate limiter for webhook calls (max 10 calls per minute per user)
const webhookLimiter = new RateLimiter(10, 60000);

interface SecureWebhookOptions {
  timeout?: number;
  retries?: number;
  validateResponse?: boolean;
}

export class SecureWebhookService {
  private static readonly DEFAULT_TIMEOUT = 30000; // 30 seconds
  private static readonly DEFAULT_RETRIES = 2;

  static async callWebhook(
    url: string, 
    data: any, 
    userId: string,
    options: SecureWebhookOptions = {}
  ): Promise<any> {
    const {
      timeout = this.DEFAULT_TIMEOUT,
      retries = this.DEFAULT_RETRIES,
      validateResponse = true
    } = options;

    // Rate limiting
    if (!webhookLimiter.isAllowed(userId)) {
      throw new Error('Too many webhook requests. Please wait before trying again.');
    }

    // Input validation
    if (!url || typeof url !== 'string') {
      throw new Error('Invalid webhook URL');
    }

    if (!url.startsWith('https://')) {
      throw new Error('Webhook URL must use HTTPS');
    }

    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'GatoFit/1.0',
            'X-Request-ID': crypto.randomUUID(),
            'X-Timestamp': Date.now().toString(),
          },
          body: JSON.stringify({
            ...data,
            // Add security metadata
            _meta: {
              userId,
              timestamp: Date.now(),
              version: '1.0'
            }
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Webhook request failed with status ${response.status}`);
        }

        const responseData = await response.json();

        // Validate response if requested
        if (validateResponse) {
          const validation = validateWebhookResponse(responseData);
          if (!validation.isValid) {
            throw new Error(`Invalid webhook response: ${validation.error}`);
          }
        }

        return responseData;
      } catch (error) {
        lastError = error as Error;
        console.error(`Webhook attempt ${attempt + 1} failed:`, error);
        
        // If it's the last attempt, don't wait
        if (attempt < retries) {
          // Exponential backoff
          const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('Webhook request failed after all retries');
  }

  static async analyzeFood(imageData: string, userId: string): Promise<any> {
    const webhookUrl = `https://mwgnpexeymgpzibnkiof.supabase.co/functions/v1/analyze-food`;
    
    return this.callWebhook(
      webhookUrl,
      { image: imageData },
      userId,
      { validateResponse: true }
    );
  }
}
