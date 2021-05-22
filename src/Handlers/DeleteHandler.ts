import path from 'path';
import fs from 'fs-extra';
import { injectable, inject } from 'inversify';
import { ApplierOptionsContract, Binding, Bus, color, Contextualized, Delete, HandlerContract, Name } from '@/exports';

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
      fs.rmSync(absolutePath, {
        recursive: true,
      });
    }
  }
}
