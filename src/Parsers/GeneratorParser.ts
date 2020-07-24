import { injectable, inject } from 'inversify';
import { parse, Output } from '@oclif/parser';
import {
  ParserContract,
  ParserOptionsContract,
  ContextContract,
  GeneratorContract,
  ImporterContract,
} from '@/Contracts';
import { Logger } from '@/Logger';
import { Binding } from '@/Container';
import fs from 'fs-extra';
import path from 'path';
import simpleGit from 'simple-git';
import { Preset, PendingObject, PendingEditionSearch } from '@/Preset';

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
    Logger.info(`Parsing preset at ${directory}.`);

    // Checks that the given directory is indeed one
    if (!directory || !fs.pathExistsSync(directory) || !fs.statSync(directory).isDirectory) {
      throw new Error(`${directory} is not a preset directory.`);
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
      throw new Error(`${directory} does not have a package.json file.`);
    }

    // If a package exists though, we got this
    else if (fs.existsSync(packagePath)) {
      packageContents = require(packagePath);
    }

    const presetAbsolutePath = path.join(directory, packageContents.preset ?? this.DEFAULT_PRESET_FILE);

    // Preset file check
    if (!fs.existsSync(presetAbsolutePath)) {
      throw new Error(`Preset file ${presetAbsolutePath} does not exist.`);
    }

    // Import the preset
    Logger.info(`Evaluating preset.`);
    let generator = await this.importer.import(presetAbsolutePath);

    // Make sure it's not empty
    if (!generator) {
      throw new Error(`${presetAbsolutePath} is not a valid preset file.`);
    }

    if (generator instanceof PendingEditionSearch) {
      Logger.info(`Converting from builder instance's pending edition object to builder instance.`);
      generator = generator.end().chain();
    }

    // Convert it from pending object to generator
    if (generator instanceof PendingObject) {
      Logger.info(`Converting from builder instance's pending object to builder instance.`);
      generator = generator.chain();
    }

    // Convert it from builder to generator
    if (generator instanceof Preset) {
      Logger.info(`Converting from builder instance to plain generator object.`);
      generator = generator.toGenerator();
    }

    // Preset check
    if (!(await this.isPresetValid(generator))) {
      throw new Error(`${presetAbsolutePath} is not a valid preset file.`);
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
    if (!Reflect.has(generator, 'actions')) {
      Logger.info('Generator is invalid because it does not have an "actions" property.');
      return false;
    }

    if (typeof generator.actions !== 'function') {
      Logger.info('Generator is invalid because its "actions" property is not a function.');
      return false;
    }

    return true;
  }

  /**
   * Parses the arguments and flags from the context thanks to @oclif/parser.
   */
  protected parseArgumentsAndFlags(context: ContextContract): undefined | Output<any, any> {
    Logger.info(`Parsing arguments and flags.`);
    try {
      if (typeof context.generator.parse === 'function') {
        return parse(context.argv ?? [], {
          ...context.generator.parse(context),
          strict: false,
        });
      }
    } catch (error) {
      if (error?.oclif?.exit === 2) {
        Logger.info(`Could not parse extra arguments.`);
        Logger.info(`This is probably an issue from this preset, not from ${'use-preset'}.`);
      }

      Logger.error(error);
    }

    return undefined;
  }

  /**
   * Generates a context from the preset.
   */
  protected async generateContext(
    directory: string,
    generator: GeneratorContract,
    parserContext: Partial<ParserOptionsContract>
  ): Promise<ContextContract> {
    const targetDirectory = parserContext?.applierOptions?.in ?? process.cwd();

    if (!fs.pathExistsSync(targetDirectory)) {
      Logger.info(`Creating target directory ${targetDirectory}.`);
      fs.ensureDirSync(targetDirectory);
    }

    if (!fs.statSync(targetDirectory).isDirectory()) {
      throw 'Target exists but is not a directory.';
    }

    Logger.info(`Generating context.`);
    const context: ContextContract = {
      generator,
      debug: Boolean(parserContext.applierOptions?.debug),
      targetDirectory,
      task: parserContext.task!,
      argv: parserContext?.applierOptions?.argv ?? [],
      temporary: parserContext.temporary ?? false,
      presetName:
        generator.name ?? parserContext?.package?.name ?? parserContext?.applierOptions?.resolvable ?? directory,
      presetDirectory: path.join(directory),
      presetTemplates: path.join(directory, generator?.templates ?? 'templates'),
      presetFile: path.join(directory, parserContext?.package?.preset ?? this.DEFAULT_PRESET_FILE),
      prompts: {},
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
