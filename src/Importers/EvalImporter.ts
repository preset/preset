import { injectable } from 'inversify';
import { ImporterContract, GeneratorContract } from '@/Contracts';
import { Log, Color } from '@/Logger';
import fs from 'fs-extra';

/**
 * Instead of requiring or importing, we read the preset file, transpile and evaluate it.
 * It allows for a no-dependency installation with a good DX for the preset developer.
 * This is risky, but the nature of `npx` is risky anyway. Any external script represents
 * a danger, so the end-user needs to be aware of that.
 */
@injectable()
export class EvalImporter implements ImporterContract {
  async import(filePath: string): Promise<false | GeneratorContract> {
    const presetFileContents = fs.readFileSync(filePath).toString();

    try {
      return eval(presetFileContents) as GeneratorContract;
    } catch (error) {
      Log.fatal(`Could not parse ${Color.file(filePath)}.`);
      Log.fatal(error);
    }

    return false;
  }
}
