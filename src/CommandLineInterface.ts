import { flags, parse } from '@oclif/parser';
import { Text } from '@supportjs/text';
import { Listr } from 'listr2';
import { inject, injectable } from 'inversify';
import { Binding } from '@/Container';
import { ApplierContract } from '@/Contracts';
import { Logger } from '@/Logger';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs-extra';

@injectable()
export class CommandLineInterface {
  protected args = [
    {
      name: 'preset',
      description: 'A preset name, a local path to a preset, or a GitHub repository.',
    },
  ];

  protected flags = {
    version: flags.boolean({
      description: 'Display the current version.',
    }),
    debug: flags.boolean({
      description: 'Output debugging messages.',
    }),
    help: flags.boolean({
      description: 'Displays command line help.',
    }),
    in: flags.string({
      description: 'Specify a target directory for the preset.',
    }),
  };

  @inject(Binding.Applier)
  protected applier!: ApplierContract;

  async run(input: string[]): Promise<number> {
    const { args, flags, argv } = parse(input, {
      args: this.args,
      flags: this.flags,
      strict: false,
    });

    if (flags.version) {
      return await this.version();
    }

    if (flags.help) {
      return await this.help();
    }

    if (!args.preset) {
      return await this.missingPresetName();
    }

    Logger.info(`Applying preset ${args.preset}.`);
    const target = path.join(flags.in ?? process.cwd());
    const tasks = await this.applier.run({
      argv: argv.splice(1),
      debug: Boolean(flags.debug),
      resolvable: args.preset,
      in: target,
    });

    try {
      await new Listr(tasks).run();
    } catch (error) {
      Logger.cli(`Could not apply the preset. Check the logs in ${Logger.saveToFile()} for more information.`);

      return 1;
    }

    if (flags.debug) {
      Logger.cli(`Since debug is enabled, a log file has been saved in ${Logger.saveToFile()}.`);
    }

    return 0;
  }

  async missingPresetName(): Promise<number> {
    Logger.cli(chalk.redBright(`The preset name is missing.`));
    await this.help();

    return 1;
  }

  async version(): Promise<number> {
    const { version } = fs.readJsonSync(path.join(__dirname, '../package.json'));
    Logger.cli(`v${version}`);

    return 0;
  }

  async help(): Promise<number> {
    Logger.cli(
      Text.make(chalk.gray('Usage: ')) //
        .append('npx use-preset')
        .space()
        .append(chalk.gray('<'))
        .append('name')
        .append(chalk.gray('>'))
        .str()
    );

    return 0;
  }
}
