import { GitResolverResult } from '@/Contracts/ResolverContract';
import { color } from '@/utils';

export class CloneError extends Error {
  constructor(options: GitResolverResult, error: Error) {
    const repository = color.magenta(`${options.organization}/${options.repository}`);
    super(`Could not clone ${repository}.`);

    if (error.stack?.includes('Could not find remote branch')) {
      this.message = `The ${color.magenta(options.tag ?? '<undefined>')}" branch does not exist in the remote repository.`;
      this.stack = undefined;
      return;
    }

    if (error.stack?.includes('ERROR: Repository not found')) {
      this.message = `Repository ${repository} could not be found. Make sure it exists and you have read access to it.`;
      this.stack = undefined;
      return;
    }

    this.stack = error.stack;
  }
}
