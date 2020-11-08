import { ImporterContract } from '@/Contracts/ImporterContract';
import { ImportError } from '@/Errors/ImportError';
import { inject, injectable } from 'inversify';
import { color, getPackage } from '@/utils';
import { Binding } from '@/Container';
import { Bus } from '@/bus';
import { Preset as StaticPreset } from '@/Configuration/Preset';
import { transformSync } from 'esbuild';
import fs from 'fs-extra';
import path from 'path';
import vm from 'vm';

@injectable()
export class ModuleImporter implements ImporterContract {
  @inject(Binding.Bus)
  protected bus!: Bus;

  async import(directory: string): Promise<StaticPreset> {
    this.bus.info(`Importing preset at ${color.magenta(directory)}.`);

    const script = fs.readFileSync(this.findConfiguration(directory)).toString();
    const sanitizedScript = this.removeSelfImportStatement(script);

    return await this.evaluateConfiguration(sanitizedScript);
  }

  /**
   * Finds the configuration file for the given directory.
   */
  protected findConfiguration(directory: string): string {
    const packagePath = path.join(directory, 'package.json');

    // Tries to find a specified configuration file in the package.json.
    // If there is a specified file that does not exist, we throw.
    // If there is no specified file, we try to guess it.
    if (fs.existsSync(packagePath)) {
      const { preset } = JSON.parse(fs.readFileSync(packagePath).toString());

      if (preset) {
        const presetPath = path.join(directory, preset);

        if (fs.existsSync(presetPath)) {
          return preset;
        }

        throw ImportError.specifiedConfigurationNotFound(presetPath);
      }
    }

    // Tries to guess the configuration file. It can be in ./
    // or ./src, is named "preset" and can have a few extensions.
    const paths = ['preset', 'src/preset'];
    const extensions = ['ts', 'js', 'mjs', 'cjs'];
    const files: string[] = [];

    paths.forEach((file) => {
      extensions.forEach((extension) => {
        files.push(path.join(directory, `${file}.${extension}`));
      });
    });

    for (const file of files) {
      if (fs.existsSync(file)) {
        return file;
      }
    }

    throw ImportError.configurationNotFound(directory);
  }

  /**
   * Evaluates the configuration and returns the preset.
   */
  protected async evaluateConfiguration(script: string): Promise<StaticPreset> {
    try {
      const context = vm.createContext({
        exports: {},
        require,
        module,
        Preset: new StaticPreset(),
      });

      const { code } = transformSync(script, { format: 'cjs' });
      vm.runInContext(code, context);

      return context.Preset as StaticPreset;
    } catch (error) {
      throw ImportError.evaluationFailed(error);
    }
  }

  /**
   * Removes the import statement for this very package from the given script.
   */
  protected removeSelfImportStatement(script: string) {
    return script
      .split(/\r\n|\r|\n/)
      .filter((line) => {
        if (['import', 'require'].some((statement) => line.includes(statement)) && line.includes(getPackage().name)) {
          return false;
        }

        return true;
      })
      .join('\n');
  }
}
