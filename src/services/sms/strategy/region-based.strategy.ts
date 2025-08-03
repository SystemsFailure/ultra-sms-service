import { SmsProvider } from "../@types";
import { ProviderSelectionStrategy } from "./@types";

// Пример: стратегия выбора по региону номера
export class RegionBasedStrategy implements ProviderSelectionStrategy {
  selectProvider(phone: string, providers: SmsProvider[]): SmsProvider {
    const isRuNumber = phone.startsWith('+7'); // упрощённо
    if (isRuNumber) {
      // возвращаем провайдер для РФ, если есть
      const ruProvider = providers.find(p => p.name === 'aero' || p.name === 'green');
      if (ruProvider) return ruProvider;
    }
    // Иначе fallback на twilio
    return providers.find(p => p.name === 'twilio')!;
  }
}