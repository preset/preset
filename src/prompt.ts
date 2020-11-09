import { Prompt } from '@poppinss/prompts/build/src/Base';
import enq from 'enquirer';
import { color } from './utils';

/**
 * Since the typings for `enquirer` package is badly broken, we
 * need to cast it to any to make it usable
 */
const enquirer = enq as any;

/**
 * Uses the `enquirer` package to prompt user for input. The `$prompt`
 * method is invoked by the extended `Prompt` class.
 */
export class CustomPrompt extends Prompt {
  protected async prompt(options: any): Promise<any> {
    options = Object.assign({ name: 'prompt' }, options);
    options.prefix = `[ ${color.yellow('question')} ] `;

    const output = await enquirer.prompt(options);
    return output[options.name];
  }
}

export { Prompt };
