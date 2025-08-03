import { SmsProvider } from 'services/sms/@types';
import { GreenSmsProvider } from '../green-sms.provider';
// import { TwilioSmsProvider } from './providers/TwilioSmsProvider';
// import { SmsAeroProvider } from './providers/SmsAeroProvider';
// import { TelegramProvider } from './providers/TelegramProvider';

export class SmsProviderFactory {
  private static providersMap: Record<string, () => SmsProvider> = {
    green: () => new GreenSmsProvider(),
    // twilio: () => new TwilioSmsProvider(),
    // aero: () => new SmsAeroProvider(),
    // telegram: () => new TelegramProvider(),
  };

  static createProvider(name: string): SmsProvider {
    const providerCreator = this.providersMap[name];
    if (!providerCreator) {
      throw new Error(`Provider ${name} not found in factory`);
    }
    return providerCreator();
  }

  static listAvailableProviders(): string[] {
    return Object.keys(this.providersMap);
  }
}
