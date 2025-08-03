import { PhoneCodeRedisStorage } from '../../../lib/redis/phone-code.storage';
import { PinoLogger } from 'hono-pino';
import { SmsProvider } from '../@types';
import { ProviderSelectionStrategy } from '../strategy/@types';
import { SmsProviderFactory } from '../providers/factory/sms-provider.factory';

export class SmsFacade {
  private providers: SmsProvider[];
  private storage: PhoneCodeRedisStorage;
  private logger: PinoLogger;
  private strategy: ProviderSelectionStrategy;

  constructor(storage: PhoneCodeRedisStorage, logger: PinoLogger, strategy: ProviderSelectionStrategy, providerNames: string[]) {
    this.storage = storage;
    this.logger = logger;
    this.strategy = strategy;
    this.providers = providerNames.map(name => SmsProviderFactory.createProvider(name));
  }

  async healthCheck() {
    await Promise.all(
      this.providers.map(async (provider) => {
        const healthy = await provider.healthCheck();
        if (!healthy) throw new Error(`Provider ${provider.name} is not healthy`);
      })
    );
    this.logger.info('All providers healthy');
  }

  async sendSms(phone: string, text: string): Promise<any> {
    const provider = this.strategy.selectProvider(phone, this.providers);
    this.logger.info(`Selected provider ${provider.name} for phone ${phone}`);
    try {
      return await provider.sendSms(phone, text);
    } catch (err) {
      this.logger.error(`Error sending SMS with ${provider.name}`, err);
      throw err;
    }
  }
}


/*
  Пример использования:

  import { SmsFacade } from './SmsFacade';
  import { RegionBasedStrategy } from './ProviderSelectionStrategy';
  import { RedisStorage } from '../storage/RedisStorage';
  import { Logger } from '../utils/Logger';

  const redisStorage = new RedisStorage();
  const logger = new Logger();
  const strategy = new RegionBasedStrategy();

  const smsFacade = new SmsFacade(redisStorage, logger, strategy, ['green', 'twilio', 'aero', 'telegram']);

  export default smsFacade;
*/