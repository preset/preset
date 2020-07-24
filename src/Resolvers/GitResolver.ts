import { injectable } from 'inversify';
import { ResolverContract, ResolverResultContract } from '@/Contracts';
import { Logger } from '@/Logger';
import { Name } from '@/Container';
import git from 'simple-git';
import tmp from 'tmp';
import path from 'path';

export interface GitResolverResult {
  organization: string;
  repository: string;
  path: string;
}

/**
 * A resolver that clones a git repository and returns its local, temporary path.
 */
@injectable()
export class GitResolver implements ResolverContract {
  public readonly urlRegex = /^(?:(?:https:\/\/)|(?:git@))(?:[\w\.]+)[\/|:]([\w-]+)\/([\w-]+)(?:\.git)?(?:\:([\w-\/]+))?$/;
  public readonly name: string = Name.GitResolver;
  public readonly prefix: string = 'git::';

  async resolve(input: string): Promise<ResolverResultContract> {
    if (!input.startsWith(this.prefix)) {
      return { success: false };
    }

    const repositoryUrl = input.substr(this.prefix.length);
    const data = this.resolveUrlSyntax(repositoryUrl);

    if (!data) {
      Logger.info(`Received the git prefix, but the URL after was not valid.`);
      return { success: false };
    }

    return this.clone(data);
  }

  protected resolveUrlSyntax(input: string): GitResolverResult | false {
    Logger.info(`Trying to resolve the full url syntax.`);
    const [matches, organization, repository, path] = input.match(this.urlRegex) ?? [];

    if (!matches) {
      return false;
    }

    return {
      organization,
      repository,
      path: path ?? '/',
    };
  }

  protected getRepositoryUrl({ organization, repository }: GitResolverResult): string {
    return `git://github.com/${organization}/${repository}.git`;
  }

  /**
   * Clones the given repository.
   */
  protected async clone(repositoryData: GitResolverResult): Promise<ResolverResultContract> {
    const repositoryUrl = this.getRepositoryUrl(repositoryData);

    try {
      Logger.info(`Generating temporary directory to clone ${repositoryUrl} into.`);
      const temporary = tmp.dirSync();

      Logger.info(`Cloning ${repositoryUrl} into ${temporary.name}.`);
      await git()
        .clone(repositoryUrl, temporary.name)
        .then(() => Logger.info(`Cloned ${repositoryUrl} into ${temporary.name}.`));

      return {
        success: true,
        path: path.join(temporary.name, repositoryData.path),
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
