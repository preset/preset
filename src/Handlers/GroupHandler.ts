import { HandlerContract } from '@/Contracts/HandlerContract';
import { Group } from '@/Configuration/Actions';
import { inject, injectable } from 'inversify';
import { Binding, container, Name } from '@/Container';
import { ApplierContract, ApplierOptionsContract } from '@/Contracts/ApplierContract';
import { Contextualized } from '@/Contracts/PresetContract';
import { Bus } from '@/bus';
import { color } from '@/utils';
import { Preset } from '@/Configuration/Preset';

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
    preset.git = action.preset.git;
    preset.presetDirectory = action.preset.presetDirectory;
    preset.prompts = action.preset.prompts;
    preset.templateDirectory = action.preset.templateDirectory;
    preset.actions = [];
    action.actions.callback(preset);

    this.bus.debug(`Perfoming a group of ${color.magenta(String(preset.actions.length))} actions.`);
    await container.get<ApplierContract>(Binding.Applier).performActions(preset, applierOptions, true);
  }
}
