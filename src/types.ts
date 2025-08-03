import type { OpenAPIHono, RouteConfig, RouteHandler } from '@hono/zod-openapi'
import type { PinoLogger } from 'hono-pino'

// import type { CookieOptions } from './utils/cookies'

export interface AppBindings {
  Variables: {
    logger: PinoLogger
  }
};

export type AppOpenAPI = OpenAPIHono<AppBindings>

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<R, AppBindings>

export type AppSuccessHandler<R extends RouteConfig> = RouteHandler<
  Omit<R, 'responses'> & {
    responses: Pick<R['responses'], 200 | 201 | 204>
  },
  AppBindings
>

// export type ExtendedCookieOptions = CookieOptions & {
//   domain?: string
// }
