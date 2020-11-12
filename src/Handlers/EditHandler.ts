import { HandlerContract } from '@/Contracts/HandlerContract';
import { Edit, EditionCallback, LineAddition } from '@/Configuration/Actions';
import { inject, injectable } from 'inversify';
import { Binding, Name } from '@/Container';
import { ApplierOptionsContract } from '@/Contracts/ApplierContract';
import { Contextualized } from '@/Contracts/PresetContract';
import { Bus } from '@/bus';
import { color, contextualizeValue, wrap } from '@/utils';
import detectIndent from 'detect-indent';
import fs from 'fs-extra';
import path from 'path';
import fg from 'fast-glob';

@injectable()
export class EditHandler implements HandlerContract {
  public name = Name.Handler.Edit;

  @inject(Binding.Bus)
  protected bus!: Bus;

  async handle(action: Contextualized<Edit>, applierOptions: ApplierOptionsContract): Promise<void> {
    const relativeFileNames = wrap(action.files!)
      .map((globOrFileName) =>
        fg.sync(globOrFileName, {
          ignore: ['node_modules', 'vendors', 'yarn.lock', 'package-lock.json'],
          cwd: applierOptions.target,
          dot: true,
        }),
      )
      .flat();

    // Loops through the given files.
    for (const fileName of relativeFileNames) {
      const filePath = path.join(applierOptions.target, fileName);

      // Ensures the file exists.
      if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
        this.bus.debug(`Skipping ${color.magenta(filePath)} because it does not exist or is not a file.`);
        continue;
      }

      this.bus.debug(`Editing ${color.magenta(filePath)}.`);
      let content = fs.readFileSync(filePath, { encoding: 'utf-8' });

      // Performs the editions.
      action.edition.forEach((edition) => {
        content = edition?.(content, action.preset) ?? content;
      });

      // Performs line additions.
      for (const addition of action.additions) {
        content = await this.performLineAddition(content, addition);
      }

      this.bus.debug(`Writing back to ${color.magenta(filePath)}.`);
      fs.writeFileSync(filePath, content, { encoding: 'utf-8' });
    }
  }

  /**
   * Adds lines to the content.
   */
  async performLineAddition(content: string, addition: LineAddition): Promise<string> {
    const search = contextualizeValue(addition.search);
    const direction = contextualizeValue(addition.direction);
    const contentToAdd = wrap(contextualizeValue(addition.content));
    const orderedContentToAdd = direction === 'above' ? contentToAdd.reverse() : contentToAdd;
    const additionIndent = contextualizeValue(addition.indent);
    const initialLines = direction === 'above' ? content.split('\n').reverse() : content.split('\n');
    const finalLines: string[] = [];
    let amountOfLinesBeforeAdding = contextualizeValue(addition.amountOfLinesToSkip);
    let previousLine: string = '';
    let hasMatch: boolean = false;

    if (!search || contentToAdd.length === 0) {
      return content;
    }

    this.bus.debug(`Adding ${color.magenta(contentToAdd.length.toString())} line(s).`);

    // Loops through the line to determines what to do.
    for (const line of initialLines) {
      // Adds the line anyway.
      finalLines.push(line);
      previousLine = line;

      if (!line.match(search) && !hasMatch) {
        continue;
      }

      hasMatch = true;

      // Ensures this is the line at which we should do the addition.
      if (amountOfLinesBeforeAdding > 0) {
        amountOfLinesBeforeAdding--;
        continue;
      }

      // Adds the lines.
      hasMatch = false;
      orderedContentToAdd.forEach((lineToAdd) => {
        const { indent } = detectIndent(previousLine);

        // Automatic idents uses the indent from the previous line.
        if (!additionIndent) {
          finalLines.push(indent + lineToAdd);
          return;
        }

        // Double indent doubles the indent from the previous line.
        if (additionIndent === 'double') {
          finalLines.push(indent.repeat(2) + lineToAdd);
          return;
        }

        // A number uses the given amount of spaces.
        if (typeof additionIndent === 'number') {
          finalLines.push(' '.repeat(additionIndent) + lineToAdd);
          return;
        }

        // Otherwise, a custom indentation is used.
        finalLines.push(additionIndent + lineToAdd);
      });
    }

    return direction === 'above' ? finalLines.reverse().join('\n') : finalLines.join('\n');
  }
}
