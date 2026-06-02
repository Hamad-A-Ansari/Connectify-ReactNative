export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel: LogLevel = __DEV__ ? 'debug' : 'warn';

export const logger = {
  debug: (...args: unknown[]) => {
    if (LOG_LEVELS.debug >= LOG_LEVELS[currentLevel]) console.log('[DEBUG]', ...args);
  },
  info: (...args: unknown[]) => {
    if (LOG_LEVELS.info >= LOG_LEVELS[currentLevel]) console.log('[INFO]', ...args);
  },
  warn: (...args: unknown[]) => {
    if (LOG_LEVELS.warn >= LOG_LEVELS[currentLevel]) console.warn('[WARN]', ...args);
  },
  error: (...args: unknown[]) => {
    if (LOG_LEVELS.error >= LOG_LEVELS[currentLevel]) console.error('[ERROR]', ...args);
  },
};
