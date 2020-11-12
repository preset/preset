import { HandlerContract } from '@/Contracts/HandlerContract';
import { inject, injectable } from 'inversify';
import { Binding, Name } from '@/Container';
import { ApplierOptionsContract } from '@/Contracts/ApplierContract';
import { Contextualized } from '@/Contracts/PresetContract';
import { Prompt } from '@/Configuration/Actions/Prompt';
import { PromptContract } from '@/prompt';
import { color, contextualizeObject, contextualizeValue } from '@/utils';
import { Bus } from '@/bus';

@injectable()
export class PromptHandler implements HandlerContract {
  public name = Name.Handler.Prompt;

  @inject(Binding.Bus)
  protected bus!: Bus;

  @inject(Binding.Prompt)
  protected prompt!: PromptContract;

  async handle(action: Contextualized<Prompt>): Promise<void> {
    // Loops through the defined prompts, and prompt them to the user.
    // If the preset is not interactive, defines the default values directly.
    for (let [name, options] of action.prompts) {
      this.bus.debug(`Prompting for value ${color.magenta(name)}.`);

      if (action.preset.isInteractive()) {
        action.preset.prompts.set(name, await this.prompt.prompt(contextualizeObject(options)));
      } else {
        action.preset.prompts.set(name, contextualizeObject(options).initial);
      }
    }
  }
}
