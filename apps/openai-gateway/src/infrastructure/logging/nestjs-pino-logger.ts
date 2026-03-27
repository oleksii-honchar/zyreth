/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, Scope } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { storage, Store } from 'nestjs-pino/storage';

import { BasePinoLogger } from './base-pino-logger';

@Injectable({ scope: Scope.TRANSIENT })
export class NestjsPinoLogger implements BasePinoLogger {
  private prefix: string | undefined;

  constructor(private readonly pinoLogger: PinoLogger) {}

  setContext(context: string): void {
    this.pinoLogger.setContext(context);
  }

  setPrefix(prefix: string): void {
    this.prefix = prefix;
  }

  private formatMessage(message: any, ...optionalParams: any[]): [any, ...any[]] {
    if (!this.prefix) {
      return [message, ...optionalParams];
    }

    if (typeof message === 'object' && message !== null && !Array.isArray(message)) {
      if (optionalParams.length > 0 && typeof optionalParams[0] === 'string') {
        return [message, `[${this.prefix}] ${optionalParams[0]}`, ...optionalParams.slice(1)];
      }
      return [message, ...optionalParams];
    }

    if (typeof message === 'string') {
      return [`[${this.prefix}] ${message}`, ...optionalParams];
    }

    return [message, ...optionalParams];
  }

  addMetadata(metadata: Record<string, unknown>): void {
    if (!storage.getStore()) {
      storage.enterWith(new Store(this.pinoLogger.logger));
    }
    this.pinoLogger.assign(metadata);
  }

  log(message: any, ...optionalParams: any[]): void {
    this.info(message, ...optionalParams);
  }

  verbose(message: any, ...optionalParams: any[]): void {
    this.trace(message, ...optionalParams);
  }

  trace(message: any, ...optionalParams: any[]): void {
    const formatted = this.formatMessage(message, ...optionalParams);
    this.pinoLogger.trace(formatted[0], ...formatted.slice(1));
  }

  debug(message: any, ...optionalParams: any[]): void {
    const formatted = this.formatMessage(message, ...optionalParams);
    this.pinoLogger.debug(formatted[0], ...formatted.slice(1));
  }

  info(message: any, ...optionalParams: any[]): void {
    const formatted = this.formatMessage(message, ...optionalParams);
    this.pinoLogger.info(formatted[0], ...formatted.slice(1));
  }

  warn(message: any, ...optionalParams: any[]): void {
    const formatted = this.formatMessage(message, ...optionalParams);
    this.pinoLogger.warn(formatted[0], ...formatted.slice(1));
  }

  error(message: any, ...optionalParams: any[]): void {
    const formatted = this.formatMessage(message, ...optionalParams);
    this.pinoLogger.error(formatted[0], ...formatted.slice(1));
  }

  fatal(message: any, ...optionalParams: any[]): void {
    const formatted = this.formatMessage(message, ...optionalParams);
    this.pinoLogger.fatal(formatted[0], ...formatted.slice(1));
  }

  child(bindings: Record<string, unknown>): BasePinoLogger {
    const childLogger = this.pinoLogger.logger.child(bindings);
    return new NestjsPinoLogger({ logger: childLogger } as PinoLogger);
  }

  bindings(): Record<string, unknown> {
    return this.pinoLogger.logger.bindings();
  }

  flush(): void {
    this.pinoLogger.logger.flush();
  }

  get level(): string {
    return this.pinoLogger.logger.level as string;
  }

  set level(value: string) {
    this.pinoLogger.logger.level = value;
  }

  get levelVal(): number {
    return this.pinoLogger.logger.levelVal;
  }

  get useOnlyCustomLevels(): boolean {
    return this.pinoLogger.logger.useOnlyCustomLevels;
  }
}
