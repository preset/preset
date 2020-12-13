import { Action, ContextAware, Name } from '@/exports';

export type ConflictHandlingStrategy = 'ask' | 'override' | 'skip';

/**
 * Copies files or directory from the preset to the target directory.
 */
export class Extract<Context = any> extends Action {
  public handler = Name.Handler.Extract;
  public name = 'template extraction';
  public title = 'Extracting templates...';
  public strategy: ContextAware<ConflictHandlingStrategy, Context> = 'override';
  public input: ContextAware<string | string[], Context> = [];
  public target: ContextAware<string, Context> = '';
  public shouldExtractDotfiles: ContextAware<boolean> = false;

  /**
   * Defines the files or directory to copy.
   */
  public from(input?: ContextAware<string | string[], Context>): Extract<Context> {
    this.input = input ?? [];
    return this;
  }

  /**
   * Defines the target directory.
   */
  public to(target: ContextAware<string, Context>): Extract<Context> {
    this.target = target;
    return this;
  }

  /**
   * Determines the behavior when a conflict (target already exists) is found.
   * - ask: Will ask in a prompt what to do.
   * - skip: Will skip these files.
   * - override: Will override these files.
   */
  public whenConflict(strategy: ContextAware<ConflictHandlingStrategy, Context>): Extract<Context> {
    this.strategy = strategy;
    return this;
  }

  /**
   * Allows extractions of files and directories starting with a dot.`
   * Files ending with .dotfile are always renamed as dotfiles.
   */
  public withDots(withDots: ContextAware<boolean> = true): Extract<Context> {
    this.shouldExtractDotfiles = withDots;
    return this;
  }
}
