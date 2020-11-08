import createInterface from 'cac';
import { inject, injectable } from 'inversify';
import { CommandLineInterfaceParameter, CommandLineInterfaceOption, OutputContract } from '@/Contracts/OutputContract';
import { bus, log, outputHelp, outputVersion } from '@/events';
import { getAbsolutePath, getPackage } from '@/utils';
import { ApplierContract } from '@/Contracts/ApplierContract';
import { Binding } from '@/Container/Binding';
import { logger } from '@/logger';

/**
 * Command line interface for applying a preset.
 */
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
    { definition: '-v', description: 'Define the verbosity level (eg. -vv).', type: [] },
    { definition: '--version', description: 'Display the version number.' },
  ];

  /**
   * Runs the CLI.
   */
  async run(argv: string[]): Promise<number> {
    const { args, options } = this.parse(argv);
    const [resolvable, target] = args;

    // Registers the output, which is event-based
    this.output.register(options.v?.length ?? 0);

    if (options.help) {
      bus.publish(outputHelp({ parameters: this.parameters, options: this.options }));
      return 0;
    }

    if (options.version) {
      bus.publish(outputVersion());
      return 0;
    }

    if (!resolvable) {
      logger.fatal('The resolvable is missing. Please consult the usage below.');
      bus.publish(outputHelp({ parameters: this.parameters, options: this.options }));
      return 1;
    }

    const result = await this.applier
      .run({
        resolvable,
        target: getAbsolutePath(target),
        options,
      })
      .catch((error) => {
        logger.fatal(error);
      });

    return result ? 0 : 1;
  }

  /**
   * Parses the command line arguments.
   */
  parse(argv: string[]): ParsedArgv {
    const cli = createInterface(getPackage().name);
    this.options.forEach(({ definition, description, type }) => cli.option(definition, description, { type }));

    return cli.parse(process.argv.splice(0, 2).concat(argv));
  }
}

interface ParsedArgv {
  args: ReadonlyArray<string>;
  options: {
    [k: string]: any;
  };
}
