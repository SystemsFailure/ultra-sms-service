import { SmsProvider } from '../@types';
import { formatPhone } from 'utils/phone.util';
import twilio, { Twilio as TwilioInstance } from 'twilio';
import pino from 'pino';
import { SendSmsResponse, TwilioConfig } from './@types';

const logger = pino({ name: 'TwilioProvider' });

export class TwilioProvider implements SmsProvider {
  readonly name = 'twilio';
  private client: TwilioInstance;
  private from: string;

  constructor(config: TwilioConfig) {
    this.client = twilio(config.accountId, config.authToken);
    this.from = config.from;
  }

  private cleanText(text: string): string {
    return text.replace(/\s+/gm, ' ').trim();
  }

  async sendSms(phone: string, text: string): Promise<SendSmsResponse> {
    try {
      const response = await this.client.messages.create({
        body: this.cleanText(text),
        from: this.from,
        to: formatPhone(phone),
      });
      logger.info({ response }, '📨 Twilio: SMS sent');
      return { id: response.sid };
    } catch (err) {
      logger.error({ err }, '❌ Twilio sendSms failed');
      throw err;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.sendSms('79131716353', 'Twilio healthCheck'); // <= todo: надо вынести - '79131716353'
      return true;
    } catch (err) {
      logger.error({ err }, '❌ Twilio healthCheck failed');
      return false;
    }
  }
}
