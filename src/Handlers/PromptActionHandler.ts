import { injectable } from 'inversify';
import { ActionHandlerContract, ContextContract, PromptActionContract } from '@/Contracts';
import { Log, Color } from '@/Logger';
import { Prompt } from '@/Prompt';

@injectable()
export class PromptActionHandler implements ActionHandlerContract<'prompt'> {
  for = 'prompt' as const;

  async validate(action: Partial<PromptActionContract>): Promise<PromptActionContract> {
    // TODO - validate each prompt?
    return {
      ...action,
      prompts: action.prompts ?? [],
      type: 'prompt',
    };
  }

  async handle(action: PromptActionContract, context: ContextContract): Promise<boolean> {
    if (!action.prompts) {
      return true;
    }

    const prompts = Array.isArray(action.prompts) ? action.prompts : [action.prompts];
    Log.debug(`Prompting ${Color.keyword(prompts.length)} item(s).`);

    // Prompting each one, and adding their result in the
    // context.
    for (const prompt of prompts) {
      Log.debug(`Prompting ${Color.keyword(prompt?.name ?? 'unknown prompt')}.`);
      context.prompts[prompt.name] = await Prompt.prompt(prompt);
    }

    return true;
  }
}
