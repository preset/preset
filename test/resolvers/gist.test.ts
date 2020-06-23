import { gists } from '../constants';
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

it('returns a successful response when finding a public gist', async () => {
  const gistResolver = container.getNamed<ResolverContract>(Binding.Resolver, Name.GithubGistResolver);
  const result = await gistResolver.resolve(gists.FUNCTIONAL_PUBLIC_GIST);

  results.push(result);

  expect(result).toMatchObject<ResolverResultContract>({
    success: true,
    temporary: true,
  });
  expect(fs.pathExistsSync(path.join(result.path!, 'package.json'))).toBe(true);
});

it('returns an unsuccessful response when not finding a gist', async () => {
  Log.fake();
  const gistResolver = container.getNamed<ResolverContract>(Binding.Resolver, Name.GithubGistResolver);
  const result = await gistResolver.resolve(gists.NOT_FUNCTIONAL_GIST_URL);

  results.push(result);

  expect(result.success).toBe(false);
  expect(Log.history.pop()?.startsWith('warn Could not clone Gist')).toBe(true);
});
