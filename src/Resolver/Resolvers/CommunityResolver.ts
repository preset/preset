import { ResolverContract, ResolverOptions, ResolverResult } from '@/Contracts/ResolverContract';
import { ResolutionError } from '@/Errors';
import { injectable } from 'inversify';
import fs from 'fs-extra';
import path from 'path';
import { GitHubResolver } from './GitHubResolver';

/**
 * Resolves using a short syntax.
 */
@injectable()
export class CommunityResolver extends GitHubResolver implements ResolverContract {
  public name: string = 'community';

  protected organizations = {
    laravel: 'laravel-presets',
    inertia: 'inertia-presets',
  };

  async resolve(resolvable: string, options: ResolverOptions): Promise<ResolverResult> {
    const [matches, shorthand, repository, tag] = resolvable.match(this.getResolutionRegex()) ?? [];

    if (!matches) {
      if (resolvable.includes(':')) {
        throw ResolutionError.communityOrganizationNotFound(resolvable.split(':').shift()!);
      }

      return false;
    }

    return this.clone({
      organization: Reflect.get(this.organizations, shorthand),
      ssh: options.shh,
      path: options.path,
      repository,
      tag,
    });
  }

  /**
   * Gets the regular expression for matching the community organizations.
   */
  protected getResolutionRegex(): RegExp {
    const shorthands = Object.keys(this.organizations)
      .map((s) => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'))
      .join('|');

    return new RegExp(`^(${shorthands}):([a-zA-Z][\\w-]+)(?:@([\\w-\\.]+))?$`);
  }
}
