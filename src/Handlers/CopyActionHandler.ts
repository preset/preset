import { injectable } from 'inversify';
import { ActionHandlerContract, CopyActionContract, copyConflictStrategies, ContextContract } from '@/Contracts';
import { Log, Color } from '@/Logger';
import { Prompt } from '@/Prompt';
import path from 'path';
import fg from 'fast-glob';
import fs from 'fs-extra';

@injectable()
export class CopyActionHandler implements ActionHandlerContract<'copy'> {
  for = 'copy' as const;

  private strategies = {
    ask: this.ask,
    override: this.override,
    skip: this.skip,
  };

  async validate(action: Partial<CopyActionContract>): Promise<CopyActionContract> {
    // Resolves strategy as a callable
    if (typeof action.strategy === 'function') {
      action.strategy = (<Function>action.strategy)();
    }

    // Ensures the strategy is known
    if (action.strategy && !copyConflictStrategies.includes(action.strategy)) {
      Log.warn(`Unknown strategy ${Color.keyword(action.strategy)} for a ${Color.keyword(this.for)} action.`);
      action.strategy = 'ask';
    }

    return {
      files: '*',
      target: '',
      strategy: 'ask',
      ...action,
      type: 'copy',
    };
  }

  async handle(action: CopyActionContract, context: ContextContract): Promise<boolean> {
    // Get the entries in the preset template directory, thanks
    // to the glob in the action.
    const entries = await fg(action.files, {
      dot: true,
      cwd: context.presetTemplates,
    });

    Log.debug(`Found ${Color.keyword(entries.length)} file(s) to copy.`);

    // For each found entry, copy according to the strategy.
    for (const entry of entries) {
      const input = path.join(context.presetTemplates, entry);
      const outputDirectory = path.join(context.targetDirectory, action.target);
      const output = path.join(outputDirectory, entry);

      // Make sure the output directory exists.
      fs.ensureDirSync(outputDirectory);

      // If file exists, there is a conflict that should be handled
      // according to the strategy defined in the action.
      if (fs.pathExistsSync(output)) {
        Log.debug(`File ${Color.file(output)} exists. Using strategy ${Color.keyword(action.strategy)}.`);

        // If the result of the strategy is not truthy, we skip
        const result = await this.strategies[action.strategy].call(this, entry, input, output);
        if (!result) {
          Log.debug(`Skipping ${Color.file(entry)}.`);
          continue;
        }
      }

      // Copy the file
      Log.debug(`Copying ${Color.file(input)} to ${Color.file(output)}.`);
      fs.copySync(input, output);
    }

    return true;
  }

  private async override(entry: string, input: string, output: string): Promise<boolean> {
    try {
      Log.debug(`Deleting ${Color.file(output)}.`);
      fs.removeSync(output);

      return true;
    } catch (error) {
      Log.warn(`Could not delete ${Color.file(output)}.`);

      return false;
    }
  }

  private async skip(entry: string, input: string, output: string): Promise<boolean> {
    return false;
  }

  private async ask(entry: string, input: string, output: string): Promise<boolean> {
    Log.debug(`Kindly asking to replace ${Color.file(entry)}.`);

    const replace = await Prompt.confirm(`${Color.keyword(entry)} already exists. Do you want to replace it?`, {
      default: false,
    });

    if (!replace) {
      Log.debug(`User chosed not to repace ${Color.file(entry)}.`);

      return false;
    }

    return await this.override(entry, input, output);
  }
}
