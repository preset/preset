import { injectable } from 'inversify';
import { ActionHandlerContract, CopyActionContract, copyConflictStrategies, ContextContract } from '@/Contracts';
import { contextualize } from '@/Handlers';
import { Logger } from '@/Logger';
import { Text } from '@supportjs/text';
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

  async validate(action: Partial<CopyActionContract>, context: ContextContract): Promise<CopyActionContract> {
    action = contextualize(action, context);

    // Resolves strategy as a callable
    if (typeof action.strategy === 'function') {
      action.strategy = (<Function>action.strategy)();
    }

    // Ensures the strategy is known
    if (action.strategy && !copyConflictStrategies.includes(action.strategy)) {
      throw Logger.throw(`Unknown strategy ${action.strategy}`);
    }

    return {
      files: action.directories ? [] : '**/**',
      directories: [],
      target: '',
      strategy: 'ask',
      ignoreDotfiles: false,
      ...action,
      type: 'copy',
    };
  }

  async handle(action: CopyActionContract, context: ContextContract) {
    const filesCopySuccess = await this.copyFiles(action, context);
    const directoriesCopySuccess = await this.copyDirectories(action, context);

    return {
      success: filesCopySuccess && directoriesCopySuccess,
    };
  }

  private async copyDirectories(action: CopyActionContract, context: ContextContract): Promise<boolean> {
    if (!action.directories) {
      return true;
    }

    // Transform to array if it's a string
    if (typeof action.directories === 'string') {
      action.directories = [action.directories];
    }

    // Transform to object map if it's an array
    if (Array.isArray(action.directories)) {
      action.directories = action.directories.reduce(
        (result, item) => ({
          ...result,
          [item]: '',
        }),
        {}
      );
    }

    const results = [];
    Logger.info(`Copying ${Object.entries(action.directories).length} directories.`);

    // Use the map to copy each directory to its target directory
    for (const [from, to] of Object.entries(action.directories)) {
      const entries = await fg('**/*', {
        dot: !action.ignoreDotfiles,
        cwd: path.join(context.presetTemplates, from),
      });

      // Copies all files found, relative to the "from" directory,
      // to the "to" directory.
      results.push(await this.doCopyFiles(entries, from, to, action, context));
    }

    return results.every(success => success);
  }

  private async copyFiles(action: CopyActionContract, context: ContextContract): Promise<boolean> {
    if (!action.files) {
      return true;
    }

    // Get the entries in the preset template directory, thanks
    // to the glob in the action.
    const entries = await fg(action.files, {
      dot: !action.ignoreDotfiles,
      cwd: context.presetTemplates,
    });

    return this.doCopyFiles(entries, '', action.target, action, context);
  }

  private async doCopyFiles(
    entries: string[],
    from: string,
    to: string,
    action: CopyActionContract,
    context: ContextContract
  ): Promise<boolean> {
    Logger.info(`Copying ${entries.length} file(s).`);

    // TODO - refactor to avoid repetition with copyFiles
    // For each found entry, copy according to the strategy.
    for (let entry of entries) {
      const input = path.join(context.presetTemplates, from, entry);
      const outputDirectory = path.join(context.targetDirectory, to);

      if (entry.endsWith('.dotfile')) {
        if (entry.includes('/')) {
          entry = Text.make(entry)
            .afterLast('/')
            .prepend('.')
            .beforeLast('.dotfile')
            .prepend(Text.make(entry).beforeLast('/').append('/'))
            .str();
        } else {
          entry = Text.make(entry) //
            .prepend('.')
            .beforeLast('.dotfile')
            .str();
        }
      }

      const output = path.join(outputDirectory, entry);

      // Make sure the output directory exists.
      fs.ensureDirSync(outputDirectory);

      // If file exists, there is a conflict that should be handled
      // according to the strategy defined in the action.
      if (fs.pathExistsSync(output)) {
        Logger.info(`File ${output} exists. Using strategy ${action.strategy}.`);

        // If the result of the strategy is not truthy, we skip
        const result = await this.strategies[action.strategy].call(this, entry, input, output, context);
        if (!result) {
          Logger.info(`Skipping ${entry}.`);
          continue;
        }
      }

      // Copy the file
      Logger.info(`Copying ${input} to ${output}.`);
      fs.copySync(input, output);
    }

    return true;
  }

  private async override(entry: string, input: string, output: string, context: ContextContract): Promise<boolean> {
    try {
      Logger.info(`Deleting ${output}.`);
      fs.removeSync(output);

      return true;
    } catch (error) {
      throw Logger.throw(`Could not delete ${output}.`);
    }
  }

  private async skip(entry: string, input: string, output: string, context: ContextContract): Promise<boolean> {
    return false;
  }

  private async ask(entry: string, input: string, output: string, context: ContextContract): Promise<boolean> {
    Logger.info(`Kindly asking to replace ${entry}.`);

    const replace = await context.task.prompt({
      type: 'Toggle',
      message: `${entry} already exists. Do you want to replace it?`,
      initial: true,
    });

    if (!replace) {
      Logger.info(`User chosed not to repace ${entry}.`);

      return false;
    }

    return await this.override(entry, input, output, context);
  }
}
