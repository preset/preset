import { injectable } from 'inversify';
import {
  ActionHandlerContract,
  ContextContract,
  EditActionContract,
  ReplaceObject,
  Replacer,
  Searchable,
  SearchableFunction,
} from '@/Contracts';
import { Log, Color } from '@/Logger';
import fs from 'fs-extra';
import fg from 'fast-glob';
import path from 'path';

@injectable()
export class EditActionHandler implements ActionHandlerContract<'edit'> {
  for = 'edit' as const;

  async validate(action: Partial<EditActionContract>): Promise<EditActionContract> {
    return {
      ...action,
      files: action.files ?? false,
      type: 'edit',
    };
  }

  async handle(action: EditActionContract, context: ContextContract): Promise<boolean> {
    if (!action.files) {
      return true;
    }

    const entries = await fg(action.files, {
      dot: true,
      cwd: context.targetDirectory,
    });

    Log.debug(`Editing ${Color.keyword(entries.length)} file(s).`);

    for (const entry of entries) {
      try {
        const filepath = path.join(context.targetDirectory, entry);
        const content = fs.readFileSync(filepath).toString();
        const data = await this.performEdition(filepath, content, action, context);

        Log.debug(`Writing back to ${Color.file(filepath)}.`);
        fs.writeFileSync(filepath, data);
      } catch (error) {
        Log.debug(`Could not edit file ${Color.file(entry)}.`);
        Log.debug(error);
      }
    }

    return true;
  }

  /**
   * Edits the given data.
   */
  private async performEdition(
    filepath: string,
    content: string,
    action: EditActionContract,
    context: ContextContract
  ): Promise<string> {
    if (action.removeLines) {
      for (const removal of action.removeLines) {
        content = await this.performLineEdition(content, removal.search, context, ({ lines, index }) => {
          // Handle the lines to remove before
          if (removal.before && index > 0) {
            lines.splice(index - removal.before, removal.before);
            index -= removal.before;
          }

          // Handle the lines to remove after
          if (removal.after) {
            if (removal.after > lines.length - 1 - index) {
              removal.after = lines.length - index;
            }

            lines.splice(index + 1, removal.after);
          }

          // Removes the matched line if necessary
          if (removal.removeMatch) {
            lines.splice(index, 1);
          }
        });
      }
    }

    if (action.addLines) {
      for (const addition of action.addLines) {
        content = await this.performLineEdition(
          content,
          addition.search,
          context,
          ({ lines, lastIndentation, index }) => {
            let addedBefore = 0;

            // Handle the lines to add before
            if (addition.before) {
              if (!Array.isArray(addition.before)) {
                addition.before = [addition.before];
              }

              const before = addition.before.map(line => `${lastIndentation}${line}`);
              if (index === 0) {
                lines.unshift(...before);
              } else if (index === lines.length - 1) {
                lines.push(...before);
              } else {
                lines.splice(Math.max(index + 1 - before.length + 1), 0, ...before);
              }
              addedBefore = before.length;
            }

            // Handle the lines to add after
            if (addition.after) {
              if (!Array.isArray(addition.after)) {
                addition.after = [addition.after];
              }

              const after = addition.after.map(line => `${lastIndentation}${line}`);
              lines.splice(index + 1 + addedBefore, 0, ...after);
            }
          }
        );
      }
    }

    if (action.replace) {
      for (const replacement of action.replace) {
        Log.debug(`Replacing content on ${Color.file(filepath)}.`);
        content = await this.performReplacement(content, replacement, context);
      }
    }

    return content;
  }

  private async performLineEdition(
    content: string,
    search: Searchable | SearchableFunction,
    context: ContextContract,
    transformer: (data: { lines: string[]; index: number; line: string; lastIndentation: string }) => void
  ): Promise<string> {
    const lines = content.split('\n');
    let lastIndentation = '';

    if (typeof search === 'function') {
      search = await search(content, context);
    }

    for (const line of lines) {
      if (line.match(search)) {
        transformer({
          lines,
          index: lines.indexOf(line),
          line,
          lastIndentation,
        });
        break;
      }

      lastIndentation = (line.match(/^[\s]+/) ?? []).shift() ?? '';
    }

    return lines.join('\n');
  }

  /**
   * Replaces data with the given replacement.
   */
  private async performReplacement(
    content: string,
    replacement: ReplaceObject,
    context: ContextContract
  ): Promise<string> {
    try {
      if (typeof replacement.search === 'function') {
        replacement.search = await replacement.search(content, context);
      }

      content = content.replace(replacement.search, replacement.with as string);
    } catch (error) {
      Log.debug(error);
    }

    return content;
  }
}
