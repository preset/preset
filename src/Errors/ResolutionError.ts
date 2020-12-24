import { color, ExecutionError, RepositoryPreset } from '@/exports';

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

  static subdirectoryNotFound(subdirectory: string, path: string): ResolutionError {
    return new ResolutionError() //
      .withMessage(`Subdirectory ${color.underline(subdirectory)} does not exist in ${color.underline(path)}.`)
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

  static cloneFailed(preset: RepositoryPreset, error: Error): ResolutionError {
    const repository = color.magenta(`${preset.organization}/${preset.repository}`);

    if (error.stack?.includes('Remote branch')) {
      return new ResolutionError()
        .stopsExecution()
        .withMessage(`The ${color.magenta(preset.tag ?? '<undefined>')} branch does not exist in the remote repository.`)
        .withoutStack();
    }

    if (error.stack?.includes('Permission denied (publickey)')) {
      return new ResolutionError()
        .stopsExecution()
        .withMessage(
          `Access to ${color.magenta(repository)} denied.`,
          `If you think it's an error, make sure you have an SSH key set up and linked to your Git account.`,
          `If the repository is public and you don't want to configure SSH, use the ${color.magenta('--no-ssh')} flag.`,
        )
        .withoutStack();
    }

    if (['fatal: could not read Username', 'ERROR: Repository not found'].some((message) => error.stack?.includes(message))) {
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
