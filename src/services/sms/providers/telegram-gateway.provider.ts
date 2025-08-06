import { SmsProvider } from '../@types';
import pino from 'pino';
import { TelegramProviderConfig } from './@types';

export interface CheckSendAbilityResult {
  ok: boolean;
  result: {
    requestId: string;
    remainingBalance?: number;
    requestCost?: number;
  };
  error?: string;
}
export class TelegramProvider implements SmsProvider {
  readonly name = 'telegram';
  private readonly logger: ReturnType<typeof pino>;
  private readonly baseUrl = 'https://gatewayapi.telegram.org/';
  private readonly headers: Record<string, string>;

  constructor(
    private readonly deps: TelegramProviderConfig
  ) {
    const { token, logger } = deps;

    if (!token || !deps.httpService || !deps.from || !deps.logger) {
      throw new Error('TelegramProvider: Missing required config');
    }

    this.logger = logger;

    this.headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  private async request<T>(endpoint: string, method: 'POST', data: any): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const res = await this.deps.httpService.post(method, {
        url,
        data,
        headers: this.headers,
      });
      return res;
    } catch (err) {
      this.logger.error({ err }, `TelegramProvider API Error at ${endpoint}`);
      throw err;
    }
  }

  async sendSms(
    phone: string,
    text: string,
    meta?: any
  ): Promise<any> {
    if (!phone || !text) throw new Error('Phone and text are required');

    const data: Record<string, any> = {
      phone_number: phone,
      payload: text,
      ttl: 60,
    };

    if (meta?.code) {
      data.code = meta.code;
    }
    if (meta?.codeLength) {
      data.code_length = meta.codeLength;
    }
    if (meta?.requestId) {
      data.request_id = meta.requestId;
    }

    const { result } = await this.request<{ result: { request_id: string } }>('sendVerificationMessage', 'POST', data);
    return { id: result.request_id };
  }

  async healthCheck(): Promise<boolean> {
    try {
      const check = await this.checkSendAbility('+79996370816'); // <- todo: вынести
      return check.ok;
    } catch (e) {
      this.logger.warn({ e }, 'TelegramProvider healthCheck failed');
      return false;
    }
  }

  async checkSendAbility(phone: string): Promise<CheckSendAbilityResult> {
    const data = { phone_number: phone };
    const response = await this.request<any>('checkSendAbility', 'POST', data);

    if (!response.ok) {
      throw new Error(`Telegram checkSendAbility failed: ${response.error}`);
    }

    return {
      ok: response.ok,
      result: {
        requestId: response.result.request_id,
      },
      error: response.error,
    };
  }

  async checkSmsStatus(requestId: string): Promise<{ isValid: boolean }> {
    const data = { request_id: requestId };
    const { result } = await this.request<any>('checkVerificationStatus', 'POST', data);

    return {
      isValid: result?.verification_status?.status === 'code_valid',
    };
  }

  async revokeSms(requestId: string): Promise<{ success: boolean }> {
    const data = { request_id: requestId };
    await this.request<any>('revokeVerificationMessage', 'POST', data);
    return { success: true };
  }

  async balance(phone: string): Promise<boolean> {
    try {
      const response = await this.checkSendAbility(phone)

      const result = response?.result
      const ok = response?.ok

      if (!ok || !result) {
        this.logger.warn(
          { ok, phone },
          'TelegramProvider.balance - invalid response from checkSendAbility'
        )
        return false
      }

      const remainingBalance = result.remainingBalance
      const requestCost = result.requestCost

      if (
        remainingBalance === null ||
        remainingBalance === undefined ||
        typeof remainingBalance !== 'number' ||
        isNaN(remainingBalance)
      ) {
        this.logger.error(
          { remainingBalance },
          'TelegramProvider.balance - invalid remaining balance'
        )
        return false
      }

      if (remainingBalance <= 0) {
        this.logger.debug(
          { remainingBalance },
          'TelegramProvider.balance - balance is empty or negative'
        )
        return false
      }

      this.logger.info(
        { remainingBalance, requestCost },
        'TelegramProvider.balance - current balance info'
      )

      const dailyEstimatedCost = this.deps.dailyEstimatedCost ?? 100; // Значение по умолчанию или передаётся извне

      if (remainingBalance < dailyEstimatedCost) {
        this.logger.warn(
          {
            remainingBalance,
            dailyEstimatedCost,
          },
          'TelegramProvider.balance - low balance warning'
        )
      }

      return true
    } catch (err: any) {
      this.logger.warn({ err }, 'TelegramProvider.balance - check failed')
      return false
    }
  }

}
