import { injectable, inject } from 'inversify';
import { ActionHandlerContract, ContextContract, PresetActionContract, ApplierContract } from '@/Contracts';
import { Logger } from '@/Logger';
import { Binding } from '@/Container';

@injectable()
export class PresetActionHandler implements ActionHandlerContract<'preset'> {
  for = 'preset' as const;

  @inject(Binding.Applier)
  protected applier!: ApplierContract;

  async validate(action: Partial<PresetActionContract>): Promise<PresetActionContract | false> {
    if (!action.preset) {
      return false;
    }

    if (action.arguments && !Array.isArray(action.arguments)) {
      action.arguments = [action.arguments];
    }

    action.inherit = Boolean(action.inherit);

    return {
      ...action,
      type: 'preset',
    } as PresetActionContract;
  }

  async handle(action: PresetActionContract, context: ContextContract) {
    try {
      if (!action.arguments) {
        action.arguments = [];
      }

      if (action.inherit) {
        (action.arguments as string[]).push(...context.argv);
      }

      return await this.applier.run({
        resolvable: action.preset,
        argv: action.arguments as string[],
        in: context.targetDirectory,
      });
    } catch (error) {
      throw Logger.throw(`Preset ${action.preset ?? 'unnamed'} could not be applied.`, error);
    }
  }
}
