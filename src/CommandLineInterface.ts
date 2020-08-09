import { Listr } from 'listr2';
import { inject, injectable } from 'inversify';
import { Binding } from '@/Container';
import { ApplierContract } from '@/Contracts';
import { Logger } from '@/Logger';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs-extra';
import makeCli from 'cac';
import debug from 'debug';

@injectable()
export class CommandLineInterface {
  protected args = [
    {
      name: 'preset',
      description: 'A preset name, a local path to a preset, or a GitHub repository.',
    },
  ];

  @inject(Binding.Applier)
  protected applier!: ApplierContract;

  async run(argv: string[]): Promise<number> {
    const cli = makeCli('use-preset');
    const { args, options } = cli
      .option('--debug', 'Output debugging messages after applying preset')
      .option('--in <path>', 'Specify a target directory for the preset')
      .help(this.getHelpProcessor())
      .version(this.getVersion())
      .parse(process.argv.splice(0, 2).concat(argv));

    const [resolvable] = args;

    if (options.in && !path.isAbsolute(options.in)) {
      options.in = path.join(process.cwd(), options.in);
    }

    if (!resolvable) {
      Logger.info(`No resolvable given.`);
      cli.outputHelp();
      return 1;
    }

    const debug = this.isDebugging(options.debug);
    const target = path.join(options.in ?? process.cwd());

    Logger.info(`Applying preset ${resolvable}.`);
    Logger.info(`Target directory is ${target}.`);
    const tasks = await this.applier.run({
      in: target,
      argv,
      debug,
      resolvable,
    });

    try {
      Logger.info(`Running tasks.`);
      await new Listr(tasks).run();
      Logger.info(`Successfully applied preset.`);
    } catch (error) {
      Logger.error(error);
      Logger.cli('');
      Logger.cli(
        `${chalk.red('×')} Could not apply the preset. Check the logs in ${Logger.saveToFile()} for more information.`
      );

      this.dumpIfDebug(debug);

      return 1;
    }

    this.dumpIfDebug(debug);

    return 0;
  }

  dumpIfDebug(debug: boolean): void {
    if (!debug) {
      return;
    }

    Logger.cli('');
    Logger.dump();
    Logger.cli('');
    Logger.cli(`${chalk.gray(`➜ A log file has been saved in ${chalk.reset(Logger.saveToFile())}`)}${chalk.gray('.')}`);
  }

  getHelpProcessor() {
    return (sections: any[]) => {
      // Replace "command" by "preset" in the usage text
      const [, usage] = sections;
      usage.body = usage.body.replace('<command>', '<preset>');

      // Define the list of custom parameters
      const parameters = [{ name: 'preset', description: 'An URL, a GitHub shorthand or a local path.' }];

      // Find the index at which the description starts for options
      // so we can align the arguments description with it
      const index = sections[2].body.split('\n').reduce((a: string, b: string) => {
        const seek = '  ';
        const lastOfA = a.toString().lastIndexOf(seek);
        const lastOfB = b.toString().lastIndexOf(seek);

        return (lastOfA > lastOfB ? lastOfA : lastOfB) - seek.length;
      });

      // Format the body for the parameter help
      const body = parameters
        .map(({ name, description }) => {
          return `  <${name}>${' '.repeat(index - name.length)}${description}`;
        })
        .join('\n');

      sections.splice(2, 0, {
        title: 'Arguments',
        body,
      });
    };
  }

  isDebugging(shouldDebug?: boolean): boolean {
    // If shouldDebug is defined, it has been explicitly set, so it
    // takes priority
    if (typeof shouldDebug !== 'undefined') {
      return shouldDebug;
    }

    return debug('use-preset').enabled;
  }

  getVersion(): string {
    return fs.readJsonSync(path.join(__dirname, '../package.json')).version;
  }
}
