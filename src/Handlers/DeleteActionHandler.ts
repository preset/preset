import { injectable } from 'inversify';
import { ActionHandlerContract, ContextContract, DeleteActionContract } from '@/Contracts';
import { Logger } from '@/Logger';
import { contextualize } from '@/Handlers';
import fg from 'fast-glob';
import fs from 'fs-extra';
import path from 'path';

@injectable()
export class DeleteActionHandler implements ActionHandlerContract<'delete'> {
  for = 'delete' as const;

  async validate(action: Partial<DeleteActionContract>, context: ContextContract): Promise<DeleteActionContract> {
    action = contextualize(action, context);

    if (!action.directories && !action.files) {
      Logger.info(`A ${this.for} action will not do anything because it has no target file nor directory..`);
    }

    return {
      ...action,
      files: action.files ?? false,
      directories: action.directories ?? false,
      type: 'delete',
    };
  }

  async handle(action: DeleteActionContract, context: ContextContract) {
    const directoriesDeleted = await this.delete('directories', action, context);
    const filesDeleted = await this.delete('files', action, context);

    return { success: directoriesDeleted && filesDeleted };
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

    Logger.info(`Found ${entries.length} entries to delete.`);

    // For each found entry, delete it.
    for (const entry of entries) {
      const absolutePath = path.join(context.targetDirectory, entry);
      Logger.info(`Deleting ${absolutePath}.`);

      try {
        fs.removeSync(absolutePath);
      } catch (error) {
        throw Logger.throw(`Could not delete file ${absolutePath}.`, error);
      }
    }

    return true;
  }
}
