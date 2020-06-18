import { Log, Color, ContextContract, GeneratorContract, PackageContract } from '../';
import { parse } from '@oclif/parser';
import path from 'path';
import git from 'simple-git';

/**
 * A preset object, containing the use-defined generator object and a method
 * to get the current context.
 */
export class Preset {
  private generator: GeneratorContract;

  private constructor(generator: GeneratorContract) {
    this.generator = generator;
  }

  /**
   * Make a generator.
   * This is just for types, it doesn't actually create anything.
   *
   * @param generator The generator object.
   */
  static make(generator: GeneratorContract): GeneratorContract {
    return generator;
  }

  /**
   * Make a preset from a generator.
   *
   * @param generator The generator object.
   */
  static from(generator: GeneratorContract): Preset {
    return new Preset(generator);
  }

  /**
   * Checks if the preset is valid.
   */
  isValid(): boolean {
    if (!this.generator) {
      return false;
    }

    if (!this.generator.actions) {
      return false;
    }

    if (typeof this.generator.actions !== 'function') {
      return false;
    }

    return true;
  }

  /**
   * Generate a context object from the given resolved directory.
   *
   * @param resolved The directory in which the preset has been cloned.
   * @param presetPackage The package.json of the preset.
   * @param args Additional command line arguments
   */
  async generateContext(
    resolved: string,
    presetPackage: PackageContract,
    temporary: boolean,
    ...argv: string[]
  ): Promise<ContextContract | never> {
    // Creates the context based on what we currently have.
    const context: Partial<ContextContract> = {
      argv,
      temporary,
      presetName: this.generator.name || presetPackage.name || 'Unnamed',
      targetDirectory: process.cwd(),
      presetDirectory: path.join(resolved),
      presetTemplates: path.join(resolved, this.generator.templates ?? 'templates'),
      presetFile: path.join(resolved, presetPackage.preset ?? 'preset.js'),
      generator: this.generator,
      git: {
        context: git(),
        config: (await git().listConfig()).all,
      },
    };

    // Parses the additional arguments.
    let parsed = undefined;
    try {
      if (typeof this.generator.parse === 'function') {
        parsed = parse(argv, {
          ...this.generator.parse<any>(context),
          strict: false,
        });
      }
    } catch (error) {
      if (error?.oclif?.exit === 2) {
        // TODO - better help and support for this?
        Log.fatal(`Could not parse extra arguments.`);
        Log.warn(`This is probably an issue from this preset, not from ${Color.preset('use-preset')}.`);
        return process.exit();
      }

      return Log.exit(error);
    }

    // Returns the complete context.
    return <ContextContract>{
      ...context,
      args: parsed?.args,
      flags: parsed?.flags,
    };
  }
}

// const result = parse(args, {
// 	flags: {
// 		auth: flags.boolean({ char: 'a' }),
// 	},
// 	strict: false,
// });
// console.log({ name, debug, args, result });
