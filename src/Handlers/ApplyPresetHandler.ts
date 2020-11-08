import { HandlerContract } from '@/Contracts/HandlerContract';
import { ApplyPreset } from '@/Configuration/Actions';
import { inject, injectable } from 'inversify';
import { Binding, Name } from '@/Container';
import { Bus } from '@/bus';

@injectable()
export class ApplyPresetHandler implements HandlerContract {
  public name = Name.Handler.ApplyPreset;

  @inject(Binding.Bus)
  protected bus!: Bus;

  async handle(action: ApplyPreset): Promise<void> {
    this.bus.debug('yes yes applying an action');
  }
}
