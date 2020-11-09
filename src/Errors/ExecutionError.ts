export class ExecutionError extends Error {
  public fatal: boolean = false;

  constructor(message?: string, fatal: boolean = false) {
    super(message);
    this.name = this.constructor.name;
    this.fatal = fatal;
  }

  stopsExecution(fatal: boolean = true): this {
    this.fatal = fatal;
    return this;
  }

  recoverable(recoverable: boolean = true): this {
    this.fatal = !recoverable;
    return this;
  }

  withCompleteStack(error: Error): this {
    this.stack = error.stack;

    if (error.message) {
      this.stack = `    ${error.message}\n${error.stack}`;
    }

    return this;
  }

  withStack(stack?: string): this {
    this.stack = stack;
    return this;
  }

  withoutStack(): this {
    this.stack = undefined;
    return this;
  }

  withMessage(message: string): this {
    this.message = message;
    return this;
  }
}
