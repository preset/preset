import { injectable, inject } from 'inversify';
import { ActionHandlerContract, ContextContract, PresetActionContract, ApplierContract } from '@/Contracts';
import { Log, Color } from '@/Logger';
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

    return {
      ...action,
      type: 'preset',
    } as PresetActionContract;
  }

  async handle(action: PresetActionContract, context: ContextContract): Promise<boolean> {
    try {
      return await this.applier.run({
        resolvable: action.preset,
        argv: context.argv,
        in: context.targetDirectory,
      });
    } catch (error) {
      Log.warn(`Preset ${Color.resolvable(action.preset ?? 'unnamed')} could not be applied.`);
      Log.debug(error);
    }

    return false;
  }
}
