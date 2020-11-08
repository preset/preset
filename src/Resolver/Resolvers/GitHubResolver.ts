import { GitResolverResult, ResolverContract, ResolverOptions, ResolverResult } from '@/Contracts/ResolverContract';
import { ResolutionError } from '@/Errors';
import { inject, injectable } from 'inversify';
import { Binding } from '@/Container';
import { Bus } from '@/bus';
import git from 'simple-git';
import tmp from 'tmp';
import path from 'path';
import fs from 'fs-extra';
import { color } from '@/utils';

@injectable()
export class GitHubResolver implements ResolverContract {
  public name: string = 'GitHub';

  @inject(Binding.Bus)
  protected bus!: Bus;

  async resolve(resolvable: string, options: ResolverOptions): Promise<ResolverResult> {
    const result = this.resolveGitHubUrl(resolvable);

    if (!result) {
      throw ResolutionError.notRepository(resolvable);
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

				const result = {
					organization,
					repository,
					tag,
					ssh: !resolvable.includes('http')
				}

				this.bus.debug(`Match: ${color.gray(JSON.stringify(result))}.`)

				return result;
			})
			.filter(Boolean)
			?.shift() ?? false;
  }

  /**
   * Clones the repository in a temporary directory.
   */
  protected async clone(options: GitResolverResult): Promise<ResolverResult> {
    try {
      // Sets SSH if unspecified
      options.ssh = undefined === options.ssh ? true : options.ssh;

      const temporary = tmp.dirSync();
      const repositoryUrl = options.ssh
        ? `git@github.com:${options.organization}/${options.repository}.git`
        : `https://github.com/${options.organization}/${options.repository}`;

      this.bus.info(`Cloning ${color.magenta(repositoryUrl)}.`);

      await git()
        .clone(repositoryUrl, temporary.name, {
          '--single-branch': true,
          ...(options.tag && { '--branch': options.tag }),
        })
        .then(() => this.bus.debug(`Cloned ${color.magenta(repositoryUrl)} into ${color.underline(temporary.name)}.`));

      // Ensure the path exists
      const clonedDirectoryWithPath = path.join(temporary.name, options.path ?? '');
      if (!fs.pathExistsSync(clonedDirectoryWithPath) || !fs.statSync(clonedDirectoryWithPath).isDirectory()) {
        try {
          this.bus.debug(`Deleting temporary directory at ${color.underline(temporary.name)}...`);
          fs.emptyDirSync(temporary.name);
          fs.rmdirSync(temporary.name);
        } catch (error) {
          this.bus.warning('Could not remove temporary directory.');
          this.bus.fatal(error);
        }

        throw ResolutionError.repositorySubdirectoryNotFound(options.path!, `${options.organization}/${options.repository}`);
      }

      return {
        temporary: true,
        path: clonedDirectoryWithPath,
      };
    } catch (error) {
      // Forward the resolution error if purposely thrown.
      if (error instanceof ResolutionError) {
        throw error;
      }

      // Throw a fatal resolution error if the clone failed.
      throw ResolutionError.cloneFailed(options, error);
    }
  }
}
