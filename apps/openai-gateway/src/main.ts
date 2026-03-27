import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import config from 'config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const logger = app.get(Logger);
  app.useLogger(logger);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: true,
    }),
  );

  const port = config.get<number>('runtime.port') ?? 3002;
  await app.listen(port);
  logger.log(`Zyreth OpenAI gateway listening on http://localhost:${port}`);
}

bootstrap().catch((error) => {
  // Fallback to console if logger is not available
  // eslint-disable-next-line no-console
  console.error('Failed to bootstrap Zyreth OpenAI gateway', error);
  process.exit(1);
});

