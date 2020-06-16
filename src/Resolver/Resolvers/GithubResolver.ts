import { ResolverContract, ResolverResultContract } from '../Contracts';
import { Log, Color } from '../..';
import tmp from 'tmp';
import git from 'simple-git';

export class GithubResolver implements ResolverContract {
  async resolve(input: string): Promise<ResolverResultContract> {
    const [matches, org, repository] =
      input.match(
        /^(?:(?:(?:https?|git)(?:@|\:\/\/)(?:www\.)?github\.com(?::|\/))?(?:([\w-]+)\/)?([\w-]+))(?:\.git)?$/
      ) ?? [];

    if (!matches || !org || !repository) {
      return {
        success: false,
      };
    }

    return this.clone(`git://github.com/${org}/${repository}.git`);
  }

  /**
   * Clone the given repository to a temporary
   * @param repository The repository URL.
   */
  private async clone(repository: string): Promise<ResolverResultContract> {
    try {
      Log.debug(`Generating temporary directory to clone ${Color.link(repository)} into.`);
      const temporary = tmp.dirSync();

      Log.debug(`Cloning ${Color.link(repository)} into ${Color.directory(temporary.name)}.`);
      await git()
        .clone(repository, temporary.name)
        .then(() => Log.debug(`Successfully cloned into ${Color.directory(temporary.name)}.`))
        .catch(Log.exit);

      return {
        success: true,
        path: temporary.name,
        temporary: true,
      };
    } catch (error) {
      Log.debug(`Could not clone ${Color.link(repository)}.`);
      return {
        success: false,
      };
    }
  }
}
