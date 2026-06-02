import * as Sentry from "@sentry/react-native";
import { Platform } from "react-native";

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel: LogLevel = __DEV__ ? 'debug' : 'warn';

/**
 * Extracts an Error object from logger arguments for Sentry reporting.
 * Looks for the first Error instance in the args list.
 */
function extractError(args: unknown[]): Error | undefined {
  for (const arg of args) {
    if (arg instanceof Error) return arg;
  }
  return undefined;
}

export const logger = {
  debug: (...args: unknown[]) => {
    if (LOG_LEVELS.debug >= LOG_LEVELS[currentLevel]) console.log('[DEBUG]', ...args);
  },
  info: (...args: unknown[]) => {
    if (LOG_LEVELS.info >= LOG_LEVELS[currentLevel]) console.log('[INFO]', ...args);
  },
  warn: (...args: unknown[]) => {
    if (LOG_LEVELS.warn >= LOG_LEVELS[currentLevel]) console.warn('[WARN]', ...args);

    // Add Sentry breadcrumb for warnings (native only)
    if (Platform.OS !== "web") {
      Sentry.addBreadcrumb({
        category: "logger",
        message: args.map(String).join(" "),
        level: "warning",
      });
    }
  },
  error: (...args: unknown[]) => {
    if (LOG_LEVELS.error >= LOG_LEVELS[currentLevel]) console.error('[ERROR]', ...args);

    // Capture exception in Sentry for production visibility (native only)
    if (Platform.OS !== "web") {
      const error = extractError(args);
      if (error) {
        Sentry.captureException(error, {
          extra: { context: args[0] },
        });
      } else {
        Sentry.captureMessage(args.map(String).join(" "), "error");
      }
    }
  },
};
