import { container, Binding } from '@/Container';
import { ResolversContract, ResolverContract, ResolverResultContract } from '@/Contracts';
import { stubs } from '../constants';

it('returns all resolvers from the container', () => {
  const resolvers = container.get<ResolversContract>(Binding.Resolvers);
  const names = resolvers.map(({ name }) => name);

  expect(names).toStrictEqual(['local', 'github-gist', 'github']);
});

it('gets the preset resolvers by default from the container', () => {
  const presetResolver = container.get<ResolverContract>(Binding.Resolver);
  expect(presetResolver.name).toBe('preset');
});

it('matches an existing local directory with the local resolver', async () => {
  const presetResolver = container.get<ResolverContract>(Binding.Resolver);
  const result = await presetResolver.resolve(stubs.noAction);

  expect(result).toStrictEqual<ResolverResultContract>({
    success: true,
    path: stubs.noAction,
    temporary: false,
  });
});
