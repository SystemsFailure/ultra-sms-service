import { z } from 'zod'
import { RedisService } from './redis.service'
import env from '../../env'

// Валидация параметров
const phoneCodeSchema = z.object({
  phone: z.string().min(8), // можно усилить
  code: z.string().min(4),
})

const phoneSchema = z.object({
  phone: z.string().min(8),
})

type TelegramRequest = {
  requestId: string;
  expiresAt: number;
};

type SavePhoneCodeInput = z.infer<typeof phoneCodeSchema>
type GetDelPhoneCodeInput = z.infer<typeof phoneSchema>

export class PhoneCodeRedisStorage {
  private redis: RedisService

  constructor(redis: RedisService) {
    this.redis = redis
  }

  async save({ phone, code }: SavePhoneCodeInput): Promise<void> {
    phoneCodeSchema.parse({ phone, code }) // валидация

    await this.redis.set(phone, code, { ttl: Number(env.PHONE_CODE_EXPIRE) })
  }

  async get({ phone }: GetDelPhoneCodeInput): Promise<string | null> {
    phoneSchema.parse({ phone })

    return await this.redis.get<string>(phone)
  }

  async del({ phone }: GetDelPhoneCodeInput): Promise<void> {
    phoneSchema.parse({ phone })

    await this.redis.del(phone)
  }

  async saveTelegramRequest(phone: string, data: TelegramRequest): Promise<void> {
    phoneSchema.parse({ phone });

    await this.redis.set(`tg_request:${phone}`, JSON.stringify(data), { ttl: 3600 });
  }

  async getTelegramRequest(phone: string): Promise<TelegramRequest | null> {
    phoneSchema.parse({ phone });

    const raw = await this.redis.get<string>(`tg_request:${phone}`);
    return raw ? JSON.parse(raw) : null;
  }

  async delTelegramRequest(phone: string): Promise<void> {
    phoneSchema.parse({ phone });

    await this.redis.del(`tg_request:${phone}`);
  }

  // Универсальный интерфейс доступа (table-style)
  methods = {
    phoneCode: {
      save: this.save.bind(this),
      get: this.get.bind(this),
      del: this.del.bind(this),
    },
    telegram: {
      save: this.saveTelegramRequest.bind(this),
      get: this.getTelegramRequest.bind(this),
      del: this.delTelegramRequest.bind(this),
    },
  }

  getMethod(table: keyof typeof this.methods) {
    return this.methods[table]
  }
}

/*
  Пример использования:

  import { RedisService } from './redis/service'
  import { PhoneCodeRedisStorage } from './redis/phone-code.storage'

  const redis = new RedisService({ prefix: 'sms', defaultTTL: 60 })

  const storage = new PhoneCodeRedisStorage(redis)

  await storage.save({ phone: '+79998887766', code: '1234' })

  const code = await storage.get({ phone: '+79998887766' })

  await storage.del({ phone: '+79998887766' })

*/