import { MessageNode, ActionNames } from '@poppinss/fancy-logs/build/src/contracts';
import { Logger as BaseLogger } from '@poppinss/fancy-logs';
import { Colors, FakeColors } from '@poppinss/colors';
import stripAnsi from 'strip-ansi';
import figures from 'figures';
import fs from 'fs';
import path from 'path';

interface LoggerOptions {
  debug: boolean;
  fake: boolean;
  color: boolean;
}

class Logger {
  public colors!: Colors | FakeColors;
  protected logger!: BaseLogger;
  protected faking!: boolean;
  protected debugging!: boolean;

  constructor() {
    this.configure();
  }

  /**
   * Fake the logger.
   */
  public fake(): this {
    return this.configure({ fake: true, color: false });
  }

  get logs(): string[] {
    return this.logger.logs;
  }

  /**
   * Configures the debugger.
   */
  configure({ fake, debug, color }: Partial<LoggerOptions> = {}): this {
    const data = JSON.parse(<string>(<unknown>fs.readFileSync(path.resolve(__dirname, '..', '..', 'package.json'))));
    const scopes = [Object.keys(data.bin).shift() ?? '', '*'];

    this.debugging = debug ?? false;
    if (undefined === debug) {
      this.debugging = scopes.some(scope => (process.env.DEBUG ?? '').includes(scope));
    }

    this.logger = new BaseLogger({ fake, color });
    this.logger.actions = {
      ...this.logger.actions,
      skip: {
        color: 'gray',
        badge: figures.radioOff,
        logLevel: 'info',
      },
    };

    this.colors = fake ? new FakeColors() : new Colors();
    this.faking = fake ?? false;

    return this;
  }

  /**
   * Determine if the logger is fake
   */
  public isFake(): boolean {
    return this.faking;
  }

  /**
   * Print success message
   */
  public success(message: string | MessageNode, ...args: string[]): this {
    this.logger.log('success', message, ...args);
    return this;
  }

  /**
   * Print skip message
   */
  public warn(message: string | MessageNode, ...args: string[]): this {
    this.logger.log('warn', message, ...args);
    return this;
  }
  /**
   * Print fatal message
   */
  public fatal(message: string | Error | MessageNode, ...args: string[]): this {
    this.logger.log('fatal', message, ...args);
    return this;
  }

  /**
   * Print info message
   */
  public info(message: string | MessageNode, ...args: string[]): this {
    this.logger.log('info', message, ...args);
    return this;
  }

  /**
   * Print a debug message
   */
  public debug(message: string | MessageNode, ...args: string[]): this {
    if (!this.debugging) {
      return this;
    }

    this.logger.log('skip', message, ...args);
    return this;
  }

  /**
   *
   * @param level Print multiple messages
   * @param messages
   */
  public multiple(level: ActionNames, messages?: string | string[]): this {
    if (messages) {
      if (!Array.isArray(messages)) {
        messages = [messages];
      }

      messages.forEach(item => Log.logger.log(level, item));
    }

    return this;
  }

  /**
   * Display an error message and exit the application
   */
  public exit(message: string | MessageNode | Error, ...args: string[]): never {
    this.logger.log('error', message, ...args);
    process.exit(0);
  }
}

const Log = new Logger();
// TODO clean up this shit xd
const Color = {
  directory: (text: string) => (Log.isFake() ? text : Log.colors.underline(text)),
  file: (text: string) => (Log.isFake() ? text : Log.colors.underline(text)),
  keyword: (text: string) => (Log.isFake() ? text : Log.colors.yellow(text)),
  link: (text: string) => (Log.isFake() ? text : Log.colors.cyan(text)),
  preset: (text: string) => (Log.isFake() ? text : Log.colors.cyan(text)),
};

export { Log, Color };
