import { injectable } from 'inversify';
import { ActionHandlerContract, ContextContract, EditJsonActionContract, JsonEntry } from '@/Contracts';
import { Log, Color } from '@/Logger';
import { lodash } from '@poppinss/utils';
import fg from 'fast-glob';
import fs from 'fs-extra';
import path from 'path';

@injectable()
export class EditJsonActionHandler implements ActionHandlerContract<'edit-json'> {
  for = 'edit-json' as const;

  async validate(action: Partial<EditJsonActionContract>): Promise<EditJsonActionContract> {
    return {
      file: action.file ?? [],
      merge: false,
      delete: false,
      ...action,
      type: 'edit-json',
    };
  }

  async handle(action: EditJsonActionContract, context: ContextContract): Promise<boolean> {
    if (!action.file) {
      return true;
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
        Log.debug(`Reading ${Color.file(file)}.`);
        let content = fs.readJsonSync(targetFile);

        if (action.delete) {
          content = await this.delete(content, action.delete);
        }

        if (action.merge) {
          content = await this.merge(content, action.merge);
        }

        Log.debug(`Writing back to ${Color.file(file)}.`);
        fs.writeJsonSync(targetFile, content, {
          spaces: '\t',
        });
      } catch (error) {
        Log.warn(`Could not edit ${Color.file(file)}.`);
        Log.debug(error);
      }
    }

    return true;
  }

  protected async delete(original: JsonEntry, data: string | string[]): Promise<JsonEntry> {
    if (!Array.isArray(data)) {
      data = [data];
    }

    Log.debug(`Deleting ${Color.keyword(data.length)} entries.`);

    data.forEach(deletion => {
      lodash.unset(original, deletion);
    });

    return original;
  }

  protected async merge(original: JsonEntry, data: JsonEntry): Promise<JsonEntry> {
    Log.debug(`Merging new data.`);
    return lodash.merge(data, original);
  }
}
