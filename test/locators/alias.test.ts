import { AliasResolver, Binding, container, Name } from '@/exports';

function createResolver(configuration: any): AliasResolver {
  class MockResolver extends AliasResolver {
    protected async readConfiguration() {
      return configuration;
    }
  }

  return container.resolve(MockResolver);
}

it('resolves aliases', async () => {
  const resolver = createResolver({
    org: 'custom-org',
    app: {
      simple: 'custom-org/simple',
      complex: {
        preset: 'custom-org/complex',
        path: 'new',
        ssh: true,
      },
    },
  });

  const map = {
    'org:test': { resolvable: 'custom-org/test' },
    'app:simple': { resolvable: 'custom-org/simple' },
    'app:complex': { resolvable: 'custom-org/complex', options: { path: 'new', ssh: true } },
  };

  for (const [alias, expected] of Object.entries(map)) {
    const result = await resolver.resolve(alias, {});
    expect(result).toMatchObject(expected);
  }
});
