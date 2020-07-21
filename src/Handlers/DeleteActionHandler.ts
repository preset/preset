import { injectable } from 'inversify';
import { ActionHandlerContract, ContextContract, DeleteActionContract } from '@/Contracts';
// import { Log, Color } from '@/Logger';
import fg from 'fast-glob';
import fs from 'fs-extra';
import path from 'path';

@injectable()
export class DeleteActionHandler implements ActionHandlerContract<'delete'> {
  for = 'delete' as const;

  async validate(action: Partial<DeleteActionContract>): Promise<DeleteActionContract> {
    if (!action.directories && !action.files) {
      // Log.debug(
      //   `A ${Color.keyword(this.for)} action will not do anything because it has no target file nor directory..`
      // );
    }

    return {
      ...action,
      files: action.files ?? false,
      directories: action.directories ?? false,
      type: 'delete',
    };
  }

  async handle(action: DeleteActionContract, context: ContextContract): Promise<boolean> {
    const directoriesDeleted = await this.delete('directories', action, context);
    const filesDeleted = await this.delete('files', action, context);

    return directoriesDeleted && filesDeleted;
  }

  protected async delete(
    mode: 'directories' | 'files',
    action: DeleteActionContract,
    context: ContextContract
  ): Promise<boolean> {
    if (mode === 'directories' && !action.directories) {
      return true;
    }

    if (mode === 'files' && !action.files) {
      return true;
    }

    const entries = await fg(<string | string[]>action[mode], {
      dot: true,
      cwd: context.targetDirectory,
      onlyFiles: mode === 'files',
      onlyDirectories: mode === 'directories',
    });

    // Log.debug(`Found ${Color.keyword(entries.length)} entries to delete.`);

    // For each found entry, delete it.
    for (const entry of entries) {
      const absolutePath = path.join(context.targetDirectory, entry);
      // Log.debug(`Deleting ${Color.file(absolutePath)}.`);

      try {
        fs.removeSync(absolutePath);
      } catch (error) {
        // Log.warn(`Could not delete file ${Color.file(absolutePath)}.`);
        // Log.fatal(error);
        return false;
      }
    }

    return true;
  }
}
