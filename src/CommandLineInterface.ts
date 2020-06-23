import { flags, parse } from '@oclif/parser';
import { Text } from '@supportjs/text';
import { inject, injectable } from 'inversify';
import { Binding } from '@/Container';
import { ApplierContract } from '@/Contracts';
import { Log, Color } from '@/Logger';
import path from 'path';

@injectable()
export class CommandLineInterface {
  protected args = [
    {
      name: 'preset',
      description: 'A preset name, a local path to a preset, or a GitHub repository.',
    },
  ];

  protected flags = {
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

    if (flags.debug) {
      Log.configure({ debug: true });
    }

    if (flags.help) {
      return await this.help();
    }

    if (!args.preset) {
      return await this.missingPresetName();
    }

    Log.debug(`Applying preset ${Color.resolvable(args.preset)}.`);
    const target = path.join(flags.in ?? process.cwd());
    const success = await this.applier.run(args.preset, {
      argv: argv.splice(1),
      debug: !!flags.debug,
      in: target,
    });

    if (success) {
      Log.debug(`Applied preset ${Color.preset(args.preset)} into ${Color.directory(target)}.`);
      return 0;
    }

    // TODO - Add instruction to know what happened
    // --debug flag or --report flag
    Log.fatal(
      `Preset ${Color.preset(args.preset)} could not be applied. Use the ${Color.preset(
        '--debug'
      )} flag for more informations.`
    );
    return 1;
  }

  async missingPresetName(): Promise<number> {
    Log.fatal(Color.error(`The preset name is missing.`));
    await this.help();

    return 1;
  }

  async help(): Promise<number> {
    Log.log(
      'info',
      Text.make(Color.debug('Usage: ')) //
        .append('npx use-preset')
        .space()
        .append(Color.debug('<'))
        .append('name')
        .append(Color.debug('>'))
    );

    return 0;
  }
}
