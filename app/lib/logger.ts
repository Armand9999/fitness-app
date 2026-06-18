type LogLevel = 'info' | 'warn' | 'error'
type LogMeta = Record<string, unknown>

const SENSITIVE_KEY_PATTERN = /(authorization|cookie|key|password|secret|token)/i
const MAX_STRING_LENGTH = 500

function sanitizeValue(value: unknown): unknown {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
    }
  }

  if (typeof value === 'string') {
    return value.length > MAX_STRING_LENGTH ? `${value.slice(0, MAX_STRING_LENGTH)}…` : value
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue)
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entryValue]) => [
        key,
        SENSITIVE_KEY_PATTERN.test(key) ? '[REDACTED]' : sanitizeValue(entryValue),
      ]),
    )
  }

  return value
}

export function sanitizeLogMeta(meta: LogMeta = {}) {
  return sanitizeValue(meta) as LogMeta
}

export function logEvent(level: LogLevel, event: string, meta: LogMeta = {}) {
  const payload = {
    level,
    event,
    timestamp: new Date().toISOString(),
    ...sanitizeLogMeta(meta),
  }

  const message = JSON.stringify(payload)
  if (level === 'error') console.error(message)
  else if (level === 'warn') console.warn(message)
  else console.info(message)
}

export function logError(event: string, error: unknown, meta: LogMeta = {}) {
  logEvent('error', event, { ...meta, error })
}

export function logWarning(event: string, meta: LogMeta = {}) {
  logEvent('warn', event, meta)
}

export function logInfo(event: string, meta: LogMeta = {}) {
  logEvent('info', event, meta)
}
