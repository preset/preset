import { injectable, inject } from 'inversify';
import { parse, Output } from '@oclif/parser';
import {
  ParserContract,
  ParserOptionsContract,
  ContextContract,
  GeneratorContract,
  ImporterContract,
} from '@/Contracts';
import { Log, Color } from '@/Logger';
import { Binding } from '@/Container';
import fs from 'fs-extra';
import path from 'path';
import simpleGit from 'simple-git';

/**
 * Parses a preset that should have at least a "preset.js" file, or
 * a package.json file with a preset key which contains the path to the preset file.
 */
@injectable()
export class GeneratorParser implements ParserContract {
  private readonly DEFAULT_PRESET_FILE = 'preset.js';

  @inject(Binding.Importer)
  private importer!: ImporterContract;

  async parse(directory: string, parserContext: Partial<ParserOptionsContract> = {}): Promise<ContextContract | false> {
    Log.debug(`Parsing preset at ${Color.directory(directory)}.`);

    // Checks that the given directory is indeed one
    if (!directory || !fs.pathExistsSync(directory) || !fs.statSync(directory).isDirectory) {
      Log.fatal(`${Color.directory(directory)} is not a preset directory.`);
      return false;
    }

    // Make the path absolute
    if (!path.isAbsolute(directory)) {
      directory = path.join(process.cwd(), directory);
    }

    let packageContents = { preset: this.DEFAULT_PRESET_FILE };
    const packagePath = path.join(directory, 'package.json');
    const defaultPresetPath = path.join(directory, this.DEFAULT_PRESET_FILE);

    // If neither the default preset path nor a package.json exists, this is an error
    if (!fs.existsSync(defaultPresetPath) && !fs.existsSync(packagePath)) {
      Log.fatal(`${Color.directory(directory)} does not have a ${Color.file('package.json')}.`);
      return false;
    }

    // If a package exists though, we got this
    else if (fs.existsSync(packagePath)) {
      packageContents = require(packagePath);
    }

    const presetAbsolutePath = path.join(directory, packageContents.preset ?? this.DEFAULT_PRESET_FILE);

    // Preset file check
    if (!fs.existsSync(presetAbsolutePath)) {
      Log.fatal(`Preset file ${Color.file(presetAbsolutePath)} does not exist.`);
      return false;
    }

    // Import the preset
    Log.debug(`Evaluating preset.`);
    const generator = await this.importer.import(presetAbsolutePath);

    // Preset check
    if (!generator || !(await this.isPresetValid(generator))) {
      Log.fatal(`${Color.file(presetAbsolutePath)} is not a valid preset file.`);
      return false;
    }

    return await this.generateContext(directory, generator, {
      ...parserContext,
      package: packageContents,
    });
  }

  /**
   * Ensures that the preset is valid.
   */
  protected async isPresetValid(generator: Partial<GeneratorContract>): Promise<boolean> {
    if (!generator?.actions || typeof generator?.actions !== 'function') {
      Log.warn(`Preset is not valid because it lacks an ${Color.keyword('action')} key.`);
      return false;
    }

    return true;
  }

  /**
   * Parses the arguments and flags from the context thanks to @oclif/parser.
   */
  protected parseArgumentsAndFlags(context: ContextContract): undefined | Output<any, any> {
    Log.debug(`Parsing arguments and flags.`);
    try {
      if (typeof context.generator.parse === 'function') {
        return parse(context.argv ?? [], {
          ...context.generator.parse(context),
          strict: false,
        });
      }
    } catch (error) {
      if (error?.oclif?.exit === 2) {
        Log.warn(`Could not parse extra arguments.`);
        Log.warn(`This is probably an issue from this preset, not from ${Color.preset('use-preset')}.`);
      }

      Log.debug(error);
    }

    return undefined;
  }

  /**
   * Generates a context from the preset.
   */
  protected async generateContext(
    directory: string,
    generator: Partial<GeneratorContract>,
    parserContext: Partial<ParserOptionsContract>
  ): Promise<ContextContract> {
    const targetDirectory = parserContext?.applierOptions?.in ?? process.cwd();

    if (!fs.pathExistsSync(targetDirectory)) {
      Log.debug(`Creating target directory ${Color.directory(targetDirectory)}.`);
      fs.ensureDirSync(targetDirectory);
    }

    if (!fs.statSync(targetDirectory).isDirectory()) {
      throw 'Target exists but is not a directory.';
    }

    Log.debug(`Generating context.`);
    const context = {
      generator,
      targetDirectory,
      argv: parserContext?.applierOptions?.argv ?? [],
      temporary: parserContext.temporary ?? false,
      presetName: generator.name ?? parserContext?.package?.name ?? 'unnamed',
      presetDirectory: path.join(directory),
      presetTemplates: path.join(directory, generator?.templates ?? 'templates'),
      presetFile: path.join(directory, parserContext?.package?.preset ?? this.DEFAULT_PRESET_FILE),
      git: {
        context: simpleGit(process.cwd()),
        config: (await simpleGit().listConfig()).all,
      },
    };

    const parsed = this.parseArgumentsAndFlags(context);

    return <ContextContract>{
      ...context,
      args: parsed?.args ?? {},
      flags: parsed?.flags ?? {},
    };
  }
}
