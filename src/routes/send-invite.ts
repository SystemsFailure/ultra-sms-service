// import { createRoute } from '@hono/zod-openapi'
// import { z } from 'zod'
// import type { Context } from 'hono'
// import { HttpStatusCodes } from 'stoker/http-status-codes'
// import { jsonContent } from 'stoker/openapi/helpers'
// import { SmsFacade } from 'services/sms/facade/sms.facade'

// const bodySchema = z.object({
//   phone: z.string().min(8),
//   lang: z.string().optional(),
// })

// export default createRoute({
//   method: 'post',
//   path: '/send-invite',
//   tags: ['Invite'],
//   summary: 'Отправка приглашения',
//   request: { body: bodySchema },
//   responses: {
//     [HttpStatusCodes.OK]: jsonContent(z.object({ success: z.boolean() }), 'SendInviteResponse'),
//     [HttpStatusCodes.BAD_REQUEST]: jsonContent(z.any(), 'BadRequest'),
//   },
// }, async (c: Context) => {
//   const { phone, lang } = bodySchema.parse(c.req.json())
//   await (c.get('smsFacade') as SmsFacade).sendInvite(phone, lang)
//   return c.json({ success: true }, HttpStatusCodes.OK)
// })
