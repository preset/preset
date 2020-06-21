import { injectable } from 'inversify';
import { ActionHandlerContract, ContextContract, DeleteActionContract } from '@/Contracts';
import { Log, Color } from '@/Logger';
import fg from 'fast-glob';
import fs from 'fs-extra';
import path from 'path';

@injectable()
export class DeleteActionHandler implements ActionHandlerContract<'delete'> {
  for = 'delete' as const;

  async validate(action: Partial<DeleteActionContract>): Promise<DeleteActionContract> {
    if (!action.files) {
      Log.debug(`A ${Color.keyword(this.for)} action has no files specified.`);
      action.files = [];
    }

    return {
      ...action,
      files: action.files,
      type: 'delete',
    };
  }

  async handle(action: DeleteActionContract, context: ContextContract): Promise<boolean> {
    // Get the entries in the preset template directory, thanks
    // to the glob in the action.
    const entries = await fg(action.files, {
      dot: true,
      cwd: context.targetDirectory,
    });

    Log.debug(`Found ${Color.keyword(entries.length)} file(s) to delete.`);

    // For each found entry, delete it.
    for (const entry of entries) {
      const absolutePath = path.join(context.targetDirectory, entry);
      Log.debug(`Deleting ${Color.file(absolutePath)}.`);

      try {
        fs.removeSync(absolutePath);
      } catch (error) {
        Log.warn(`Could not delete file ${Color.file(absolutePath)}.`);
        Log.fatal(error);
        return false;
      }
    }

    return true;
  }
}
