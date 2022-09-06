/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Logger,
  QueryRunner,
  AdvancedConsoleLogger,
  LoggerOptions
} from 'typeorm';

export class TypeormLogger extends AdvancedConsoleLogger implements Logger {
  constructor(options?: LoggerOptions) {
    super(options);
  }

  logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner): void {
    super.logQuery(`${(query.length > 50) ? query.substring(0, 50) + '...' : query}`, parameters, queryRunner);
  }
}
