import { FakePrompt, Prompt as ConsolePrompt } from '@poppinss/prompts';

interface PromptOptions {
  fake: boolean;
}

class PromptWrapper {
  public prompt!: FakePrompt | ConsolePrompt;

  constructor() {
    this.configure({ fake: false });
  }

  fake(): this {
    return this.configure({ fake: true });
  }

  configure(options: Partial<PromptOptions> = {}): this {
    this.prompt = !options?.fake ? new ConsolePrompt() : new FakePrompt();
    return this;
  }
}

export const Prompt = new PromptWrapper();
