import { injectable } from 'inversify';
import { ImporterContract, GeneratorContract } from '@/Contracts';
import { Log, Color } from '@/Logger';
import fs from 'fs-extra';
import { Text } from '@supportjs/text';
import { Logger } from '@poppinss/fancy-logs';

/**
 * Instead of requiring or importing, we read the preset file, transpile and evaluate it.
 * It allows for a no-dependency installation with a good DX for the preset developer.
 * This is risky, but the nature of `npx` is risky anyway. Any external script represents
 * a danger, so the end-user needs to be aware of that.
 */
@injectable()
export class EvalImporter implements ImporterContract {
  private static API_VARIABLE_NAME: string = 'api';
  private static USE_PRESET_IMPORT_NAME: string = 'use-preset';
  private static DEPENDENCY_WHITELIST: string[] = [
    '@poppinss/fancy-logs',
    '@poppinss/colors',
    '@poppinss/prompts',
    '@poppinss/utils',
    '@supportjs/text',
    'path',
    'fast-glob',
    'fs-extra',
    'node-fetch',
    'simple-git',
    'tmp',
    'os',
    'debug',
    'graceful-fs',
    'run-parallel',
    'cross-spawn',
  ];

  async import(filePath: string): Promise<false | GeneratorContract> {
    const presetFileContents = fs.readFileSync(filePath).toString();

    try {
      return this.evaluate(presetFileContents);
    } catch (error) {
      Log.debug(`Could not parse ${Color.file(filePath)}.`);
      Log.debug(error);
    }

    return false;
  }

  /**
   * Evaluates a script. Any require will be removed
   * @param content
   */
  private evaluate(content: string): GeneratorContract {
    this.ensureNoExternalRequire(content);
    content = this.replaceUsePresetRequire(content);

    return function () {
      const api = require('../api');

      return eval(content);
    }.call(undefined);
  }

  /**
   * Replaces imports of the API by the evaluation contextual syntax.
   */
  private replaceUsePresetRequire(content: string): string {
    return content.replace(
      new RegExp(`require *\\( *['"]${EvalImporter.USE_PRESET_IMPORT_NAME}['"] *\\)`, 'gm'),
      EvalImporter.API_VARIABLE_NAME
    );
  }

  /**
   * Removes require statements that do not require use-preset.
   */
  private ensureNoExternalRequire(content: string): string {
    return content
      .split(/\r\n|\r|\n/)
      .filter(line => {
        if (line.includes('require') && line.includes(EvalImporter.USE_PRESET_IMPORT_NAME)) {
          return true;
        }

        const match = line.match(/require *\( *['"](.*)['"] *\)/);
        if (match && !EvalImporter.DEPENDENCY_WHITELIST.includes(match[1])) {
          throw `Dependency ${Color.keyword(
            match[1]
          )} is not authorized. If you think this is a mistake, please open an issue.`;
        }

        return false;
      })
      .join('\n');
  }
}
