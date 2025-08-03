import { HttpService } from './http.service'
import type { HttpRequestArgs } from './http.service'

// Telegram Gateway специфический HTTP сервис
export class TelegramHttpService extends HttpService {
  private supportedMethods = new Set(['GET', 'POST'])

  async execute(method: string, args: Omit<HttpRequestArgs, 'method'>) {
    const m = method.toUpperCase()

    if (!this.supportedMethods.has(m)) {
      throw new Error(`HTTP method "${method}" is not supported by TelegramHttpService`)
    }

    return this.request({
      method: m as 'GET' | 'POST',
      ...args,
    })
  }
}


/*
  Пример использования:

  import { HttpService } from './services/http/http.service'
  import { TelegramHttpService } from './services/http/telegram-http.service'

  const http = new HttpService()
  const telegramHttp = new TelegramHttpService()

  // Обычный GET
  const user = await http.get('https://jsonplaceholder.typicode.com/users/1')

  // Telegram dynamic call
  await telegramHttp.execute('POST', {
    url: 'https://api.telegram.org/bot<TOKEN>/sendMessage',
    data: {
      chat_id: 123456,
      text: 'Привет!',
    },
  })

*/
