import { ContextAware } from '@/exports';

export class Instruct<Context = any> {
  public heading?: ContextAware<string, Context>;
  public messages: ContextAware<string | string[], Context> = [];

  /**
   * Defines the instruction table's heading.
   */
  withHeading(heading?: ContextAware<string, Context>): this {
    this.heading = heading;
    return this;
  }

  /**
   * Adds the given messages to the instruction set.
   */
  to(messages: ContextAware<string | string[], Context>): this {
    this.messages = messages;
    return this;
  }
}
