import { injectable } from 'inversify';
import { ActionHandlerContract, ContextContract, EditJsonActionContract, JsonEntry } from '@/Contracts';
import { Logger } from '@/Logger';
import { contextualize } from '@/Handlers';
import { lodash } from '@poppinss/utils';
import detectIndent from 'detect-indent';
import fg from 'fast-glob';
import fs from 'fs-extra';
import path from 'path';

@injectable()
export class EditJsonActionHandler implements ActionHandlerContract<'edit-json'> {
  for = 'edit-json' as const;

  async validate(action: Partial<EditJsonActionContract>, context: ContextContract): Promise<EditJsonActionContract> {
    action = contextualize(action, context);
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
        let content = fs.readFileSync(targetFile).toString();
        if (content.charCodeAt(0) === 0xFEFF) {
          content = content.slice(1)
        }
        let json = JSON.parse(content);

        if (action.delete) {
          json = await this.delete(json, action.delete);
        }

        if (action.merge) {
          json = await this.merge(json, action.merge);
        }

        Logger.info(`Writing back to ${file}.`);
        fs.writeJsonSync(targetFile, json, {
          spaces: action.space ?? detectIndent(content).indent,
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
