import { injectable, inject } from 'inversify';
import { Binding, Bus, color, LocatorContract, ResolutionError, RepositoryPreset } from '@/exports';

@injectable()
export class GitLocator implements LocatorContract {
  public name: string = 'Git';

  @inject(Binding.Bus)
  protected bus!: Bus;

  async locate(resolvable: string): Promise<RepositoryPreset> {
    const result = this.resolveGitHubUrl(resolvable);

    if (!result) {
      throw ResolutionError.notRepository(resolvable);
    }

    return result;
  }

  /**
   * Resolves the short syntax for GitHub.
   *
   * @example organization/repository
   * @example organization/repository(at)tag
   * @example git(at)github.com:organization/repository
   */
  protected resolveGitHubUrl(resolvable: string): RepositoryPreset | false {
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

				const result: RepositoryPreset = {
					type: 'repository',
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
}
