import { injectable } from 'inversify';
import { ResolverContract, ResolverResultContract } from '@/Contracts';
import { Log, Color } from '@/Logger';
import git from 'simple-git';
import tmp from 'tmp';

/**
 * A resolver that clones a Github repository and returns its local, temporary path.
 */
@injectable()
export class GithubResolver implements ResolverContract {
  public readonly name: string = 'github';

  async resolve(input: string): Promise<ResolverResultContract> {
    const [matches, org, repository] =
      input.match(
        /^(?:(?:(?:https?|git)(?:@|\:\/\/)(?:www\.)?github\.com(?::|\/))?(?:([\w-]+)\/)?([\w-]+))(?:\.git)?$/
      ) ?? [];

    if (!matches) {
      return {
        success: false,
      };
    }

    return this.clone(org, repository);
  }

  private getRepositoryUrl(organizationOrUser: string, repository: string): string {
    return `git://github.com/${organizationOrUser}/${repository}.git`;
  }

  private async clone(organizationOrUser: string, repository: string): Promise<ResolverResultContract> {
    try {
      const name = `${organizationOrUser}/${repository}`;
      const repositoryUrl = this.getRepositoryUrl(organizationOrUser, repository);

      Log.debug(`Generating temporary directory to clone ${Color.link(name)} into.`);
      const temporary = tmp.dirSync();

      Log.debug(`Cloning ${Color.link(name)} into ${Color.directory(temporary.name)}.`);
      await git()
        .clone(repositoryUrl, temporary.name)
        .then(() => Log.debug(`Cloned ${Color.link(name)} into ${Color.directory(temporary.name)}.`));

      return {
        success: true,
        path: temporary.name,
        temporary: true,
      };
    } catch (error) {
      Log.warn(`Could not clone ${Color.link(repository)}.`);
      return {
        success: false,
      };
    }
  }
}
