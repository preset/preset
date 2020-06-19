import { gists, repositories } from '../constants';
import { container, Binding, Name, Tag } from '@/Container';
import { ResolverContract, ResolverResultContract } from '@/Contracts';
import path from 'path';
import fs from 'fs-extra';
import { Log } from '@/Logger';

const results: ResolverResultContract[] = [];

afterAll(() => {
  results.forEach(result => {
    if (result.success && result.temporary) {
      fs.removeSync(result.path!);
    }
  });
});

it('returns a successful response when finding a public repository', async () => {
  const githubResolver = container.getNamed<ResolverContract>(Binding.Resolver, Name.GithubResolver);
  const result = await githubResolver.resolve(repositories.FUNCTIONAL_PRESET_REPOSITORY);

  results.push(result);

  expect(result).toMatchObject<ResolverResultContract>({
    success: true,
    temporary: true,
  });
  expect(fs.pathExistsSync(path.join(result.path!, 'package.json'))).toBe(true);
});

it('returns an unsuccessful response when not finding a repository', async () => {
  Log.fake();
  const githubResolver = container.getNamed<ResolverContract>(Binding.Resolver, Name.GithubResolver);
  const result = await githubResolver.resolve(repositories.NOT_FUNCTIONAL_PRESET_REPOSITORY);

  results.push(result);

  expect(result.success).toBe(false);
  expect(Log.history.pop()?.startsWith('warn Could not clone')).toBe(true);
});
