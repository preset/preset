import { Action } from '../Action/Action';
import { ContextContract } from './ContextContract';

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
  prompts?: (context: ContextContract) => Promise<void> | void;

  /**
   * A list of actions to execute.
   */
  actions: (context: ContextContract) => Promise<Action[]> | Action[];
}
