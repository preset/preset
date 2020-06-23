import {
  FakePrompt,
  Prompt as ConsolePrompt,
  TextPromptOptions,
  EnumPromptOptions,
  BooleanPromptOptions,
  TogglePromptOptions,
  PromptChoice,
  ChoicePromptOptions,
  MultiplePromptOptions,
  AutoCompletePromptOptions,
  PromptEventOptions,
} from '@poppinss/prompts';

// TODO - Clean this shit

interface PromptOptions {
  fake: boolean;
}

export interface DirectPromptOptions {
  type: 'input' | 'select' | 'confirm' | 'password' | 'numeral' | 'autocomplete' | string;
  name: string;
  message: string;
  skip?: boolean;
  initial?: string;
  format?: Function;
  result?: Function;
  validate?: Function;
  choices?: Array<
    | {
        name: string | number;
        message: string | number;
        value: string | number;
      }
    | string
  >;
  [key: string]: any;
}

class PromptWrapper {
  private _prompt!: FakePrompt | ConsolePrompt;

  constructor() {
    this.configure({ fake: false });
  }

  fake(): this {
    return this.configure({ fake: true });
  }

  configure(options: Partial<PromptOptions> = {}): this {
    this._prompt = !options?.fake ? new ConsolePrompt() : new FakePrompt();
    return this;
  }

  on(event: 'prompt', callback: (options: PromptEventOptions) => any): this {
    this._prompt.on(event, callback);

    return this;
  }

  async prompt(options: DirectPromptOptions) {
    // @ts-expect-error
    return await this._prompt.prompt({
      ...options,
      message: ' ' + options.message,
    });
  }

  /*
	|--------------------------------------------------------------------------
	| Map of prompts
	|--------------------------------------------------------------------------
	*/
  /**
   * Prompts for text input
   */
  ask<Result extends any = string>(title: string, options?: TextPromptOptions<Result>): Promise<Result> {
    return this._prompt.ask(` ${title}`, options);
  }

  /**
   * Prompts for text input
   */
  enum<Result extends any = string[]>(title: string, options?: EnumPromptOptions<Result>): Promise<Result> {
    return this._prompt.enum(` ${title}`, options);
  }

  /**
   * Prompts for text input but mangles the output (for password)
   */
  secure<Result extends any = string>(title: string, options?: TextPromptOptions<Result>): Promise<Result> {
    return this._prompt.secure(` ${title}`, options);
  }

  /**
   * Asks for `Y/n`
   */
  confirm<Result extends any = boolean>(title: string, options?: BooleanPromptOptions<Result>): Promise<Result> {
    return this._prompt.confirm(` ${title}`, options);
  }

  /**
   * Similar to [[this.confirm]] but with custom toggle options
   */
  toggle<Result extends any = boolean>(
    title: string,
    choices: [string, string],
    options?: TogglePromptOptions<Result>
  ): Promise<Result> {
    return this._prompt.toggle(` ${title}`, choices, options);
  }

  /**
   * Prompts for text input
   */
  choice<Choice extends string, Result extends any = Choice>(
    title: string,
    choices: readonly (Choice | PromptChoice<Choice>)[],
    options?: ChoicePromptOptions<Choice, Result>
  ): Promise<Result> {
    return this._prompt.choice(` ${title}`, choices, options);
  }

  /**
   * Prompts for text input
   */
  multiple<Choice extends string, Result extends any = Choice[]>(
    title: string,
    choices: readonly (Choice | PromptChoice<Choice>)[],
    options?: MultiplePromptOptions<Choice, Result>
  ): Promise<Result> {
    return this._prompt.multiple(` ${title}`, choices, options);
  }

  /**
   * Prompts for text input
   */
  autocomplete<
    Choice extends string,
    Multiple extends boolean = false,
    Result extends any = Multiple extends true ? Choice[] : Choice
  >(
    title: string,
    choices: readonly Choice[],
    options?: AutoCompletePromptOptions<Choice, Multiple, Result>
  ): Promise<Result> {
    return this._prompt.autocomplete(` ${title}`, choices, options);
  }
}

export const Prompt = new PromptWrapper();
