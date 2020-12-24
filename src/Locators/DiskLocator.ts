import fs from 'fs-extra';
import { injectable } from 'inversify';
import { LocatorContract, ResolutionError, LocalPreset } from '@/exports';

@injectable()
export class DiskLocator implements LocatorContract {
  public name: string = 'local';

  async locate(resolvable: string): Promise<LocalPreset> {
    try {
      if (fs.statSync(resolvable)?.isDirectory()) {
        return {
          type: 'local',
          path: resolvable,
        };
      }
    } catch {}

    throw ResolutionError.localDirectoryNotFound(resolvable);
  }
}
