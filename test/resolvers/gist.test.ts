import { gists } from '../constants';
import { container, Binding, Name } from '@/Container';
import { ResolverContract, ResolverResultContract } from '@/Contracts';
import { Text } from '@supportjs/text';
import path from 'path';
import fs from 'fs-extra';

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
  const gistResolver = container.getNamed<ResolverContract>(Binding.Resolver, Name.GithubGistResolver);

  const t = async () => {
    await gistResolver.resolve(gists.NOT_FUNCTIONAL_GIST_URL);
  };

  const id = Text.make(gists.NOT_FUNCTIONAL_GIST_URL).afterLast('/').str();

  await expect(t).rejects.toThrowError(`Could not clone Gist ${id}`);
});
