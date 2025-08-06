import { formatPhone } from "utils/phone.util";
import {
  SendSmsResponse,
} from "./@types";
import { SmsProvider } from "../@types";
import { HttpRequestArgs, HttpService } from "services/http/http.service";

const GREEN_SMS_DOMAIN = "https://api3.greensms.ru" as const;

const endpoints = {
  checkBalance: "/account/balance",
  getToken: "/account/token",
  sendCall: "/call/send",
  callStatus: "/call/status",
  sendSms: "/sms/send",
  smsStatus: "/sms/status",
} as const;

type GreenSmsEndpoint = keyof typeof endpoints;
type Method = "GET" | "POST";

interface GreenSmsConfig {
  login: string;
  password: string;
  from?: string;
}

export class GreenSmsProvider implements SmsProvider {
  readonly name = "green" as const;

  constructor(
    private readonly http: HttpService,
    private readonly config: GreenSmsConfig
  ) {}

  private get headers(): Record<string, string> {
    return { "Content-Type": "application/json" };
  }

  private buildParams(additional: Record<string, any> = {}) {
    return {
      user: this.config.login,
      pass: this.config.password,
      from: this.config.from,
      ...additional,
    };
  }

  private async request<TResponse = any>(
    method: Method,
    endpoint: GreenSmsEndpoint,
    body?: Record<string, any>,
    query?: Record<string, any>
  ): Promise<TResponse> {
    const url = `${GREEN_SMS_DOMAIN}${endpoints[endpoint]}`;
    const params = this.buildParams(query);

    const args: HttpRequestArgs = {
      url,
      method,
      data: body,
      params,
      headers: this.headers,
    };

    const response = await this.http.request<TResponse>(args);
    return response.data;
  }

  async sendSms(phone: string, text: string): Promise<SendSmsResponse> {
    const payload = {
      to: formatPhone(phone),
      txt: text.replace(/\s+/g, " "),
    };

    const { request_id } = await this.request<{ request_id: string }>(
      "POST",
      "sendSms",
      payload
    );

    return { id: request_id };
  }

  async checkSmsStatus(id: string): Promise<{ status: boolean }> {
    const { status_code } = await this.request<{ status_code: number }>(
      "GET",
      "smsStatus",
      undefined,
      { id }
    );

    return { status: status_code === 1 };
  }

  async sendCall(phone: string): Promise<{ id: string; code: string }> {
    const payload = { to: formatPhone(phone) };

    const { request_id, code } = await this.request<{
      request_id: string;
      code: string;
    }>("POST", "sendCall", payload);

    return { id: request_id, code };
  }

  async checkCallStatus(id: string): Promise<{ status: boolean }> {
    const { status_code } = await this.request<{ status_code: number }>(
      "GET",
      "callStatus",
      undefined,
      { id }
    );

    return { status: status_code === 1 };
  }

  async checkBalance(): Promise<number> {
    const { balance } = await this.request<{ balance: number }>(
      "GET",
      "checkBalance"
    );
    return balance;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const balance = await this.checkBalance();
      return Number.isFinite(balance);
    } catch (error) {
      return false;
    }
  }
}
