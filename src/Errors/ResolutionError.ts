export class ResolutionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }

  static subdirectoryNotFound(subdirectory: string, resolvable: string): ResolutionError {
    return new ResolutionError(`Subdirectory "${subdirectory}" does not exist in specified directory.`);
  }

  static directoryNotFound(resolvable: string): ResolutionError {
    return new ResolutionError(`"${resolvable}" could not be found.`);
  }

  static invalidGitHubResolvable(resolvable: string): ResolutionError {
    return new ResolutionError(`"${resolvable}" is not a valid GitHub resolvable.`);
  }

  static couldNotResolve(resolvable: string): ResolutionError {
    return new ResolutionError(`"${resolvable}" could not be resolved.`);
  }
}
