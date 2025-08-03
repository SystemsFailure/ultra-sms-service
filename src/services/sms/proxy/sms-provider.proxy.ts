import { SmsProvider } from "../@types";

export class SmsProviderProxy implements SmsProvider {
  name: string;

  constructor(private target: SmsProvider) {
    this.name = target.name;
  }

  async sendSms(phone: string, text: string) {
    try {
      console.log(`[Proxy] Sending SMS via ${this.name} to ${phone}`);
      
      // Throttling / rate-limiting можно встроить сюда
      const result = await this.retry(() => this.target.sendSms(phone, text), 2);
      
      console.log(`[Proxy] SMS sent successfully via ${this.name}`);
      return result;
    } catch (err) {
      console.error(`[Proxy] Failed to send SMS via ${this.name}:`, err);
      throw err;
    }
  }

  async healthCheck() {
    // Простейшее кеширование на 1 минуту
    const cacheKey = `health:${this.name}`;
    const cache = SmsProviderProxy.cache.get(cacheKey);
    if (cache && cache.expiresAt > Date.now()) {
      return cache.result;
    }

    const result = await this.target.healthCheck();
    SmsProviderProxy.cache.set(cacheKey, {
      result,
      expiresAt: Date.now() + 60_000,
    });
    return result;
  }

  private async retry<T>(fn: () => Promise<T>, retries = 1): Promise<T> {
    let lastErr;
    for (let i = 0; i <= retries; i++) {
      try {
        return await fn();
      } catch (err) {
        lastErr = err;
        console.warn(`[Proxy] Retry attempt ${i + 1} for ${this.name}`);
      }
    }
    throw lastErr;
  }

  // Простая in-memory cache реализация
  private static cache: Map<string, { result: any, expiresAt: number }> = new Map();
}
