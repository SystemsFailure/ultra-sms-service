import type { MiddlewareHandler, Schema } from 'hono'

import { OpenAPIHono } from '@hono/zod-openapi'
import { cors } from 'hono/cors'
import { notFound, onError } from 'stoker/middlewares'
import { defaultHook } from 'stoker/openapi'

import type { AppBindings, AppOpenAPI } from '../types'

import env from '../env'
import { csrfGuard } from '../../src/middlewares/csrf-guard'
import { pinoLogger } from '../../src/middlewares/pino.logger'

export function createRouter(): AppOpenAPI {
  return new OpenAPIHono<AppBindings>({
    strict: false,
    defaultHook,
  })
}

export default function createApp() {
  const app = createRouter()

  app.use('*', cors({
    origin: env.NODE_ENV === 'development'
      ? env.CORS_ORIGINS
      : env.CORS_ORIGINS.filter(origin => !origin.includes('localhost')),
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'x-signature'],
    credentials: true,
  }))

  app
    .use(pinoLogger())
    .use(csrfGuard())

  app.notFound(notFound)
  app.onError(onError)
  return app
}

export function createTestApp<_S extends Schema>(router: AppOpenAPI) {
  return createApp().route('/api', router)
}

export function createProtectedRouter(middleware: MiddlewareHandler<AppBindings>): AppOpenAPI {
  const router = createRouter()
  const protectedRouter = router.use('*', middleware)
  return protectedRouter as AppOpenAPI
}
