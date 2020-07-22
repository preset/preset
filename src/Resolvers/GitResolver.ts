import { injectable } from 'inversify';
import { ResolverContract, ResolverResultContract } from '@/Contracts';
import { Logger } from '@/Logger';
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
      Logger.info(`Generating temporary directory to clone ${repositoryUrl} into.`);
      const temporary = tmp.dirSync();

      Logger.info(`Cloning ${repositoryUrl} into ${temporary.name}.`);
      await git()
        .clone(repositoryUrl, temporary.name)
        .then(() => Logger.info(`Cloned ${repositoryUrl} into ${temporary.name}.`));

      return {
        success: true,
        path: temporary.name,
        temporary: true,
      };
    } catch (error) {
      // TODO - Expose help about private repositories
      // https://github.com/settings/tokens
      // https://github.com/steveukx/git-js/issues/203#issuecomment-362536933
      throw Logger.throw(`Could not clone ${repositoryUrl}.`, error);
    }
  }
}
