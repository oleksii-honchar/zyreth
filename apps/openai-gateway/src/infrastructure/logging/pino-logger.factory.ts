import pino, { type LoggerOptions } from 'pino';

export function createHttpLogger(context: string) {
  const environment = process.env.NODE_ENV ?? 'development';
  const level = process.env.LOG_LEVEL ?? (environment === 'production' ? 'info' : 'debug');

  const baseConfig: LoggerOptions = {
    level,
    messageKey: 'message',
    base: {
      context,
      environment,
    },
    timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
  };

  return pino(baseConfig);
}

