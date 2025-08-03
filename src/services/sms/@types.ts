export interface SmsProvider {
  name: string; // уникальный slug, например 'green', 'twilio'
  healthCheck(): Promise<boolean>;
  sendSms(phone: string, text: string): Promise<any>;
}
