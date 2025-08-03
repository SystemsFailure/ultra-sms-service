import { SmsProvider } from "../@types";

export interface ProviderSelectionStrategy {
  selectProvider(phone: string, providers: SmsProvider[]): SmsProvider;
}