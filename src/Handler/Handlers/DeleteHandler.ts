import { Log, Color, ContextContract, DeleteActionContract } from '../../';
import { HandlerContract } from '../';
import path from 'path';
import fg from 'fast-glob';
import fs from 'fs-extra';

export class DeleteHandler implements HandlerContract<DeleteActionContract> {
  async handle(action: DeleteActionContract, context: ContextContract): Promise<void | never> {
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
      }
    }
  }
}
