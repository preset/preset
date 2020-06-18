import { Log, Color, PromptActionContract, ContextContract } from '../../';
import { ValidatorContract } from '../';

export class PromptValidator implements ValidatorContract<PromptActionContract> {
  async validate(
    action: Partial<PromptActionContract>,
    context: ContextContract
  ): Promise<PromptActionContract | never> {
    if (!action.prompts) {
      Log.debug(`A ${Color.keyword('prompt')} action has no actual prompt.`);
      action.prompts = [];
    }

    if (!Array.isArray(action.prompts)) {
      action.prompts = [action.prompts];
    }

    for (const prompt of action.prompts) {
      if (!prompt.name) {
        return Log.exit(`A ${Color.keyword('prompt')} has no ${Color.keyword('name')}.`);
      }

      if (!prompt.type) {
        return Log.exit(`A ${Color.keyword('prompt')} has no ${Color.keyword('type')}.`);
      }

      if (!prompt.message) {
        return Log.exit(`A ${Color.keyword('prompt')} has no ${Color.keyword('message')}.`);
      }
    }

    return {
      ...action,
      prompts: action.prompts,
      type: 'prompt',
    };
  }
}
