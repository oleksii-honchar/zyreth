import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import type { Params } from 'nestjs-pino';
import type { Options } from 'pino-http';
import pkg from '../../../package.json';

export const pinoLoggerConfigFactory = (configService: ConfigService): Params => {
  const serviceName = pkg.name;

  const environment = configService.get<string>('nodeEnv') ?? process.env.NODE_ENV ?? 'development';

  const isProduction = environment === 'production';

  const logLevel = configService.get<string>('logging.level') ?? process.env.LOG_LEVEL ?? 'info';

  const verboseFromConfig = configService.get<boolean | string>('logging.verbose');

  const isLocalLogVerbose =
    verboseFromConfig === true ||
    String(verboseFromConfig).toLowerCase() === 'true' ||
    process.env.VERBOSE?.toLowerCase() === 'true';

  const pinoHttpOptions: {
    level: string;
    messageKey?: string;
    timestamp?: () => string;
    base?: Record<string, unknown>;
    serializers?: Record<string, unknown>;
    transport?: { target: string; options: Record<string, unknown> };
  } = {
    level: logLevel,
    messageKey: 'message',
    timestamp: () => `,"timestamp":"${new Date(Date.now()).toISOString()}"`,
    base: {
      environment,
      service: serviceName,
    },
    serializers: {
      req: (request: Request) => ({
        method: request.method,
        url: request.url,
        path: request.url,
        parameters: request.params,
        machineId: request.headers?.['x-machine-id'],
        requestStartTimestamp: request.headers?.['x-request-start-timestamp'],
        requestHandleTimestamp: request.headers?.['x-request-handle-timestamp'],
      }),
      res: (response: Response) => ({
        statusCode: response.statusCode,
        responseTime: response.getHeader?.('x-response-time') || 0,
        totalTime: response.getHeader?.('x-total-time') || 0,
      }),
    },
  };

  if (!isProduction) {
    const pinoPrettyOptions: Record<string, unknown> = {
      colorize: true,
      messageKey: 'message',
      translateTime: 'yyyy-mm-dd HH:MM:ss',
      singleLine: false,
      ignore: 'pid,hostname',
    };

    if (!isLocalLogVerbose) {
      pinoPrettyOptions.include = 'level,name,message,timestamp';
    }

    pinoHttpOptions.transport = {
      target: 'pino-pretty',
      options: pinoPrettyOptions,
    };
  }

  return {
    pinoHttp: pinoHttpOptions as unknown as Options,
  };
};
