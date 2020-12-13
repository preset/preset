// @ts-ignore - TODO: maybe update this
import unset from 'unset-value';
import fs from 'fs-extra';
import path from 'path';
import merge from 'deepmerge';
import detectIndent from 'detect-indent';
import { inject, injectable } from 'inversify';
import {
  ApplierOptionsContract,
  Binding,
  Bus,
  color,
  Contextualized,
  contextualizeValue,
  EditJson,
  ExecutionError,
  HandlerContract,
  Name,
} from '@/exports';

@injectable()
export class EditJsonHandler implements HandlerContract {
  public name = Name.Handler.EditJson;

  @inject(Binding.Bus)
  protected bus!: Bus;

  async handle(action: Contextualized<EditJson>, applierOptions: ApplierOptionsContract): Promise<void> {
    if (!action.file) {
      this.bus.debug(`No JSON file given.`);
      return;
    }

    const absolutePath = path.join(applierOptions.target, action.file);

    if (!fs.existsSync(absolutePath)) {
      this.bus.debug(`${color.magenta(absolutePath)} could not be found.`);
      return;
    }

    const { content, indent } = this.getContent(absolutePath);

    // Merge
    const updated = merge(content, action.json ?? {});

    // Deletion
    action.pathsToDelete.forEach((noContextPaths) => {
      const contextualizedPaths = contextualizeValue(action.preset, noContextPaths);
      const paths: string[] = [];

      if (!Array.isArray(contextualizedPaths)) {
        paths.push(contextualizedPaths);
      } else {
        paths.push(...contextualizedPaths);
      }

      paths.forEach((path) => unset(updated, contextualizeValue(action.preset, path)));
    });

    // Write
    this.bus.debug(`Writing back to ${color.magenta(absolutePath)}.`);
    this.bus.debug(`Content: ${color.gray(JSON.stringify(updated))}`);
    fs.writeJSONSync(absolutePath, updated, {
      spaces: indent,
    });
  }

  /**
   * Gets the content of the file.
   */
  protected getContent(path: string) {
    try {
      let content = fs.readFileSync(path, {
        encoding: 'utf-8',
      });

      return {
        content: JSON.parse(content),
        ...detectIndent(content),
      };
    } catch (error) {
      throw new ExecutionError() //
        .withMessage('Could not read the JSON file.')
        .withCompleteStack(error)
        .stopsExecution();
    }
  }
}
