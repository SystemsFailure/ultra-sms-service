import { redisClient } from '../redis/client'

async function test() {
  await redisClient.connect()
  await redisClient.set('test:key', 'Hello Redis', { EX: 10 })
  const val = await redisClient.get('test:key')
  console.log('✅ Redis Value:', val)
  await redisClient.quit()
}

test().catch(console.error)
