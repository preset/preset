import { injectable } from 'inversify';
import { ResolverContract, ResolverResultContract } from '@/Contracts';
import fs from 'fs-extra';
import { Name } from '@/Container';

/**
 * A resolver that checks if a local directory exists.
 */
@injectable()
export class LocalResolver implements ResolverContract {
  public readonly name: string = Name.LocalResolver;

  async resolve(input: string): Promise<ResolverResultContract> {
    if (!fs.pathExistsSync(input) || !fs.statSync(input).isDirectory()) {
      return {
        success: false,
      };
    }

    return {
      success: true,
      path: input,
      temporary: false,
    };
  }
}
