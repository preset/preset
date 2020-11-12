import { Name } from '@/Container';
import { ContextAware } from '@/Contracts/PresetContract';
import { PromptOptions } from '@/prompt';
import { Action } from '../Action';

/**
 * Prompts the user for information.
 */
export class Prompt extends Action {
  public handler = Name.Handler.Prompt;
  public name = 'prompt';
  public title = false as false;
  public prompts: Map<string, Partial<PromptOptions>> = new Map();

  /**
   * Adds a prompt for the user.
   *
   * @param name The variable in which the prompt result will be stored.
   * @param options The prompt options. https://github.com/enquirer/enquirer#prompt-options
   *
   * @see https://github.com/enquirer/enquirer#prompt-options
   */
  public add(name: string, options: Partial<PromptOptions> = {}): this {
    this.prompts.set(name, options);
    return this;
  }

  /**
   * Asks the user for something.
   *
   * @param name The value name that will be set in the prompts property.
   * @param message The question to ask.
   * @param initial The default value.
   * @param options The prompt options. https://github.com/enquirer/enquirer#prompt-options
   *
   * @see https://github.com/enquirer/enquirer#prompt-options
   */
  input(name: string, message: ContextAware<string>, initial?: ContextAware<string>, options: Partial<PromptOptions> = {}): Prompt {
    return this.add(name, {
      type: 'input',
      initial,
      message,
      ...options,
    });
  }

  /**
   * Asks the user for confirmation.
   *
   * @param name The value name that will be set in the prompts property.
   * @param message The question to ask.
   * @param initial The default value.
   * @param options The prompt options. https://github.com/enquirer/enquirer#prompt-options
   *
   * @see https://github.com/enquirer/enquirer#prompt-options
   */
  confirm(
    name: string,
    message: ContextAware<string>,
    initial: ContextAware<boolean> = false,
    options: Partial<PromptOptions> = {},
  ): Prompt {
    return this.add(name, {
      type: 'confirm',
      initial,
      message,
      ...options,
    });
  }

  /**
   * Asks the user for confirmation.
   *
   * @param name The value name that will be set in the prompts property.
   * @param message The question to ask.
   * @param choices A tuple which first value is the truthy one and the second the falsy.
   * @param initial The default value.
   * @param options The prompt options. https://github.com/enquirer/enquirer#prompt-options
   *
   * @see https://github.com/enquirer/enquirer#prompt-options
   */
  toggle(
    name: string,
    message: ContextAware<string>,
    choices: [string, string],
    initial: ContextAware<boolean> = false,
    options: Partial<PromptOptions> = {},
  ): Prompt {
    return this.add(name, {
      // @ts-ignore // I have no clue
      type: 'toggle',
      initial,
      message,
      enabled: choices[0],
      disabled: choices[1],
      ...options,
    });
  }
}
