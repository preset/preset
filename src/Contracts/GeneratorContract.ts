import { ContextContract } from './ContextContract';
import { flags, args } from '@oclif/parser';

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
   * A list of actions to execute.
   */
  actions: (context: ContextContract) => Promise<void[]> | void[];
  // actions: (context: ContextContract) => Promise<Action[]> | Action[];

  /**
   * A method that indicates how to parse extra command line arguments.
   *
   * @param argv
   * @param options
   */
  parse?: <T>(
    context: Partial<ContextContract>
  ) => {
    flags?: flags.Input<T>;
    args?: args.Input;
  };

  /**
   * Message hooks.
   */
  messages?: {
    /**
     * One or more messages to display before the action is executed.
     */
    before?: string | string[];

    /**
     * One or more messages to display after the action is executed.
     */
    after?: string | string[];
  };
}
