import { z } from '@hono/zod-openapi'
import * as HttpStatusPhrases from 'stoker/http-status-phrases'
import { createMessageObjectSchema } from 'stoker/openapi/schemas'

// zod errors messages
export const ZOD_ERROR_MESSAGES = {
  REQUIRED: 'Required',
  EXPECTED_NUMBER: 'Expected number, received nan',
  NO_UPDATES: 'No updates provided',
}

// zod codes
export const ZOD_ERROR_CODES = {
  INVALID_UPDATES: 'invalid_updates',
}

// custom error for security
export const SECURITY_CUSTOM_ERROR = {
  MISSING_REQUIRED_SECURITY_HEADER: 'Something went wrong (e4324_01)',
  INVALID_SECURITY_SIGNATURE: 'Something went wrong (e4324_02)',
}

// error for when not found schema
export const notFoundSchema = createMessageObjectSchema(HttpStatusPhrases.NOT_FOUND)

export const SKIP_MIDDLEWARE_PATH = [
  'auth'
]

// Энам и тип для списка доступных продуктов
export const ProvidersNames = {
  crm: 'Crm',
  planner: 'Planner',
  sender: 'Sender',
  sendbot: 'Sendbot', // alias для sender
  widget: 'Widget',
  logic: 'Logic',
} as const

export type ProviderName = typeof ProvidersNames[keyof typeof ProvidersNames]
