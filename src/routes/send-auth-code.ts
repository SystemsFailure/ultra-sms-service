import { z } from 'zod'
import { createRoute } from '@hono/zod-openapi'
import * as HttpStatusCodes from 'stoker/http-status-codes'
import { createRouter } from '../lib/create-app'
import type { Context } from 'hono'
import { TelegramProvider } from 'services/sms/providers/telegram-gateway.provider'
import { SmsProvider } from 'services/sms/@types'
import { PhoneCodeRedisStorage } from 'lib/redis/phone-code.storage'
import pino from 'pino'
import { HttpService } from 'services/http/http.service'
import { RedisService } from 'lib/redis/redis.service'
import { TelegramFallbackStrategy } from 'services/sms/strategy/telegram-fallback.strategy'

export const CheckAuthCodeSchema = z.object({
  phone: z.string().min(1, 'Phone is required'),
  code: z.string().min(1, 'Code is required'),
})

const router = createRouter()

export type CheckAuthCodeInput = z.infer<typeof CheckAuthCodeSchema>

router.openapi(
  createRoute({
    tags: ['Auth'],
    method: 'post',
    path: '/check-auth-code',
    summary: 'Проверка кода авторизации по телефону',
    description: 'Проверяет код, отправленный на телефон через SMS',
    // request: CheckAuthCodeSchema,
    responses: {
      [HttpStatusCodes.OK]: {
        description: 'Доступ разрешён или нет',
        content: {
          'application/json': {
            schema: z.object({ access: z.boolean() }),
            // schema: z.object({ access: z.boolean() }).toJSON(),
          },
        },
      },
      [HttpStatusCodes.BAD_REQUEST]: {
        description: 'Ошибка валидации или отсутствуют параметры',
        content: {
          'application/json': {
            schema: z.object({
              code: z.number(),
              error: z.string(),
              message: z.string(),
            }),
          },
        },
      },
      [HttpStatusCodes.INTERNAL_SERVER_ERROR]: {
        description: 'Ошибка сервера',
      },
    },
  }),
  async (c: Context) => {
    try {
      // валидируем и парсим тело
      const input: CheckAuthCodeInput = await c.req.json().then(CheckAuthCodeSchema.parse)

      const logger: ReturnType<typeof pino> = pino({ name: 'send-sms-logger' });
      
      const httpService = new HttpService()
      const telegramProvider: TelegramProvider = new TelegramProvider(
        { httpService, from: '', token: '', dailyEstimatedCost: 10, logger }
      )
      const storage: PhoneCodeRedisStorage = new PhoneCodeRedisStorage(
        new RedisService()
      )

      const telegramFallbackStrategy = new TelegramFallbackStrategy(
        telegramProvider,
        [],
        storage,
        logger,
      )

      const result = await telegramFallbackStrategy.sendAuthCode(
        input.phone,
        input.code,
        {
          authCode: input.code,
          payload: '',
        },
      )
      return c.json({ result }, HttpStatusCodes.OK)
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return c.json(
          { code: HttpStatusCodes.BAD_REQUEST, error: 'INVALID_DATA', message: error.errors.map(e => e.message).join(', ') },
          HttpStatusCodes.BAD_REQUEST,
        )
      }
      if (error.code === 400) {
        return c.json(error, HttpStatusCodes.BAD_REQUEST)
      }
      // logger.error({ code: 'ROUTE_CHECK_AUTH_CODE', error, body: await c.req.json() })
      return c.text('Internal Server Error', HttpStatusCodes.INTERNAL_SERVER_ERROR)
    }
  }
)

export default router