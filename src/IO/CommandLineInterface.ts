import createInterface from 'cac';
import { inject, injectable } from 'inversify';
import { Binding } from '@/Container/Binding';
import { CommandLineInterfaceParameter, CommandLineInterfaceOption, OutputContract } from '@/Contracts/OutputContract';
import { ApplierContract } from '@/Contracts/ApplierContract';
import { getAbsolutePath } from '@/utils';
import { bus, log, outputHelp, outputVersion } from '@/events';

@injectable()
export class CommandLineInterface {
  @inject(Binding.Output)
  protected output!: OutputContract;

  @inject(Binding.Applier)
  protected applier!: ApplierContract;

  protected parameters: CommandLineInterfaceParameter[] = [
    { name: 'resolvable', description: 'A GitHub repository URL or a local path.', optional: false },
    { name: 'target', description: 'The directory in which to apply the preset.', optional: true },
  ];

  protected options: CommandLineInterfaceOption[] = [
    { definition: '-p, --path [path]', description: 'The path to a sub-directory in which to look for a preset.' },
    { definition: '-h, --help', description: 'Display this help message.' },
    { definition: '-v', description: 'Define the verbosity level (eg. -vvv).', type: [] },
    { definition: '--version', description: 'Display the version number.' },
  ];

  async run(argv: string[]): Promise<number> {
    const cli = createInterface('use-preset');
    this.options.forEach(({ definition, description, type }) => cli.option(definition, description, { type: type }));

    const { args, options } = cli.parse(process.argv.splice(0, 2).concat(argv));
    const [resolvable, target] = args;
    const verbosity = options.v?.length ?? 0;

    // Registers the output, which is event-based
    this.output.register(verbosity);

    if (!resolvable) {
      bus.publish(log({ level: 'fatal', content: 'The resolvable is missing. Please consult the usage below.' }));
      bus.publish(outputHelp({ parameters: this.parameters, options: this.options }));
      return 1;
    }

    if (options.help) {
      bus.publish(outputHelp({ parameters: this.parameters, options: this.options }));
      return 0;
    }

    if (options.version) {
      bus.publish(outputVersion());
      return 0;
    }

    // Applies the preset
    const result = await this.applier
      .run({
        resolvable,
        target: getAbsolutePath(target),
        options,
      })
      .catch((error) => {
        bus.publish(log({ level: 'fatal', content: error }));
        return false;
      });

    return result ? 0 : 1;
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
}
