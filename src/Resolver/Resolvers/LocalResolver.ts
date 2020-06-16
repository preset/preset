import { ResolverContract, ResolverResultContract } from '../Contracts';
import fs from 'fs';

export class LocalResolver implements ResolverContract {
  async resolve(input: string): Promise<ResolverResultContract> {
    if (!fs.existsSync(input)) {
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
