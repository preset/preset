import { injectable } from 'inversify';
import { ResolverContract, ResolverResultContract } from '@/Contracts';
import { Log, Color } from '@/Logger';
import { Name } from '@/Container';
import git from 'simple-git';
import tmp from 'tmp';

/**
 * A resolver that clones a git repository and returns its local, temporary path.
 */
@injectable()
export class GitResolver implements ResolverContract {
  public readonly name: string = Name.GitResolver;
  public readonly prefix: string = 'git::';

  async resolve(input: string): Promise<ResolverResultContract> {
    if (!input.startsWith(this.prefix)) {
      return {
        success: false,
      };
    }

    const repositoryUrl = input.substr(this.prefix.length);

    return this.clone(repositoryUrl);
  }

  /**
   * Clones the given repository.
   */
  protected async clone(repositoryUrl: string): Promise<ResolverResultContract> {
    try {
      Log.debug(`Generating temporary directory to clone ${Color.link(repositoryUrl)} into.`);
      const temporary = tmp.dirSync();

      Log.debug(`Cloning ${Color.link(repositoryUrl)} into ${Color.directory(temporary.name)}.`);
      await git()
        .clone(repositoryUrl, temporary.name)
        .then(() => Log.debug(`Cloned ${Color.link(repositoryUrl)} into ${Color.directory(temporary.name)}.`));

      return {
        success: true,
        path: temporary.name,
        temporary: true,
      };
    } catch (error) {
      // TODO - Expose help about private repositories
      // https://github.com/settings/tokens
      // https://github.com/steveukx/git-js/issues/203#issuecomment-362536933
      Log.warn(`Could not clone ${Color.link(repositoryUrl)}.`);
      Log.debug(error);
      return {
        success: false,
      };
    }
  }
}
