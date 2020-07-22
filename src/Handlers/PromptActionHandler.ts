import { injectable } from 'inversify';
import { ActionHandlerContract, ContextContract, PromptActionContract } from '@/Contracts';
import { Logger } from '@/Logger';

@injectable()
export class PromptActionHandler implements ActionHandlerContract<'prompt'> {
  for = 'prompt' as const;

  async validate(action: Partial<PromptActionContract>): Promise<PromptActionContract> {
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
    Logger.info(`Prompting ${prompts.length} item(s).`);

    // Prompting each one, and adding their result in the
    // context.
    for (const prompt of prompts) {
      Logger.info(`Prompting ${prompt?.name ?? 'unknown prompt'}.`);
      context.prompts[prompt.name] = await context.task.prompt(prompt);
    }

    return true;
  }
}
