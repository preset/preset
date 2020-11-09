import { ContextAware } from '@/Contracts/PresetContract';
import { Name } from '@/Container';
import { Action } from '../Action';

export type ConflictHandlingStrategy = 'ask' | 'override' | 'skip';

/**
 * Copies files or directory from the preset to the target directory.
 */
export class Copy extends Action {
  public handler = Name.Handler.Copy;
  public name = 'copy';
  public title = 'Copying files.';
  public strategy: ContextAware<ConflictHandlingStrategy> = 'override';
  public input: ContextAware<string[]> = [];
  public target: ContextAware<string> = '';

  /**
   * Defines the files or directory to copy.
   */
  public from(input?: ContextAware<string[]>): this {
    this.input = input ?? [];
    return this;
  }

  /**
   * Defines the target directory.
   */
  public to(target: ContextAware<string>): this {
    this.target = target;
    return this;
  }

  /**
   * Determines the behavior when a conflict (target already exists) is found.
   * - ask: Will ask in a prompt what to do.
   * - skip: Will skip these files.
   * - override: Will override these files.
   */
  public whenConflict(strategy: ContextAware<ConflictHandlingStrategy>): this {
    this.strategy = strategy;
    return this;
  }
}
