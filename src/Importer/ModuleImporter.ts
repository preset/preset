import vm from 'vm';
import path from 'path';
import fs from 'fs-extra';
import { buildSync } from 'esbuild';
import { inject, injectable } from 'inversify';
import { Binding, Bus, color, ExecutionError, getPackage, ImporterContract, Preset } from '@/exports';

@injectable()
export class ModuleImporter implements ImporterContract {
  @inject(Binding.Bus)
  protected bus!: Bus;

  async import(directory: string): Promise<Preset> {
    this.bus.debug(`Importing preset at ${color.magenta(directory)}.`);

    const filename = this.findConfiguration(directory);
    const script = fs.readFileSync(filename).toString();
    const sanitizedScript = this.removeSelfImportStatement(script);

    return await this.evaluateConfiguration(sanitizedScript, directory, filename);
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

        if (fs.statSync(presetPath).isFile()) {
          return presetPath;
        }

        throw new ExecutionError()
          .withMessage(`The specified configuration file does not exist (${color.magenta(presetPath)}).`)
          .withoutStack()
          .stopsExecution();
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
        this.bus.debug(`Found preset file at ${color.underline(file)}.`);
        return file;
      }
    }

    throw new ExecutionError()
      .withMessage(`The configuration file could not be found (tried in ${color.magenta(directory)}).`)
      .withoutStack()
      .stopsExecution();
  }

  /**
   * Evaluates the configuration and returns the preset.
   */
  protected async evaluateConfiguration(script: string, directory: string, filename: string): Promise<Preset> {
    try {
      const context = vm.createContext(this.createContext(directory, filename));

      const code = this.transformScript(script, directory, filename);
      vm.runInContext(code, context);

      return context.Preset as Preset;
    } catch (error) {
      throw new ExecutionError() //
        .withMessage(`The preset could not be evaluated.`)
        .withCompleteStack(error)
        .stopsExecution();
    }
  }

  /**
   * Removes the import statement for this very package from the given script.
   */
  protected removeSelfImportStatement(script: string) {
    return script
      .split(/\r\n|\r|\n/)
      .filter((line) => {
        const lineImports = ['import', 'require'].some((statement) => line.includes(statement));
        const lineMentionsImportValue = [getPackage().name, 'color', '@/api', 'use-preset'].some((imp) => line.includes(imp));

        if (lineImports && lineMentionsImportValue) {
          return false;
        }

        return true;
      })
      .join('\n');
  }

  protected transformScript(contents: string, resolveDir: string, sourcefile: string): string {
    const { outputFiles } = buildSync({
      stdin: {
        contents,
        resolveDir,
        sourcefile,
        loader: 'ts',
      },
      platform: 'node',
      format: 'cjs',
      external: ['apply'],
      bundle: true,
      write: false,
    });

    return outputFiles[0].text;
  }

  protected createContext(directory: string, filename: string): Record<string, any> {
    const exports = {};
    const moduleGlobals = {
      exports,
      require,
      module: {
        exports,
        filename,
        id: filename,
        path: directory,
        require: module.require,
      },
      __dirname: directory,
      __filename: filename,
    };

    const nodeGlobals = {
      Buffer,
      clearImmediate,
      clearInterval,
      clearTimeout,
      console,
      global,
      process,
      queueMicrotask,
      setImmediate,
      setInterval,
      setTimeout,
      TextDecoder: (global as any).TextDecorator,
      TextEncoder: (global as any).TextEncoder,
      URL: (global as any).URL,
      URLSearchParams: (global as any).URLSearchParams,
      WebAssembly: (global as any).WebAssembly,
    };

    return {
      ...moduleGlobals,
      ...nodeGlobals,

      Preset: new Preset(),
      color,
    };
  }
}
