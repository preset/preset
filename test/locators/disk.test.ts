import { resolvables } from '@test/test-helpers';
import { Binding, container, DiskLocator, LocatedPreset, LocatorContract, Name } from '@/exports';

it('locates disk paths', async () => {
  const locator = container.getNamed<DiskLocator>(Binding.Locator, Name.DiskLocator);

  resolvables.DISK.forEach(async ({ test, path }) => {
    const result = await locator.locate(test);
    expect(result.path).toBe(path);
  });
});

it('rejects non-local paths', async () => {
  const locator = container.getNamed<DiskLocator>(Binding.Locator, Name.DiskLocator);

  resolvables.OTHERS.forEach(async ({ test }) => {
    await expect(locator.locate(test)).rejects.toThrow(/is not a local directory/);
  });
});
