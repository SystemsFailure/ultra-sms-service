// sms/factory/SmsProviderFactory.ts
import { HttpService } from 'services/http/http.service';
import { SmsProvider } from 'services/sms/@types';
import { GreenSmsProvider } from '../green-sms.provider';
import { TwilioProvider } from '../twilio-sms.provider';
import { SmsAeroProvider } from '../sms-aero.provider';

interface SmsProviderFactoryDeps {
  httpService: HttpService;
  config: Record<string, any>;
}

export class SmsProviderFactory {
  constructor(private readonly deps: SmsProviderFactoryDeps) {}

  private readonly providersMap: Record<string, () => SmsProvider> = {
    green: () =>
      new GreenSmsProvider(this.deps.httpService, {
        login: this.deps.config.green.login,
        password: this.deps.config.green.password,
        from: this.deps.config.green.from,
      }),

    aero: () =>
      new SmsAeroProvider({
        email: this.deps.config.aero.email,
        apiKey: this.deps.config.aero.apiKey,
        sign: this.deps.config.aero.sign,
      }),

    twilio: () =>
      new TwilioProvider({
        accountId: this.deps.config.twilio.accountId,
        authToken: this.deps.config.twilio.authToken,
        from: this.deps.config.twilio.from,
      }),

    // telegram: () => new TelegramProvider(...),
  };

  createProvider(name: string): SmsProvider {
    const creator = this.providersMap[name];
    if (!creator) {
      throw new Error(`❌ SMS Provider "${name}" is not registered.`);
    }
    return creator();
  }

  listAvailableProviders(): string[] {
    return Object.keys(this.providersMap);
  }
}
