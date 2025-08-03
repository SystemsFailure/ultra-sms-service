import { SmsProvider } from "../@types";

export class GreenSmsProvider implements SmsProvider {
  name = 'green';

  async healthCheck() {
    // заглушка проверки
    return true;
  }

  async sendSms(phone: string, text: string) {
    // тут реальный вызов API green-sms
    return Promise.resolve(`Sent via GreenSms to ${phone}`);
  }
}
