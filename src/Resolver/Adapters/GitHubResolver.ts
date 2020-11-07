import {
  GitResolverResult,
  ResolverContract,
  ResolverOptionsContract,
  ResolverResultContract,
} from '@/Contracts/ResolverContract';
import { logger } from '@poppinss/cliui';
import { injectable } from 'inversify';
import git from 'simple-git';
import tmp from 'tmp';
import path from 'path';
import { CloneError } from '@/Errors';

@injectable()
export class GitHubResolver implements ResolverContract {
  async resolve(resolvable: string, options: ResolverOptionsContract): Promise<ResolverResultContract> {
    const result = this.resolveGitHubUrl(resolvable);

    if (!result) {
      return { success: false };
    }

    return this.clone({
      ...result,
      path: options.path,
    });
  }

  /**
   * Resolves the short syntax for GitHub.
   *
   * @example organization/repository
   * @example organization/repository(at)tag
   * @example git(at)github.com:organization/repository
   */
  protected resolveGitHubUrl(resolvable: string): GitResolverResult | false {
    const regexes = [
      /^([a-zA-Z][\w-]+)\/([a-zA-Z][\w-]+)(?:@([\w-\.]+))?$/,
      /^git@github\.com:([a-zA-Z][\w-]+)\/([a-zA-Z][\w-]+)(?:\.git)?(?:@([\w-\.]+))?$/,
      /^https?:\/\/(?:www\.)?github\.com\/([a-zA-Z][\w-]+)\/([a-zA-Z][\w-]+)(?:\.git)?(?:@([\w-\.]+))?/,
    ];

    // prettier-ignore
    return regexes
			.map((regex) => {
				const [matches, organization, repository, tag] = resolvable.match(regex) ?? [];

				if (!matches) {
					return false;
				}

				return {
					organization,
					repository,
					tag,
					ssh: !resolvable.includes('http')
				};
			})
			.filter(Boolean)
			?.shift() ?? false;
  }

  /**
   * Clones the repository in a temporary directory.
   */
  protected async clone(options: GitResolverResult): Promise<ResolverResultContract> {
    try {
      const temporary = tmp.dirSync();
      const repositoryUrl = options.ssh
        ? `git@github.com:${options.organization}/${options.repository}.git`
        : `https://github.com/${options.organization}/${options.repository}`;

      await git()
        .clone(repositoryUrl, temporary.name, {
          '--single-branch': true,
          ...(options.tag && { '--branch': options.tag }),
        })
        .then(() => logger.info(`Cloned ${repositoryUrl} into ${temporary.name}.`));

      return {
        success: true,
        temporary: true,
        path: path.join(temporary.name, options.path ?? ''),
      };
    } catch (error) {
      throw new CloneError(options, error);
    }
  }
}
