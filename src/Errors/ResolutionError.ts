export class ResolutionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }

  static localSubdirectoryNotFound(subdirectory: string): ResolutionError {
    return new ResolutionError(`Subdirectory "${subdirectory}" does not exist in specified directory.`);
  }

  static repositorySubdirectoryNotFound(subdirectory: string, repository: string): ResolutionError {
    return new ResolutionError(`Subdirectory "${subdirectory}" does not exist in ${repository}.`);
  }

  static communityOrganizationNotFound(shorthand: string): ResolutionError {
    return new ResolutionError(`The community organization "${shorthand}" is not registered.`);
  }

  static resolutionFailed(resolvable: string): ResolutionError {
    return new ResolutionError(`"${resolvable}" could not be resolved.`);
  }
}
