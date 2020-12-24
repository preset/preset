import { resolvables } from '@test/test-helpers';
import { Binding, container, GitLocator, Name } from '@/exports';

it('locates github urls', async () => {
  const locator = container.getNamed<GitLocator>(Binding.Locator, Name.GitLocator);

  resolvables.GITHUB.forEach(async ({ test, repository, organization }) => {
    const result = await locator.locate(test);
    expect(result.repository).toBe(repository);
    expect(result.organization).toBe(organization);
  });
});

it('rejects non-github resolvables', async () => {
  const locator = container.getNamed<GitLocator>(Binding.Locator, Name.GitLocator);

  resolvables.OTHERS.forEach(async ({ test }) => {
    await expect(locator.locate(test)).rejects.toThrow(/is not a GitHub repository/);
  });
});
