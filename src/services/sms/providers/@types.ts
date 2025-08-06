import pino from "pino";
import { HttpService } from "services/http/http.service";

export interface SendSmsResponse {
  id: string;
}

export interface TelegramSendSmsOptions {
  ttl?: number;
  codeLength?: number;
  requestId?: string;
}

export interface TelegramSendSmsResponse {
  id: string;
}

export interface TelegramCheckStatusResponse {
  isValid: boolean;
}

export interface TelegramCheckSendAbilityResponse {
  ok: boolean;
  requestId: string;
  error?: string;
}

export interface TelegramRevokeResponse {
  success: boolean;
}

// aero
export interface SmsAeroConfig {
  email: string;
  apiKey: string;
  sign: string;
}

// twilio
export interface TwilioConfig {
  accountId: string;
  authToken: string;
  from: string;
}

// tg
export interface TelegramProviderConfig {
  httpService: HttpService;
  token: string;
  from: string;
  logger: ReturnType<typeof pino>;
  dailyEstimatedCost?: number;
}