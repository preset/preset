import { GitResolverResult } from '@/Contracts/ResolverContract';

export class CloneError extends Error {
  constructor(options: GitResolverResult, error: Error) {
    super('Could not clone the repository.');

    if (error.stack?.includes('Could not find remote branch')) {
      this.message = `The "${options.tag}" branch does not exist in the remote repository.`;
      return;
    }

    if (error.stack?.includes('ERROR: Repository not found')) {
      this.message = `Repository "${options.organization}/${options.repository}" could not be found. Make sure it exists and you have read access to it.`;
      return;
    }

    this.stack = error.stack;
  }
}
