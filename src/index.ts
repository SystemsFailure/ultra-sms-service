import { serve } from '@hono/node-server'

import env from './env'

import app from './app'

const port = env.PORT || 3000

serve({
  fetch: app.fetch,
  port: Number(port),
})

// eslint-disable-next-line no-console
console.log(`🔥 Hono server running at http://localhost:${port}`)
