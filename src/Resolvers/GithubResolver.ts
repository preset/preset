import { injectable } from 'inversify';
import { ResolverResultContract } from '@/Contracts';
import { GitResolver, GitResolverResult } from './GitResolver';
import { Name } from '@/Container';
import { Logger } from '@/Logger';

/**
 * A resolver that clones a Github repository and returns its local, temporary path.
 */
@injectable()
export class GithubResolver extends GitResolver {
  public readonly urlRegex = /^(?:ssh\:)?(?:(?:https:\/\/)|(?:git@))(?:(?:www\.)?github\.com)[\/|:]([\w-]+)\/([\w-]+)(?:\.git)?(?:\:([\w-\/]+))?$/;
  public readonly name: string = Name.GithubResolver;

  async resolve(input: string): Promise<ResolverResultContract> {
    const ssh = this.hasSsh(input);

    if (ssh) {
      input = this.withoutSsh(input);
    }

    const data = this.resolveUsePreset(input) || this.resolveShortSyntax(input) || this.resolveUrlSyntax(input);

    if (!data) {
      return { success: false };
    }

    return this.clone({ ...data, ssh });
  }

  resolveUsePreset(input: string): GitResolverResult | false {
    Logger.info(`Trying to resolve the use-preset short syntax.`);
    const [matches, repository, path] = input.match(/^([a-zA-Z][\w-]+)(?:\:+([\w-\/]+))?$/) ?? [];

    if (!matches) {
      return false;
    }

    return {
      organization: 'use-preset',
      repository,
      path: path ?? '/',
    };
  }

  resolveShortSyntax(input: string): GitResolverResult | false {
    Logger.info(`Trying to resolve the GitHub short syntax.`);
    const [matches, org, repository, path] = input.match(/^([a-zA-Z][\w-]+)\/([\w-]+)(?:\:+([\w-\/]+))?$/) ?? [];

    if (!matches) {
      return false;
    }

    return {
      organization: org,
      repository,
      path: path ?? '/',
    };
  }
}
