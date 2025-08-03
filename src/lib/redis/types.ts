export type RedisKeyPrefix = string

export interface RedisServiceOptions {
  prefix?: RedisKeyPrefix
  defaultTTL?: number // в секундах
}

export interface CacheSetOptions {
  ttl?: number
}

export interface Serializer<T = any> {
  serialize: (data: T) => string
  deserialize: (data: string) => T
}
