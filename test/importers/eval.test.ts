import { Logger } from '@/Logger';
import { container, Binding } from '@/Container';
import { ImporterContract, GeneratorContract } from '@/Contracts';
import { stubs } from '../constants';
import path from 'path';

it('imports an empty preset', async () => {
  const importer = container.get<ImporterContract>(Binding.Importer);
  const generator = await importer.import(path.join(stubs.emptyActionList, 'preset.js'));

  expect(generator).not.toBe(false);
});

it('imports a preset which requires the api', async () => {
  const importer = container.get<ImporterContract>(Binding.Importer);
  const generator = await importer.import(path.join(stubs.NO_ACTION_USES_API, 'preset.js'));

  expect(generator).not.toBe(false);
  expect((<GeneratorContract>generator).name).toBe('preset');
});

it('does not throw when a preset has the term require', async () => {
  const importer = container.get<ImporterContract>(Binding.Importer);
  const generator = await importer.import(path.join(stubs.HAS_REQUIRE, 'preset.js'));

  expect(generator).not.toBe(false);
  expect((<GeneratorContract>generator).name).toBe('preset');
});

it('throws when importing a preset which requires an external script', async () => {
  const generatorPath = path.join(stubs.USES_EXTERNAL_REQUIRE, 'preset.js');
  const importer = container.get<ImporterContract>(Binding.Importer);

  const t = async () => {
    await importer.import(generatorPath);
  };

  await expect(t).rejects.toThrowError(`Could not parse ${generatorPath}`);

  expect(
    Logger.history.some(
      ({ message }) =>
        message ===
        'Dependency some-external-dependency is not authorized. If you think this is a mistake, please open an issue.'
    )
  ).toBe(true);
});
