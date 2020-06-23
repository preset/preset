import { MessageNode, ActionNames, ActionsList } from '@poppinss/fancy-logs/build/src/contracts';
import { Logger as BaseLogger } from '@poppinss/fancy-logs';
import { Colors, FakeColors } from '@poppinss/colors';
// import figures from 'figures';
import fs from 'fs-extra';
import path from 'path';
import { Text } from '@supportjs/text';

interface LoggerOptions {
  debug: boolean;
  fake: boolean;
  color: boolean;
}

// We don't use dependency injection because we need to log outside of
// IoC scope, and this is already testable anyway thanks to Adonis' work.
class Logger {
  public colors!: Colors | FakeColors;
  protected _logger!: BaseLogger;
  protected _faking!: boolean;
  protected _debugging!: boolean;

  constructor() {
    this.configure({ color: true });
  }

  /**
   * Fake the logger.
   */
  public fake(): this {
    return this.configure({ fake: true, color: false });
  }

  /**
   * Gets the history of log messages.
   */
  get history(): string[] {
    return this._logger.logs;
  }

  /**
   * Checks if the DEBUG environment variable is contains "true", "*",
   * or the name of this package's binary.
   */
  private environmentWantsDebug(): boolean {
    const data = fs.readJsonSync(path.resolve(__dirname, '..', 'package.json'));
    const scopes = [<string>Object.keys(data.bin).shift(), '*', 'true'];
    const environmentDebug = process.env.DEBUG ?? '';

    return scopes.some(scope => environmentDebug.toLowerCase().trim().includes(scope));
  }

  /**
   * Configures the debugger.
   */
  configure({ fake = false, debug = false, color = true }: Partial<LoggerOptions> = {}): this {
    // Determines if we're faking logs - if yes, we don't actually log,
    // we just save history
    this._faking = fake ?? false;

    // Determines if we have to log debug messages
    this._debugging = debug === undefined ? this.environmentWantsDebug() : !!debug;

    // Creates the logger
    this._logger = new BaseLogger({
      fake,
      color,
      underline: true,
    });

    // Adds a debug action. Typings deny us to do so, but
    // we're pirates so we don't care.
    this._logger.actions = {
      ...this._logger.actions,
      // @ts-expect-error
      debug: {
        color: 'gray',
        // badge: figures.arrowRight,
        badge: '→',
        logLevel: 'info',
      },
    };

    // Sets the color system depending on the debug.
    this.colors = this._faking ? new FakeColors() : new Colors();

    return this;
  }

  /**
   * Determine if the logger is fake
   */
  public isFake(): boolean {
    return this._faking;
  }

  /**
   * Print success message
   */
  public success(message: Text | string | MessageNode, ...args: string[]): this {
    this.log('success', message, ...args);
    return this;
  }

  /**
   * Print skip message
   */
  public warn(message: Text | string | MessageNode, ...args: string[]): this {
    this.log('warn', message, ...args);
    return this;
  }
  /**
   * Print fatal message
   */
  public fatal(message: Text | string | Error | MessageNode, ...args: string[]): this {
    this.log('fatal', message, ...args);
    return this;
  }

  /**
   * Print info message
   */
  public info(message: Text | string | MessageNode, ...args: string[]): this {
    this.log('info', message, ...args);
    return this;
  }

  /**
   * Print a debug message
   */
  public debug(message: Text | string | MessageNode, ...args: string[]): this {
    if (!this._debugging) {
      return this;
    }

    // @ts-expect-error
    this.log('debug', message, ...args);
    return this;
  }

  /**
   *
   * @param level Print multiple messages
   * @param messages
   */
  public async multiple(
    level: ActionNames,
    messages?: string | string[] | (() => Promise<string | string[]>)
  ): Promise<this> {
    if (messages) {
      if (typeof messages === 'function') {
        messages = await messages();
      }

      if (!Array.isArray(messages)) {
        messages = [messages];
      }

      messages.forEach(item => Log._logger.log(level, item));
    }

    return this;
  }

  /**
   * Display an error message and exit the application
   */
  public exit(message: Text | string | MessageNode | Error, ...args: string[]): never {
    this.log('error', message, ...args);
    process.exit(0);
  }

  public log(
    name: keyof ActionsList,
    messageNode: Text | string | Error | MessageNode,
    ...args: string[]
  ): string | undefined {
    if (messageNode instanceof Text) {
      messageNode = messageNode.toString();
    }

    return this._logger.log(name, messageNode, ...args);
  }
}

// Creates the logger as a singleton
const Log = new Logger();

// Creates the color mapping, based on the logger
const Color = {
  debug: (text: any) => (Log.isFake() ? text : Log.colors.grey(text)),
  error: (text: any) => (Log.isFake() ? text : Log.colors.red(text)),
  directory: (text: any) => (Log.isFake() ? text : Log.colors.underline(text)),
  file: (text: any) => (Log.isFake() ? text : Log.colors.underline(text)),
  keyword: (text: any) => (Log.isFake() ? text : Log.colors.yellow(text)),
  resolvable: (text: any) => (Log.isFake() ? text : Log.colors.yellow(text)),
  link: (text: any) => (Log.isFake() ? text : Log.colors.underline(text)),
  preset: (text: any) => (Log.isFake() ? text : Log.colors.green(text)),
};

export { Log, Color };
