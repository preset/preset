import { inject, injectable } from 'inversify';
import { HandlerContract, Binding, Name, Contextualized, Prompt, Bus, color, contextualizeObject, PromptContract } from '@/exports';

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
        action.preset.prompts[name] = await this.prompt.prompt(contextualizeObject(options));
      } else {
        action.preset.prompts[name] = contextualizeObject(options).initial;
      }
    }
  }
}
