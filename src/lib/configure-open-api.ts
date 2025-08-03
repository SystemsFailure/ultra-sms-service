import { Scalar } from '@scalar/hono-api-reference'

import type { AppOpenAPI } from '../types'

import env from '../env'

import packageJSON from '../../package.json' with { type: 'json' }

// common config for metrics endpoint, all setup in /api/docs - this for common documentation
export default function configureOpenAPI(app: AppOpenAPI) {
  // if enabled API docs from env
  if (env.ENABLE_SCALAR_API_DOCS === 'true') {
    app.doc('/api/doc', {
      openapi: '3.0.0',
      info: {
        title: packageJSON.name ?? 'sms-service',
        version: packageJSON.version,
        description: packageJSON.description,
      },
      tags: [
        {
          name: 'sendSms',
          description: 'Логирование пользовательских действий на auth',
        },
        {
          name: 'Index',
          description: 'Тестовые и служебные эндпойнты',
        },
      ],
    })

    app.get('/api/ref', Scalar({
      url: '/api/doc',
      defaultHttpClient: {
        targetKey: 'shell',
        clientKey: 'curl',
      },
    }))
  }
}
