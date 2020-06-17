import { Action } from '../../Action/Action';
import { ContextContract } from './ContextContract';
import { Input, Output, flags, args } from '@oclif/parser';

export interface GeneratorContract {
  /**
   * The name of the preset.
   */
  name: string;

  /**
   * The path that contain the templates, relative to the preset.
   */
  templates?: string;

  /**
   * A list of prompts messages.
   */
  prompts?: (context: ContextContract) => Promise<void> | void;

  /**
   * A list of actions to execute.
   */
  actions: (context: ContextContract) => Promise<Action[]> | Action[];

  /**
   * A method that indicates how to parse extra command line arguments.
   *
   * @param argv
   * @param options
   */
  parse?: <T>() => {
    flags?: flags.Input<T>;
    args?: args.Input;
  };
}
