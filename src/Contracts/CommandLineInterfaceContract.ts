/**
 * Represents a command line interface.
 */
export interface CommandLineInterfaceContract {
  run(input: string[]): Promise<void>;
}
