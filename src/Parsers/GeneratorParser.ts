import { injectable, inject } from 'inversify';
import { ParserContract, ParserContextData, ContextContract, GeneratorContract, ImporterContract } from '@/Contracts';
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
  @inject(Binding.Importer)
  private importer!: ImporterContract;

  async parse(directory: string, parserContext: Partial<ParserContextData> = {}): Promise<ContextContract | false> {
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

    const packagePath = path.join(directory, 'package.json');

    if (!fs.existsSync(packagePath)) {
      Log.fatal(`${Color.directory(directory)} does not have a ${Color.file('package.json')}.`);
      return false;
    }

    const presetPackage = require(packagePath); // Type that?
    const presetAbsolutePath = path.join(directory, presetPackage?.preset ?? 'preset.js');

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
      package: presetPackage,
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
   * Generates a context from the preset.
   */
  protected async generateContext(
    directory: string,
    generator: Partial<GeneratorContract>,
    parserContext: Partial<ParserContextData>
  ): Promise<ContextContract> {
    return {
      generator,
      // prompts: {},
      argv: parserContext.argv ?? [],
      temporary: parserContext.temporary ?? false,
      presetName: generator.name ?? parserContext?.package?.name ?? 'unnamed',
      targetDirectory: process.cwd(),
      presetDirectory: path.join(directory),
      presetTemplates: path.join(directory, generator?.templates ?? 'templates'),
      presetFile: path.join(directory, parserContext?.package?.preset ?? 'preset.js'),
      git: {
        context: simpleGit(process.cwd()),
        config: (await simpleGit().listConfig()).all,
      },
    };
  }
}
