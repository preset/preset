import { injectable } from 'inversify';
import { ResolverResultContract } from '@/Contracts';
import { GitResolver } from './GitResolver';
import { Name } from '@/Container';

/**
 * A resolver that clones a Github repository and returns its local, temporary path.
 */
@injectable()
export class GithubResolver extends GitResolver {
  public readonly name: string = Name.GithubResolver;

  async resolve(input: string): Promise<ResolverResultContract> {
    const [matches, org, name] =
      input.match(
        /^(?:(?:(?:https?|git)(?:@|\:\/\/)(?:www\.)?github\.com(?::|\/))?(?:([\w-]+)\/)?([\w-]+))(?:\.git)?$/
      ) ?? [];

    if (!matches) {
      return {
        success: false,
      };
    }

    const repositoryUrl = this.getRepositoryUrl(org ?? 'use-preset', name);

    return this.clone(repositoryUrl);
  }

  private getRepositoryUrl(organizationOrUser: string, repository: string): string {
    return `git://github.com/${organizationOrUser}/${repository}.git`;
  }
}
