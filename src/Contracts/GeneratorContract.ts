import { ContextContract } from './ContextContract';
import { flags, args } from '@oclif/parser';
import {
  DeleteActionContract,
  CopyActionContract,
  EditActionContract,
  EditJsonActionContract,
  CustomActionContract,
  PromptActionContract,
  PresetActionContract,
  InstallDependenciesActionContract,
} from './Actions';

export type ContextAware<T> = T | ((context: ContextContract) => Promise<T> | T);

export interface GeneratorContract {
  /**
   * The name of the preset.
   */
  name?: string;

  /**
   * The path that contain the templates, relative to the preset.
   */
  templates?: string;

  /**
   * A list of actions to execute.
   */
  actions: ContextAware<Actions[]>;

  /**
   * A method that indicates how to parse extra command line arguments.
   */
  parse?: ContextAware<ParseObject>;

  /**
   * Execution hook that is executed at the very start of the preset.
   */
  before?: HookFunction;

  /**
   * Execution hook that is executed before any action is handled.
   */
  beforeEach?: HookFunction;

  /**
   * Execution hook that is executed at the end of the preset.
   */
  after?: HookFunction;

  /**
   * Execution hook that is executed after any action is handled.
   */
  afterEach?: HookFunction;
}

export type Actions =
  | CopyActionContract
  | DeleteActionContract
  | EditActionContract
  | EditJsonActionContract
  | CustomActionContract
  | PromptActionContract
  | PresetActionContract
  | InstallDependenciesActionContract;

export type HookResult = boolean | void | any;
export type HookFunction = ContextAware<HookResult>;
export type ParseObject = {
  /**
   * A pair of name <-> flag object.
   *
   * @see https://github.com/oclif/parser
   * @example
   * flags: {
   * 		skip: flags.boolean({ char: 's' })
   * }
   *
   * // Later in code, you can use context.flags
   * context.flags.skip // true if --skip or -s was passed
   */
  flags?: flags.Input<any>;

  /**
   * A list of objects representing an argument.
   *
   * @see https://github.com/oclif/parser
   * @example
   * args: [
   * 		{ name: 'input' }
   * ]
   *
   * // Later in code, you can use context.args
   * context.args.input // "test" if `use-preset <name> test` was called
   */
  args?: args.Input;
};
