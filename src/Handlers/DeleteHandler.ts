import { HandlerContract } from '@/Contracts/HandlerContract';
import { Delete } from '@/Configuration/Actions';
import { inject, injectable } from 'inversify';
import { Binding, Name } from '@/Container';
import { ApplierOptionsContract } from '@/Contracts/ApplierContract';
import { Contextualized } from '@/Contracts/PresetContract';
import { color } from '@/utils';
import { Bus } from '@/bus';
import fs from 'fs-extra';
import path from 'path';

@injectable()
export class DeleteHandler implements HandlerContract {
  public name = Name.Handler.Delete;

  @inject(Binding.Bus)
  protected bus!: Bus;

  async handle(action: Contextualized<Delete>, applierOptions: ApplierOptionsContract): Promise<void> {
    for (const relativePath of action.paths) {
      const absolutePath = path.join(applierOptions.target, relativePath);

      if (!fs.existsSync(absolutePath)) {
        this.bus.debug(`Skipping deletion of ${color.magenta(absolutePath)} because it does not exist.`);
        continue;
      }

      this.bus.debug(`Deleting ${color.magenta(absolutePath)}.`);
      fs.rmdirSync(absolutePath, {
        recursive: true,
      });
    }
  }
}
