declare module 'smsaero' {
  export class SmsAero {
    constructor(email: string, apiKey: string, sign: string);
    send(phone: string, text: string): Promise<{
      id?: string;
      data?: {
        id?: string;
        message?: string;
      };
      message?: string;
      status?: string;
    }>;

    balance(): Promise<{
      balance: number;
      currency: string;
    }>;
  }
}

declare module 'twilio' {
  export interface MessageResponse {
    sid: string;
    status: string;
    to: string;
    from: string;
    body: string;
  }

  export interface MessageCreateParams {
    body: string;
    from: string;
    to: string;
  }

  export interface Messages {
    create(data: MessageCreateParams): Promise<MessageResponse>;
  }

  export interface Twilio {
    messages: Messages;
  }

  function twilio(accountSid: string, authToken: string): Twilio;

  export default twilio;
}
