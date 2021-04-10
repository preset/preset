import { inject, injectable } from 'inversify';
import {
  ApplierContract,
  ApplierOptionsContract,
  Binding,
  Bus,
  color,
  container,
  Contextualized,
  Group,
  HandlerContract,
  Name,
  Preset,
} from '@/exports';

@injectable()
export class GroupHandler implements HandlerContract {
  public name = Name.Handler.Group;

  @inject(Binding.Bus)
  protected bus!: Bus;

  async handle(action: Contextualized<Group>, applierOptions: ApplierOptionsContract): Promise<void> {
    if (!action.actions?.callback) {
      this.bus.debug(`No callback given. Skipping.`);
      return;
    }

    const preset = new Preset();
    preset.args = action.preset.args;
    preset.options = action.preset.options;
    preset.context = action.preset.context;
    preset.git = action.preset.git;
    preset.presetDirectory = action.preset.presetDirectory;
    preset.prompts = action.preset.prompts;
    preset.templateDirectory = action.preset.templateDirectory;
    preset.targetDirectory = action.preset.targetDirectory;
    preset.actions = [];
    action.actions.callback(preset);
    preset.actions.map((action) => action.withTitle(false));

    this.bus.debug(`Perfoming a group of ${color.magenta(String(preset.actions.length))} actions.`);
    await container.get<ApplierContract>(Binding.Applier).performActions(preset, applierOptions);
  }
}
