import { flags, parse } from '@oclif/parser';
import { inject, injectable } from 'inversify';
import { Binding } from './Container';
import { ApplierContract } from 'Contracts';

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
  };

  @inject(Binding.Applier)
  protected applier!: ApplierContract;

  async run(input: string[]): Promise<number> {
    const { args, flags, argv } = parse(input, {
      args: this.args,
      flags: this.flags,
      strict: false,
    });

    if (flags.help) {
      return await this.help();
    }

    if (!args.preset) {
      return await this.missingArgument();
    }

    return await this.applier.run(args.preset, argv.splice(1), !!flags.debug);
  }

  async missingArgument(): Promise<number> {
    // console.log('Missing preset name.'); // TODO Log
    await this.help();

    return 1;
  }

  async help(): Promise<number> {
    // console.log('Usage: npx use-preset <name>'); // TODO Log

    return 1;
  }
}
