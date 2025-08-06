import { createClient } from 'redis'
import env from '../../env'

export const redisClient = createClient({
  socket: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
  },
  password: env.REDIS_PASSWORD,
  // database: env.REDIS_DB ?? 0, // <- TODO проставить
  // prefix: env.REDIS_KEY_PREFIX ?? '',
})

redisClient.on('error', (err: Error) => {
  console.error('❌ Redis Error:', err)
})

await redisClient.connect()
