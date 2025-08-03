import { redisClient } from './client'
import type { RedisServiceOptions, CacheSetOptions, Serializer } from './types'

// дефолтный сериализатор: хранит данные как JSON-строки
const defaultSerializer: Serializer = {
  serialize: JSON.stringify,
  deserialize: JSON.parse,
}

export class RedisService {
  private prefix: string
  private defaultTTL?: number
  private serializer: Serializer

  constructor(options?: RedisServiceOptions, serializer: Serializer = defaultSerializer) {
    // если указан префикс (например, "sms"), добавляем ":" после него
    this.prefix = options?.prefix ? `${options.prefix}:` : ''
    this.defaultTTL = options?.defaultTTL
    this.serializer = serializer
  }

  // добавляет префикс к ключу (например: sms:user:123)
  private withPrefix(key: string) {
    return `${this.prefix}${key}`
  }

  // устанавливает значение по ключу с возможностью указать TTL
  async set<T>(key: string, value: T, options?: CacheSetOptions): Promise<void> {
    const k = this.withPrefix(key)
    const v = this.serializer.serialize(value)
    const ttl = options?.ttl ?? this.defaultTTL

    if (ttl) {
      // TTL — время жизни в секундах
      await redisClient.set(k, v, { EX: ttl })
    } else {
      await redisClient.set(k, v)
    }
  }

  // получает значение по ключу и десериализует его
  async get<T = unknown>(key: string): Promise<T | null> {
    const k = this.withPrefix(key)
    const value = await redisClient.get(k)
    if (!value) return null

    try {
      return this.serializer.deserialize(value) as T
    } catch (e) {
      // если не удалось распарсить (например кто-то записал сырой текст)
      console.error('Failed to deserialize Redis value:', e)
      return null
    }
  }

  // удаляет один или несколько ключей
  async del(key: string | string[]): Promise<void> {
    const keys = Array.isArray(key) ? key.map(k => this.withPrefix(k)) : [this.withPrefix(key)]
    await redisClient.del(keys)
  }

  // проверяет наличие ключа (true/false)
  async has(key: string): Promise<boolean> {
    const exists = await redisClient.exists(this.withPrefix(key))
    return exists === 1
  }

  // возвращает оставшееся время жизни ключа в секундах, если есть
  async ttl(key: string): Promise<number | null> {
    const ttl = await redisClient.ttl(this.withPrefix(key))
    return ttl >= 0 ? ttl : null
  }

  // инкрементирует значение по ключу (для счётчиков, например)
  async incr(key: string): Promise<number> {
    return redisClient.incr(this.withPrefix(key))
  }

  // устанавливает TTL для уже существующего ключа
  async expire(key: string, seconds: number): Promise<boolean> {
    const result = await redisClient.expire(this.withPrefix(key), seconds)
    return result === 1
  }
}
