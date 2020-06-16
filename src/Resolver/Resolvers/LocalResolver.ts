import { ResolverContract } from '../ResolverContract';
import fs from 'fs';

export class LocalResolver implements ResolverContract {
  async resolve(input: string): Promise<string | false> {
    if (!fs.existsSync(input)) {
      return false;
    }

    return input;
  }
}
