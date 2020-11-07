import { ResolverContract, ResolverOptionsContract, ResolverResultContract } from '@/Contracts/ResolverContract';
import { ResolutionError } from '@/Errors';
import { injectable } from 'inversify';
import fs from 'fs-extra';
import path from 'path';

@injectable()
export class LocalResolver implements ResolverContract {
  async resolve(resolvable: string, options: ResolverOptionsContract): Promise<ResolverResultContract> {
    if (options.path) {
      resolvable = path.join(resolvable, options.path);

      if (!this.ensurePathExists(resolvable)) {
        throw ResolutionError.subdirectoryNotFound(options.path, resolvable);
      }
    }

    if (!this.ensurePathExists(resolvable)) {
      throw ResolutionError.directoryNotFound(resolvable);
    }

    return {
      path: resolvable,
      temporary: false,
    };
  }

  /**
   * Checks if the given path is a valid directory.
   */
  protected ensurePathExists(path: string): boolean {
    return fs.pathExistsSync(path) && fs.statSync(path).isDirectory();
  }
}
