import { injectable } from 'inversify';
import { ActionHandlerContract, ContextContract, EditJsonActionContract, JsonEntry } from '@/Contracts';
import { Logger } from '@/Logger';
import { lodash } from '@poppinss/utils';
import fg from 'fast-glob';
import fs from 'fs-extra';
import path from 'path';

@injectable()
export class EditJsonActionHandler implements ActionHandlerContract<'edit-json'> {
  for = 'edit-json' as const;

  async validate(action: Partial<EditJsonActionContract>): Promise<EditJsonActionContract> {
    action.title = action.title ?? 'Edit JSON file';

    return {
      file: action.file ?? [],
      merge: false,
      delete: false,
      ...action,
      type: 'edit-json',
    };
  }

  async handle(action: EditJsonActionContract, context: ContextContract) {
    if (!action.file) {
      return { success: true };
    }

    if (!Array.isArray(action.file)) {
      action.file = [action.file];
    }

    const directory = context.targetDirectory;
    const files = await fg(action.file, {
      onlyFiles: true,
      cwd: directory,
    });

    for (const file of files) {
      const targetFile = path.join(directory, file);

      try {
        Logger.info(`Reading ${file}.`);
        let content = fs.readJsonSync(targetFile);

        if (action.delete) {
          content = await this.delete(content, action.delete);
        }

        if (action.merge) {
          content = await this.merge(content, action.merge);
        }

        Logger.info(`Writing back to ${file}.`);
        fs.writeJsonSync(targetFile, content, {
          spaces: '\t',
        });
      } catch (error) {
        throw Logger.throw(`Could not edit ${file}.`, error);
      }
    }

    return { success: true };
  }

  protected async delete(original: JsonEntry, data: string | string[]): Promise<JsonEntry> {
    if (!Array.isArray(data)) {
      data = [data];
    }

    Logger.info(`Deleting ${data.length} entries.`);

    data.forEach(deletion => {
      lodash.unset(original, deletion);
    });

    return original;
  }

  protected async merge(original: JsonEntry, data: JsonEntry): Promise<JsonEntry> {
    Logger.info(`Merging new data.`);
    return lodash.merge(original, data);
  }
}
