import { CommonOptions } from 'execa';
import { Action, ContextAware, Name } from '@/exports';

export class Execute<Context = any> extends Action<Context> {
  public handler = Name.Handler.Execute;
  public name = 'command execution';
  public title = 'Executing a command...';
  public command?: ContextAware<string>;
  public args: ContextAware<string | string[], Context> = [];
  public options: ContextAware<CommonOptions<'utf8'>, Context> = {};

  /**
   * Executes the given command.
   */
  public run(command: ContextAware<string, Context>): Execute<Context> {
    this.command = command;
    return this;
  }

  /**
   * Defines the command line arguments to pass to the command.
   */
  public withArguments(args: ContextAware<string | string[], Context>): Execute<Context> {
    this.args = args;
    return this;
  }

  /**
   * Defines the options to use.
   *
   * @see https://github.com/sindresorhus/execa#options
   */
  public withOptions(options: ContextAware<CommonOptions<'utf8'>, Context>): Execute<Context> {
    this.options = options;
    return this;
  }
}
