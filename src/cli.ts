import { parse, flags } from '@oclif/parser';
import { Preset } from './Preset';

class Command {
  protected args = [
    {
      name: 'preset',
      description: 'A preset name, a local path to a preset, or a GitHub repository.',
      required: true,
    },
  ];

  protected flags = {
    debug: flags.boolean({
      char: 'd',
      description: 'Output debugging messages.',
    }),
  };

  async run(): Promise<void> {
    const { args, flags, argv } = parse(process.argv.splice(2), {
      args: this.args,
      flags: this.flags,
      strict: false,
    });

    await Preset.run(args.preset, flags.debug !== false, argv.splice(1));
  }
}

export = new Command();
