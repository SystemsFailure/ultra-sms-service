import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, Method } from 'axios'
import pino from 'pino'

const logger = pino({ name: 'HttpService' })

// Универсальные аргументы для запроса
export interface HttpRequestArgs {
  url: string
  method: Method
  params?: Record<string, any>
  data?: unknown
  headers?: Record<string, string>
  timeout?: number
}

// Ответ
export interface HttpResponse<T = unknown> {
  data: T
  status: number
  headers: Record<string, string>
}

// Интерфейс сервиса
export interface IHttpService {
  request<T = any>(args: HttpRequestArgs): Promise<HttpResponse<T>>
  get<T = any>(url: string, params?: Record<string, any>, headers?: Record<string, string>): Promise<T>
  post<T = any>(url: string, data?: any, params?: Record<string, any>, headers?: Record<string, string>): Promise<T>
}

// Основной Http-сервис
export class HttpService implements IHttpService {
  protected client: AxiosInstance

  constructor(config?: AxiosRequestConfig) {
    this.client = axios.create(config)

    // Interceptors (пример логгера)
    this.client.interceptors.request.use((req) => {
      logger.debug({ req }, '➡️ HTTP Request')
      return req
    })

    this.client.interceptors.response.use(
      (res) => {
        logger.debug({ status: res.status, url: res.config.url }, '⬅️ HTTP Response')
        return res
      },
      (error) => {
        logger.error({ error: error.message, url: error.config?.url }, '❌ HTTP Error')
        return Promise.reject(error)
      }
    )
  }

  async request<T = any>(args: HttpRequestArgs): Promise<HttpResponse<T>> {
    const res: AxiosResponse<T> = await this.client.request<T>({
      url: args.url,
      method: args.method,
      params: args.params,
      data: args.data,
      headers: args.headers,
      timeout: args.timeout,
    })

    return {
      data: res.data,
      status: res.status,
      headers: Object.fromEntries(
        Object.entries(res.headers).filter(
          ([, value]) => typeof value === 'string'
        ) as [string, string][]
      ),
    }
  }

  async get<T = any>(url: string, params?: Record<string, any>, headers?: Record<string, string>): Promise<T> {
    const res = await this.request<T>({ url, method: 'GET', params, headers })
    return res.data
  }

  async post<T = any>(
    url: string,
    data?: any,
    params?: Record<string, any>,
    headers?: Record<string, string>
  ): Promise<T> {
    const res = await this.request<T>({ url, method: 'POST', data, params, headers })
    return res.data
  }
}
