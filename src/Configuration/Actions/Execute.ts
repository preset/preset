import { CommonOptions } from 'execa';
import { Action, ContextAware, Name } from '@/exports';

export class Execute extends Action {
  public handler = Name.Handler.Execute;
  public name = 'command execution';
  public title = 'Executing a command...';
  public command?: ContextAware<string>;
  public args: ContextAware<string | string[]> = [];
  public options: ContextAware<CommonOptions<'utf8'>> = {};

  /**
   * Executes the given command.
   */
  public run(command: ContextAware<string>): this {
    this.command = command;
    return this;
  }

  /**
   * Defines the command line arguments to pass to the command.
   */
  public withArguments(args: ContextAware<string | string[]>): this {
    this.args = args;
    return this;
  }

  /**
   * Defines the options to use.
   *
   * @see https://github.com/sindresorhus/execa#options
   */
  public withOptions(options: ContextAware<CommonOptions<'utf8'>>): this {
    this.options = options;
    return this;
  }
}
