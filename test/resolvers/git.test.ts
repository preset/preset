import { repositories } from '../constants';
import { container, Binding, Name } from '@/Container';
import { ResolverContract, ResolverResultContract } from '@/Contracts';
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

it('returns a successful response when finding a public repository', async () => {
  const gitResolver = container.getNamed<ResolverContract>(Binding.Resolver, Name.GitResolver);
  const result = await gitResolver.resolve('git::' + repositories.FUNCTIONAL_PRESET_GITHUB_REPOSITORY);

  results.push(result);

  expect(result).toMatchObject<ResolverResultContract>({
    success: true,
    temporary: true,
  });
  expect(fs.pathExistsSync(path.join(result.path!, 'package.json'))).toBe(true);
});
