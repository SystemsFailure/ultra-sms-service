import configureOpenAPI from '../src/lib/configure-open-api'
import createApp from '../src/lib/create-app'
import index from '../src/routes/index'

const app = createApp()

configureOpenAPI(app)

const routes = [
  index,
] as const

routes.forEach((route) => {
  app.route('/api', route)
})

export type AppType = typeof routes[number]

export default app
