import { ContextContract } from './ContextContract';
import {
  DeleteActionContract,
  CopyActionContract,
  EditActionContract,
  EditJsonActionContract,
  CustomActionContract,
  PromptActionContract,
  PresetActionContract,
  InstallDependenciesActionContract,
  RunActionContract,
} from './Actions';
import { ParseOption } from '.';

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
   * A list of additional command line options.
   * @see https://github.com/cacjs/cac for syntax.
   */
  options?: ParseOption[];

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
  | InstallDependenciesActionContract
  | RunActionContract;

export type HookResult = boolean | void | any;
export type HookFunction = ContextAware<HookResult>;
