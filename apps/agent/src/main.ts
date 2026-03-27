/**
 * Bootstrap: nestjs-pino Logger + Nest Logger for startup lines (examples/nest-js style).
 */

import 'reflect-metadata';

import { Logger as NestLogger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import config from 'config';
import { Logger } from 'nestjs-pino';

import { AppModule } from '@/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.useLogger(app.get(Logger));

  const nestLogger = new NestLogger('Main');
  nestLogger.log('[Main] Starting Zyreth OpenAI gateway');
  nestLogger.log(`[Main] Runtime folder: ${process.cwd()}`);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: true,
    }),
  );

  const port = config.get<number>('runtime.port') ?? 3002;
  await app.listen(port);
  nestLogger.log(`Zyreth OpenAI gateway listening on http://localhost:${port}`);
}

bootstrap().catch(error => {
  console.error('Failed to bootstrap Zyreth OpenAI gateway', error);
  process.exit(1);
});
