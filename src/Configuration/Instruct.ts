export class Instruct {
  public heading?: string;
  public messages: string[] = [];

  /**
   * Defines the instruction table's heading.
   */
  withHeading(heading?: string): this {
    this.heading = heading;
    return this;
  }

  /**
   * Adds the given messages to the instruction set.
   */
  to(messages: string | string[]): this {
    if (!Array.isArray(messages)) {
      messages = [messages];
    }

    this.messages.push(...messages);
    return this;
  }
}
