import { injectable } from 'inversify';
import { createEventDefinition, EventBus } from 'ts-bus';
import { BusEvent, EventCreatorFn } from 'ts-bus/types';
import { CommandLineInterfaceParameter, CommandLineInterfaceOption } from './Contracts/OutputContract';

/*
|--------------------------------------------------------------------------
| Definitions
|--------------------------------------------------------------------------
*/

/**
 * An event definition for displaying the current version.
 */
export const outputVersion = createEventDefinition()('output:version');

/**
 * An event definition for displaying help usage.
 */
export const outputHelp = createEventDefinition<{
  parameters: CommandLineInterfaceParameter[];
  options: CommandLineInterfaceOption[];
}>()('output:help');

/**
 * An event definition for logging a generic informational message.
 */
export const outputMessage = createEventDefinition<{
  level: LogLevel;
  content: string | Error;
}>()('output:message');

/*
|--------------------------------------------------------------------------
| Bus
|--------------------------------------------------------------------------
*/

/**
 * The application's event bus.
 */
@injectable()
export class Bus {
  protected bus: EventBus;

  constructor() {
    this.bus = new EventBus();
  }

  /**
   * Emits the given event.
   */
  emit(event: BusEvent<any>, meta?: any): this {
    this.bus.publish(event, meta);
    return this;
  }

  /**
   * Adds an handler for the given event.
   */
  on<T extends BusEvent>(ev: EventCreatorFn<T>, handler: (e: ReturnType<typeof ev>) => void): this {
    this.bus.subscribe<T>(ev, handler);
    return this;
  }

  /**
   * Emits a generic message event.
   */
  log(level: LogLevel, content: string | Error): this {
    return this.emit(outputMessage({ level, content }));
  }

  /**
   * Emits a message event of type fatal.
   */
  fatal(content: string | Error): this {
    return this.log('fatal', content);
  }

  /**
   * Emits a message event of type warning.
   */
  warning(content: string | Error): this {
    return this.log('fatal', content);
  }

  /**
   * Emits a message event of type success.
   */
  success(content: string | Error): this {
    return this.log('success', content);
  }

  /**
   * Emits a message event of type info.
   */
  info(content: string | Error): this {
    return this.log('info', content);
  }

  /**
   * Emits a message event of type debug.
   */
  debug(content: string | Error): this {
    return this.log('debug', content);
  }
}

/**
 * Possible logging levels.
 */
export type LogLevel = 'fatal' | 'error' | 'warning' | 'success' | 'info' | 'debug';

/**
 * The singleton bus instance.
 */
export const bus = new Bus();
