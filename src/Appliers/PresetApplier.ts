import { injectable } from 'inversify';
import { ApplierContract } from '../Contracts';

/**
 * Tries to resolve the given resolvable to a preset.
 * If found, applies it to the current context.
 */
@injectable()
export class PresetApplier implements ApplierContract {
  async run(resolvable: string, argv: string[], debug: boolean): Promise<number> {
    throw new Error('Method not implemented.');
  }
}
