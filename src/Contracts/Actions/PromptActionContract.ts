import { BaseActionContract } from './ActionContract';
import { DirectPromptOptions } from '@/Prompt';

/**
 * Asks for user input.
 */
export interface PromptActionContract extends BaseActionContract<'prompt'> {
  /**
   * A list of prompt options from Enquirer.
   */
  prompts: DirectPromptOptions | DirectPromptOptions[] | false;
}
