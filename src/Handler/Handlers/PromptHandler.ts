import { Prompt, Log, Color, ContextContract, PromptActionContract } from '../../';
import { HandlerContract } from '../';

export class PromptHandler implements HandlerContract<PromptActionContract> {
  async handle(action: PromptActionContract, context: ContextContract): Promise<void | never> {
    const prompts = Array.isArray(action.prompts) ? action.prompts : [action.prompts];
    Log.debug(`Prompting ${Color.keyword(prompts.length)} item(s).`);

    // Prompting each one, and adding their result in the
    // context.
    for (const prompt of prompts) {
      Log.debug(`Prompting ${Color.keyword(prompt?.name ?? 'unknown prompt')}.`);
      context.prompts[prompt.name] = await Prompt.prompt(prompt);
    }
  }
}
