export type Verbosity = 0 | 1 | 2;

export interface OutputContract {
  /**
   * Registers the event-based output controller.
   */
  register(verbosity: Verbosity): Promise<void>;
}

export interface CommandLineInterfaceParameter {
  name: string;
  description: string;
  optional: boolean;
}

export interface CommandLineInterfaceOption {
  definition: string;
  description: string;
  type?: any[] | undefined;
}
