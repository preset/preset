import { injectable } from 'inversify';
import { ApplierContract } from '../Contracts';

/**
 * An applier that does nothing.
 */
@injectable()
export class NullApplier implements ApplierContract {
  async run() {
    return [];
  }
}
