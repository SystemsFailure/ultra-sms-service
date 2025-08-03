import { createRoute } from '@hono/zod-openapi'
import * as HttpStatusCodes from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { createMessageObjectSchema } from 'stoker/openapi/schemas'

import { createRouter } from '../lib/create-app'

const index = createRouter()

import type { Context } from 'hono'

index.openapi(
  createRoute({
    tags: ['Health-check'],
    method: 'get',
    path: '/',
    summary: 'healthcheck',
    description: 'Проверка доступности sms-service',
    responses: {
      [HttpStatusCodes.OK]: jsonContent(
        createMessageObjectSchema('Hello world'),
        'healthcheck',
      ),
    },
  }),
  (c: Context) => c.json({ message: 'Сервис работает корректно!✅' }, HttpStatusCodes.OK),
)

export default index
