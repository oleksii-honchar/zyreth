/**
 * HTTP logging: nestjs-pino (LoggerModule) + app.useLogger(Logger) in main.ts.
 * Config: node `config` package merged into ConfigService (examples/nest-js pattern).
 */

import { createRequire } from 'node:module';

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';

import { OpenAiController } from '@/infrastructure/controllers/openai.controller';
import { LoggingModule } from '@/infrastructure/logging/logger.module';
import { pinoLoggerConfigFactory } from '@/infrastructure/logging/pino-logger-config.factory';
import { MastraAgentService } from '@/infrastructure/services/mastra-agent.service';
import { RunPromptUseCase } from '@/use-cases/run-prompt.use-case';

const requireConfig = createRequire(__filename);

const configLoader = (): Record<string, unknown> => {
  const nodeConfig = requireConfig('config') as unknown as {
    util: { toObject: () => unknown };
  };
  return nodeConfig.util.toObject() as Record<string, unknown>;
};

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configLoader],
      isGlobal: true,
      envFilePath: process.env.ENV_FILE || '.env',
    }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: pinoLoggerConfigFactory,
    }),
    LoggingModule,
  ],
  controllers: [OpenAiController],
  providers: [MastraAgentService, RunPromptUseCase],
})
export class AppModule {}
