import { SmsProvider } from '../@types';
import { formatPhone } from 'utils/phone.util';
import { SmsAero } from 'smsaero';
import pino from 'pino';
import { SendSmsResponse, SmsAeroConfig } from './@types';

const logger = pino({ name: 'SmsAeroProvider' });
export class SmsAeroProvider implements SmsProvider {
  readonly name = 'aero';
  private client: SmsAero;

  constructor(private readonly config: SmsAeroConfig) {
    const { email, apiKey, sign } = config;
    this.client = new SmsAero(email, apiKey, sign);
  }

  private cleanText(text: string) {
    return text.replace(/\s+/gm, ' ').trim();
  }

  async sendSms(phone: string, text: string): Promise<SendSmsResponse> {
    const formattedPhone = formatPhone(phone);
    const cleanedText = this.cleanText(text);

    try {
      const res = await this.client.send(formattedPhone, cleanedText);
      logger.info({ res }, '📨 SmsAero: SMS sent');
      return { id: res.id ?? res.data?.id ?? 'unknown' };
    } catch (err) {
      logger.error({ err }, '❌ SmsAero sendSms failed');
      throw err;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const balance = await this.client.balance();
      const ok = typeof balance === 'object' && 'balance' in balance;
      logger.info({ balance }, '✅ SmsAero: balance check');
      return ok;
    } catch (err) {
      logger.error({ err }, '❌ SmsAero healthCheck failed');
      return false;
    }
  }
}
