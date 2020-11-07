import fs from 'fs-extra';
import path from 'path';
import createInterface from 'cac';
import { inject, injectable } from 'inversify';
import { logger } from '@poppinss/cliui';
import { Binding } from '@/Container/Binding';
import { OutputContract } from '@/Contracts/OutputContract';
import { ApplierContract } from '@/Contracts/ApplierContract';
import { getAbsolutePath } from '@/utils';

@injectable()
export class CommandLineInterface {
  @inject(Binding.Output)
  protected output!: OutputContract;

  @inject(Binding.Applier)
  protected applier!: ApplierContract;

  async run(argv: string[]): Promise<number> {
    // Registers the output, which is event-based and decoupled from
    // the application
    this.output.register();

    // Creates a simple CLI
    const cli = createInterface('use-preset');
    const { args, options } = cli
      .option('--directory [directory]', 'The path to a sub-directory in which to look for a preset.')
      .help(this.getHelpProcessor())
      .version(this.getVersion())
      .parse(process.argv.splice(0, 2).concat(argv));

    // Extract the resolvable and the target directory from the arguments
    const [resolvable, target] = args;

    // Ensures a resolvable is given, without it Preset can't apply anything
    if (!resolvable) {
      logger.fatal('The resolvable is missing. Please consult the usage below.');
      cli.outputHelp();
      return 1;
    }

    // Applies the preset
    await this.applier.run({
      resolvable,
      target: getAbsolutePath(target),
      options,
    });

    return 0;
  }

  getHelpProcessor() {
    return (sections: any[]) => {
      // Define the list of custom parameters
      const parameters = [
        { name: 'resolvable', description: 'A GitHub repository URL or a local path.' },
        { name: 'target', description: 'The directory in which to apply the preset.' },
      ];

      // Replace "command" by "preset" in the usage text
      const [, usage] = sections;
      usage.body = usage.body.replace('<command>', parameters.map(({ name }) => `<${name}>`).join(' '));

      // Find the index at which the description starts for options
      // so we can align the arguments description with it
      const index = sections[2].body.split('\n').reduce((a: string, b: string) => {
        const seek = '  ';
        const lastOfA = a.toString().lastIndexOf(seek);
        const lastOfB = b.toString().lastIndexOf(seek);

        return lastOfA > lastOfB ? lastOfA : lastOfB;
      });

      // Format the body for the parameter help
      const body = parameters
        .map(({ name, description }) => {
          return `  ${name}${' '.repeat(index - name.length)}${description}`;
        })
        .join('\n');

      sections.splice(2, 0, {
        title: 'Arguments',
        body,
      });
    };
  }

  getVersion(): string {
    return fs.readJsonSync(path.join(__dirname, '../../package.json')).version;
  }
}
