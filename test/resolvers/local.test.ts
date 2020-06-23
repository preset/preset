import { stubs, STUBS_DIRECTORY } from '../constants';
import { container, Binding, Name, Tag } from '@/Container';
import { ResolverContract, ResolverResultContract } from '@/Contracts';
import path from 'path';

it('returns a successful response when finding a local directory', async () => {
  const localResolver = container.getNamed<ResolverContract>(Binding.Resolver, Name.LocalResolver);
  const result = await localResolver.resolve(stubs.noAction);

  expect(result).toStrictEqual<ResolverResultContract>({
    success: true,
    path: stubs.noAction,
    temporary: false,
  });
});

it('returns an unsuccessful response when not finding a local directory', async () => {
  const localResolver = container.getNamed<ResolverContract>(Binding.Resolver, Name.LocalResolver);
  const result = await localResolver.resolve(path.join(STUBS_DIRECTORY, 'path-that-does-not-exist'));

  expect(result).toStrictEqual<ResolverResultContract>({
    success: false,
  });
});

it('returns an unsuccessful response when finding a path that is not a directory', async () => {
  const localResolver = container.getNamed<ResolverContract>(Binding.Resolver, Name.LocalResolver);
  const result = await localResolver.resolve(stubs.standaloneFile);

  expect(result).toStrictEqual<ResolverResultContract>({
    success: false,
  });
});
