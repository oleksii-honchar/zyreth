/**
 * Global BasePinoLogger via nestjs-pino (agent-rules-n-skills examples/nest-js pattern).
 */

import { Global, Module } from '@nestjs/common';

import { BasePinoLogger } from './base-pino-logger';
import { NestjsPinoLogger } from './nestjs-pino-logger';

@Global()
@Module({
  providers: [
    {
      provide: BasePinoLogger,
      useClass: NestjsPinoLogger,
    },
  ],
  exports: [BasePinoLogger],
})
export class LoggingModule {}
