import { color } from '@/utils';

export class ImportError extends Error {
  constructor(message: string, error?: Error) {
    super(message);
    this.name = this.constructor.name;
    this.stack = error?.stack;
  }

  static evaluationFailed(error: Error): ImportError {
    return new ImportError(`The preset could not be evaluated.`, error);
  }

  static specifiedConfigurationNotFound(path: string): ImportError {
    return new ImportError(`The specified configuration file does not exist (${color.magenta(path)}).`);
  }

  static configurationNotFound(directory: string): ImportError {
    return new ImportError(`The configuration file could not be found (tried in ${color.magenta(directory)}).`);
  }
}
