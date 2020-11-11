import { CommandLineInterfaceParameter, CommandLineInterfaceOption, OutputContract, Verbosity } from '@/Contracts/OutputContract';
import { bus, outputHelp, outputVersion, outputMessage, LogLevel, outputInstructions } from '@/bus';
import { getPackage, getVersion } from '@/utils';
import { logger, instructions } from '@poppinss/cliui';
import { injectable } from 'inversify';

/**
 * This stuff may be greatly improved. It's not the priority though.
 */
@injectable()
export class ConsoleOutput implements OutputContract {
  protected verbosity!: Verbosity;

  async register(verbosity: Verbosity): Promise<void> {
    this.verbosity = verbosity;
    this.subscribe();
  }

  protected subscribe(): void {
    bus.on(outputVersion, this.displayVersion);
    bus.on(outputHelp, ({ payload: { options, parameters } }) => this.displayHelp(options, parameters));
    bus.on(outputMessage, ({ payload: { level, content } }) => this.log(level, content));

    bus.on(outputInstructions, ({ payload: { heading, instructions: instructionMessages } }) => {
      console.log();
      const instructionLogger = instructions();

      if (heading) {
        instructionLogger.heading(heading);
      }

      instructionMessages //
        .filter(Boolean)
        .forEach((instruction) => instructionLogger.add(instruction));

      instructionLogger.render();
    });
  }

  protected log(level: LogLevel, content: string | Error): void {
    if (level === 'debug' && this.verbosity < 1) {
      return;
    }

    if (content instanceof Error) {
      logger['fatal'](content);
    } else {
      logger[level](content);
    }
  }

  protected displayVersion(): void {
    console.log(getVersion());
  }

  protected displayHelp(options: CommandLineInterfaceOption[], parameters: CommandLineInterfaceParameter[]): void {
    // Gets the maximum length of a parameter or option
    // prettier-ignore
    const candidates = [
      ...options.map(({ definition }) => definition),
      ...parameters.map(({ name }) => name),
		];
    const maxLength = Math.max(...candidates.map((item) => item.length));

    // Start with the usage
    const usageBlock = {
      title: 'Usage',
      body:
        `  $ ${getPackage().name} ` +
        parameters
          .map((parameter) => {
            if (parameter.optional) {
              return `[${parameter.name}]`;
            }

            return `<${parameter.name}>`;
          })
          .join(' ') +
        ' [options]',
    };

    // Defines the parameters
    const parametersBlock = {
      title: 'Parameters',
      body: parameters
        .map((parameter) => {
          return `  ${parameter.name} ${' '.repeat(maxLength - parameter.name.length)} ${parameter.description}`;
        })
        .join('\n'),
    };

    // Defines the options
    const optionsBlock = {
      title: 'Options',
      body: options
        .map((option) => {
          return `  ${option.definition} ${' '.repeat(maxLength - option.definition.length)} ${option.description}`;
        })
        .join('\n'),
    };

    const usage = [usageBlock, parametersBlock, optionsBlock]
      .map((section) => {
        let output = '';

        if (section.title) {
          output += `${section.title}:\n`;
        }

        output += section.body + '\n';

        return output;
      })
      .join('\n');

    console.log(usage);
  }
}
