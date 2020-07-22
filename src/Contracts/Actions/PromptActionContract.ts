import { BaseActionContract } from './ActionContract';
import { PromptOptions as BasePromptOptions } from 'listr2';

export type PromptOptions<T extends boolean = false> = BasePromptOptions<T> & { name: string };

/**
 * Asks for user input.
 */
export interface PromptActionContract extends BaseActionContract<'prompt'> {
  /**
   * A list of prompt options from Enquirer.
   */
  prompts: PromptOptions | PromptOptions<true>[] | false;
}
