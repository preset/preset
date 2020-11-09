import { HandlerContract } from '@/Contracts/HandlerContract';
import { Copy } from '@/Configuration/Actions';
import { inject, injectable } from 'inversify';
import { Binding, container, Name } from '@/Container';
import { ApplierContract, ApplierOptionsContract } from '@/Contracts/ApplierContract';
import { ExecutionError } from '@/Errors';
import { Bus } from '@/bus';

@injectable()
export class CopyHandler implements HandlerContract {
  public name = Name.Handler.Copy;

  @inject(Binding.Bus)
  protected bus!: Bus;

  async handle(action: Copy, applierOptions: ApplierOptionsContract): Promise<void> {
    console.log(action);
  }
}
