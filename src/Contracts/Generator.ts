import { Action } from './Action';
import { Context } from './Context';

export interface Generator {
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
  prompts?: (context: Context) => Promise<void> | void;

  /**
   * A list of actions to execute.
   */
  actions: (context: Context) => Promise<Action[]> | Action[];
}
