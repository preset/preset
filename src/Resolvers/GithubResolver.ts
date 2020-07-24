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
  public readonly urlRegex = /^(?:(?:https:\/\/)|(?:git@))(?:(?:www\.)?github\.com)[\/|:]([\w-]+)\/([\w-]+)(?:\.git)?(?:\:([\w-\/]+))?$/;
  public readonly name: string = Name.GithubResolver;

  async resolve(input: string): Promise<ResolverResultContract> {
    const data = this.resolveUsePreset(input) || this.resolveShortSyntax(input) || this.resolveUrlSyntax(input);

    if (!data) {
      return { success: false };
    }

    return this.clone(data);
  }

  resolveUsePreset(input: string): GitResolverResult | false {
    Logger.info(`Trying to resolve the use-preset short syntax.`);
    const [matches, repository, path] = input.match(/^([\w-]+)(?:\:+([\w-\/]+))?$/) ?? [];

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
    const [matches, organization, repository, path] = input.match(/^([\w-]+)\/([\w-]+)(?:\:+([\w-\/]+))?$/) ?? [];

    if (!matches) {
      return false;
    }

    return {
      organization,
      repository,
      path: path ?? '/',
    };
  }
}
