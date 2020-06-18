import { UpdateJsonFileActionContract, Log, Color, ContextContract, HandlerContract } from '../../';
import { lodash } from '@poppinss/utils';
import path from 'path';
import fs from 'fs-extra';

export class UpdateJsonFileHandler implements HandlerContract<UpdateJsonFileActionContract> {
  protected strategies = {
    create: this.create,
    skip: this.skip,
  };

  async handle(action: UpdateJsonFileActionContract, context: ContextContract): Promise<void | never> {
    const filePath = path.join(context.targetDirectory, action.target);

    Log.debug(`Updating ${Color.file(filePath)} as JSON.`);

    // Checks if the file exists. If not, creates it
    // or skips depending on the strategy.
    if (!fs.pathExistsSync(filePath)) {
      Log.debug(`File ${Color.file(filePath)} does not exists. Using strategy ${Color.keyword(action.strategy)}.`);

      const shouldContinue = await this.strategies[action.strategy].call(this, filePath);
      if (!shouldContinue) {
        Log.debug(`Skipping the edition of ${Color.file(filePath)}.`);
        return;
      }
    }

    try {
      await this.performEdition(filePath, action);
    } catch (error) {
      Log.warn(`Could not edit ${Color.file(filePath)}.`);
      Log.fatal(error);
    }
  }

  private async performEdition(filePath: string, action: UpdateJsonFileActionContract) {
    let changes = 0;
    let content = fs.readJSONSync(filePath);

    // Remove the contents
    if (action.remove) {
      Log.debug(`${Color.keyword('Removing')} file contents.`);
      content = lodash.omit(content, action.remove);
      changes += action.remove.length;
    }

    // Merge the contents
    if (action.merge) {
      Log.debug(`${Color.keyword('Merging')} file contents.`);
      content = lodash.merge(content, action.merge);
      changes += 1;
    }

    // Write the new content
    Log.debug(`Writing new content to ${Color.file(filePath)}. Made ${Color.keyword(changes)} change(s).`);
    fs.writeJSONSync(filePath, content, { spaces: '\t' });
  }

  /**
   * The "skip" strategy.
   */
  private async skip(filePath: string): Promise<boolean> {
    return false;
  }

  /**
   * The "create" strategy, which creates an empty file.
   */
  private async create(filePath: string): Promise<boolean> {
    try {
      Log.debug(`Creating ${Color.file(filePath)}.`);
      fs.ensureFileSync(filePath);
      fs.writeJSONSync(filePath, {});

      return true;
    } catch (error) {
      Log.warn(`Could not create ${Color.file(filePath)}.`);
      Log.fatal(error);
    }

    return false;
  }
}
