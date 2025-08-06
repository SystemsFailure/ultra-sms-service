import { PhoneCodeRedisStorage } from "lib/redis/phone-code.storage";
import { SmsProvider } from "../@types";
import { ProviderSelectionStrategy } from "./@types";
import { TelegramProvider } from "../providers/telegram-gateway.provider";
import pino from "pino";

export class TelegramSmsError extends Error {
  public readonly phone: string;
  public readonly originalError?: string | unknown;
  public readonly meta?: Record<string, any>;

  constructor(
    message: string,
    {
      phone,
      originalError,
      ...meta
    }: {
      phone: string;
      originalError?: string | unknown;
      [key: string]: any;
    }
  ) {
    super(message);
    this.name = "TelegramSmsError";
    this.phone = phone;
    this.originalError = originalError;
    this.meta = meta;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TelegramSmsError);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      phone: this.phone,
      originalError: this.originalError,
      meta: this.meta,
    };
  }
}

enum SmsServicesNameEnum {
  green = 'green',
  aero = 'aero',
  twilio = 'twilio',
}

interface TelegramSendBody {
  authCode: string;
  payload: string;
}

export class TelegramFallbackStrategy implements ProviderSelectionStrategy {
  constructor(
    private readonly telegramProvider: TelegramProvider,
    private readonly fallbackProviders: SmsProvider[],
    private readonly storage: PhoneCodeRedisStorage,
    private readonly logger: ReturnType<typeof pino>
  ) {}

  selectProvider(phone: string, providers: SmsProvider[]): SmsProvider {
    throw new Error("Method not implemented.");
  }

  private isRuPhone(phone: string): boolean {
    return phone.startsWith("+7");
  }

  private getProviderByName(name: string): SmsProvider | undefined {
    return this.fallbackProviders.find(p => p.name === name);
  }

  async sendAuthCode(
    phone: string,
    code: string,
    body: TelegramSendBody
  ): Promise<{ code: string; telegramWay: boolean }> {
    this.logger.info("TelegramFallbackStrategy.sendAuthCode - phone: %s", phone);

    const stored = await this.storage.methods.telegram.get(phone);

    // Пытаемся отправить через Telegram
    try {
      if (stored && stored.requestId && Date.now() < stored.expiresAt) {
        this.logger.info("TelegramFallbackStrategy - using stored requestId");
        await this.telegramProvider.sendSms(phone, code, { ...body, requestId: stored.requestId });
        await this.storage.methods.telegram.del(phone);
        return { code, telegramWay: true };
      }

      const { ok, result: { requestId } , error } = await this.telegramProvider.checkSendAbility(phone);
      if (!ok) {
        throw new TelegramSmsError("Telegram checkSendAbility failed", { phone, error });
      }

      await this.storage.methods.telegram.save(phone, {
        requestId,
        expiresAt: Date.now() + 3600 * 1000,
      });

      await this.telegramProvider.sendSms(phone, code, { ...body, requestId });
      await this.storage.methods.telegram.del(phone);

      return { code, telegramWay: true };
    } catch (error: any) {
      this.logger.warn("TelegramFallbackStrategy - Telegram failed: %s", error?.message);
    }

    // Telegram не сработал — fallback на SMS
    this.logger.info(`TelegramFallbackStrategy - fallback to SMS for phone: ${phone}`);

    const isRu = this.isRuPhone(phone);

    const smsFallbackOrder = isRu
      ? [SmsServicesNameEnum.green, SmsServicesNameEnum.aero]
      : [SmsServicesNameEnum.twilio];

    for (const serviceName of smsFallbackOrder) {
      const provider = this.getProviderByName(serviceName);
      if (!provider) continue;

      try {
        const messageText = `Your code is ${code}`; // TODO: временно
        await provider.sendSms(phone, messageText);
        return { code, telegramWay: false };
      } catch (err: any) {
        this.logger.warn(`Provider ${serviceName} failed: ${err.message}`);
      }
    }

    throw new Error("All fallback providers failed");
  }
}

/*
  Example use:

  const strategy = new TelegramFallbackStrategy(
    telegramProvider,
    [greenProvider, aeroProvider, twilioProvider],
    phoneCodeStorage
  );

  await strategy.sendAuthCode(phone, code, {
    authCode: code,
    payload: telegramPayload
  });
*/