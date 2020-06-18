import { DirectPromptOptions } from '../..';
import { ActionContract } from '.';

/**
 * Ask for user input.
 */
export interface PromptActionContract extends ActionContract<'prompt'> {
  /**
   * A list of prompt options from Enquirer.
   */
  prompts: DirectPromptOptions | DirectPromptOptions[];
}
