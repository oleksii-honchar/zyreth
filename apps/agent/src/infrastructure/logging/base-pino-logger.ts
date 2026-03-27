/* eslint-disable @typescript-eslint/no-explicit-any */
import { LoggerService } from '@nestjs/common';

/**
 * Abstract base for Pino-backed app logging (nestjs-example LoggingModule pattern).
 */
export abstract class BasePinoLogger implements LoggerService {
  abstract setContext(context: string): void;

  abstract setPrefix(prefix: string): void;

  abstract addMetadata(metadata: Record<string, unknown>): void;

  abstract debug(message: any, ...optionalParams: any[]): void;

  abstract error(message: any, ...optionalParams: any[]): void;

  abstract fatal(message: any, ...optionalParams: any[]): void;

  abstract log(message: any, ...optionalParams: any[]): void;

  abstract info(message: any, ...optionalParams: any[]): void;

  abstract verbose(message: any, ...optionalParams: any[]): void;

  abstract warn(message: any, ...optionalParams: any[]): void;

  abstract trace(message: any, ...optionalParams: any[]): void;

  abstract child(bindings: Record<string, unknown>): BasePinoLogger;

  abstract bindings(): Record<string, unknown>;

  abstract flush(): void;

  abstract get level(): string;
  abstract set level(value: string);

  abstract get levelVal(): number;

  abstract get useOnlyCustomLevels(): boolean;
}
