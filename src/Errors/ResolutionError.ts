import { GitResolverResult } from '@/Contracts/ResolverContract';
import { ExecutionError } from '@/Errors/ExecutionError';
import { color } from '@/utils';

export class ResolutionError extends ExecutionError {
  static localSubdirectoryNotFound(subdirectory: string): ResolutionError {
    return new ResolutionError() //
      .withMessage(`Subdirectory ${color.underline(subdirectory)} does not exist in specified directory.`)
      .recoverable();
  }

  static localDirectoryNotFound(directory: string): ResolutionError {
    return new ResolutionError() //
      .withMessage(`${color.underline(directory)} is not a local directory.`)
      .recoverable();
  }

  static repositorySubdirectoryNotFound(subdirectory: string, repository: string): ResolutionError {
    return new ResolutionError() //
      .withMessage(`Subdirectory ${color.underline(subdirectory)} does not exist in ${color.magenta(repository)}.`)
      .recoverable();
  }

  static notRepository(resolvable: string): ResolutionError {
    return new ResolutionError() //
      .withMessage(`${color.underline(resolvable)} is not a GitHub repository.`)
      .recoverable();
  }

  static notCommunityOrganization(resolvable: string): ResolutionError {
    return new ResolutionError() //
      .withMessage(`${color.underline(resolvable)} is not a GitHub community organization.`)
      .recoverable();
  }

  static communityOrganizationNotFound(shorthand: string): ResolutionError {
    return new ResolutionError() //
      .withMessage(`The community organization ${color.magenta(shorthand)} is not registered.`)
      .stopsExecution();
  }

  static resolutionFailed(resolvable: string): ResolutionError {
    return new ResolutionError() //
      .stopsExecution()
      .withMessage(`${color.magenta(resolvable)} could not be resolved.`)
      .withoutStack();
  }

  static cloneFailed(options: GitResolverResult, error: Error): ResolutionError {
    const repository = color.magenta(`${options.organization}/${options.repository}`);

    if (error.stack?.includes('Could not find remote branch')) {
      return new ResolutionError()
        .stopsExecution()
        .withMessage(`The ${color.magenta(options.tag ?? '<undefined>')}" branch does not exist in the remote repository.`)
        .withoutStack();
    }

    if (error.stack?.includes('ERROR: Repository not found')) {
      return new ResolutionError()
        .stopsExecution()
        .withMessage(`Repository ${repository} could not be found. Make sure it exists and you have read access to it.`)
        .withoutStack();
    }

    return new ResolutionError() //
      .stopsExecution()
      .withMessage(`Could not clone ${repository}.`)
      .withStack(error.stack);
  }
}
