import Enquirer from 'enquirer';
import { Prompt } from '@poppinss/prompts/build/src/Base';
import { ContextAware, color } from '@/exports';

/**
 * Since the typings for `enquirer` package is badly broken, we
 * need to cast it to any to make it usable
 */
const enquirer = Enquirer as any;

/**
 * Uses the `enquirer` package to prompt user for input. The `$prompt`
 * method is invoked by the extended `Prompt` class.
 */
export class CustomPrompt extends Prompt {
  protected async prompt(options: any): Promise<any> {
    options = Object.assign({ name: 'prompt' }, options);
    options.prefix = `[ ${color.yellow('question')} ] `;

    const output = await enquirer.prompt(options);
    return output[options.name];
  }
}

export interface PromptContract {
  prompt(options: any): Promise<any>;
  toggle<Result extends any = boolean>(title: string, choices: [string, string], options?: any): Promise<Result>;
  confirm<Result extends any = boolean>(title: string, options?: any): Promise<Result>;
}

interface BasePromptOptions {
  name: string | (() => string);
  type: string | (() => string);
  message: ContextAware<string>;
  initial?: ContextAware<any>;
  required?: boolean;
  format?(value: string): string | Promise<string>;
  result?(value: string): string | Promise<string>;
  skip?: ((state: object) => boolean | Promise<boolean>) | boolean;
  validate?(value: string): boolean | Promise<boolean> | string | Promise<string>;
  onSubmit?(name: string, value: any, prompt: Enquirer.Prompt): boolean | Promise<boolean>;
  onCancel?(name: string, value: any, prompt: Enquirer.Prompt): boolean | Promise<boolean>;
  stdin?: NodeJS.ReadStream;
  stdout?: NodeJS.WriteStream;
}

interface Choice {
  name: string;
  message?: string;
  value?: string;
  hint?: string;
  disabled?: boolean | string;
}

interface ArrayPromptOptions extends BasePromptOptions {
  type: 'autocomplete' | 'editable' | 'form' | 'multiselect' | 'select' | 'survey' | 'list' | 'scale';
  choices: string[] | Choice[];
  maxChoices?: number;
  muliple?: boolean;
  initial?: number;
  delay?: number;
  separator?: boolean;
  sort?: boolean;
  linebreak?: boolean;
  edgeLength?: number;
  align?: 'left' | 'right';
  scroll?: boolean;
}

interface BooleanPromptOptions extends BasePromptOptions {
  type: 'confirm';
  initial?: boolean;
}

interface TogglePromptOptions extends BasePromptOptions {
  type: 'toggle';
  initial?: boolean;
  enabled?: string;
  disabled?: string;
}

interface StringPromptOptions extends BasePromptOptions {
  type: 'input' | 'invisible' | 'list' | 'password' | 'text';
  initial?: string;
  multiline?: boolean;
}

interface NumberPromptOptions extends BasePromptOptions {
  type: 'numeral';
  min?: number;
  max?: number;
  delay?: number;
  float?: boolean;
  round?: boolean;
  major?: number;
  minor?: number;
  initial?: number;
}

interface SnippetPromptOptions extends BasePromptOptions {
  type: 'snippet';
  newline?: string;
  template?: string;
}

interface SortPromptOptions extends BasePromptOptions {
  type: 'sort';
  hint?: string;
  drag?: boolean;
  numbered?: boolean;
}

export type PromptOptions =
  | BasePromptOptions
  | ArrayPromptOptions
  | BooleanPromptOptions
  | TogglePromptOptions
  | StringPromptOptions
  | NumberPromptOptions
  | SnippetPromptOptions
  | SortPromptOptions;
