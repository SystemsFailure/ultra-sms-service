import { createRoute } from '@hono/zod-openapi'
import { z } from 'zod'
import type { Context } from 'hono'
import { jsonContent } from 'stoker/openapi/helpers'
import { SmsFacade } from 'services/sms/facade/sms.facade'
import * as HttpStatusCodes from 'stoker/http-status-codes'

const bodySchema = z.object({
  phone: z.string().min(8),
  code: z.string().min(4),
})

const responseSchema = z.object({ access: z.boolean() })

export default createRoute({
  method: 'post',
  path: '/check-auth-code',
  tags: ['Auth'],
  summary: 'Проверка авторизационного кода',
  request: { body: bodySchema },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(responseSchema, 'CheckAuthCodeResponse'),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(z.any(), 'BadRequest'),
  },
}, () => {
  
})
