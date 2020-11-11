import { ContextAware } from '@/Contracts/PresetContract';
import { Action } from '../Action';
import { CommonOptions } from 'execa';
import { Name } from '@/Container';

export class ExecuteCommand extends Action {
  public handler = Name.Handler.ExecuteCommand;
  public name = 'command execution';
  public title = 'Executing a command...';
  public commands?: ContextAware<string | string[]>;
  public args: ContextAware<string | string[]> = [];
  public options: ContextAware<CommonOptions<'utf8'>> = {};

  /**
   * Executes the given command.
   */
  public run(commands: ContextAware<string | string[]>): this {
    this.commands = commands;
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
