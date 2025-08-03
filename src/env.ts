import { expand } from 'dotenv-expand'
import { z } from 'zod'
import { config } from 'dotenv'
import path from 'node:path'

expand(config({
  path: path.resolve(
    process.cwd(),
    // eslint-disable-next-line node/no-process-env
    process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
  ),
}))


const EnvSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.string().default('development'),
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:4321,http://localhost:4323,http://localhost:4173')
    .transform(val => val.split(',')),
  APP_ENV: z.enum(['local', 'development', 'production']).default('local'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']),
  X_SIGNATURE: z.string().min(32, 'X-Signature must be at least 32 characters long'),
  ENABLE_SCALAR_API_DOCS: z.enum(['true', 'false']).default('false'),
  
  // auth-service/variables
  AUTH_X_SECRET_TOKEN: z.string().default('V1StGXR8_Z5jdHi6B-myT'),


  // redis/variables
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(63790),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.coerce.number().optional(),
  REDIS_KEY_PREFIX: z.string().default('billing:'),
})

export type env = z.infer<typeof EnvSchema>

// eslint-disable-next-line ts/no-redeclare, node/no-process-env
const { data: env, error } = EnvSchema.safeParse(process.env)

if (error) {
  console.error('❌ Invalid env:')
  process.exit(1)
}

export default env!
