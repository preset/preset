import { ContextContract } from './ContextContract';
import { flags, args } from '@oclif/parser';
import { BaseActionContract, DeleteActionContract, CopyActionContract } from './Actions';

export interface GeneratorContract {
  /**
   * The name of the preset.
   */
  name: string;

  /**
   * The path that contain the templates, relative to the preset.
   */
  templates?: string;

  /**
   * A list of actions to execute.
   */
  actions: ((context?: ContextContract) => Promise<Actions[]> | Actions[]) | Actions[];
  // actions: (context: ContextContract) => Promise<Action[]> | Action[];

  /**
   * A method that indicates how to parse extra command line arguments.
   *
   * @param argv
   * @param options
   */
  parse?: <T>(
    context: Partial<ContextContract>
  ) => {
    flags?: flags.Input<T>;
    args?: args.Input;
  };

  /**
   * Execution hook that is executed at the very start of the preset.
   */
  before?: HookResult;

  /**
   * Execution hook that is executed before any action is handled.
   */
  beforeEach?: HookResult;

  /**
   * Execution hook that is executed at the end of the preset.
   */
  after?: HookResult;

  /**
   * Execution hook that is executed after any action is handled.
   */
  afterEach?: HookResult;
}

type Actions = CopyActionContract | DeleteActionContract;
type SyncHook = (context?: ContextContract) => boolean | void;
type AsyncHook = (context?: ContextContract) => Promise<boolean | void>;
type HookResult = SyncHook | AsyncHook | any;
