import { container, Binding } from '@/Container';
import { ParserContract, ContextContract, ImporterContract, GeneratorContract } from '@/Contracts';
import { Log } from '@/Logger';
import { stubs, STUBS_DIRECTORY, TARGET_DIRECTORY } from '../constants';
import path from 'path';
import { injectable } from 'inversify';

it('fails to parse a preset that does not have an action key', async () => {
  Log.fake();
  const parser = container.get<ParserContract>(Binding.Parser);
  const context = await parser.parse(stubs.noAction, {
    argv: [],
    temporary: false,
  });

  expect(context).toBe(false);
  expect(Log.history).toStrictEqual([
    'warn Preset is not valid because it lacks an action key.',
    `fatal ${path.join(stubs.noAction, 'preset.js')} is not a valid preset file.`,
  ]);
});

it('parses a simple preset with an empty action list', async () => {
  const parser = container.get<ParserContract>(Binding.Parser);
  const context = await parser.parse(stubs.emptyActionList, {
    argv: [],
    temporary: false,
  });

  expect(context).toMatchObject<Partial<ContextContract>>({
    argv: [],
    presetDirectory: stubs.emptyActionList,
    presetFile: path.join(stubs.emptyActionList, 'preset.js'),
    presetName: 'preset',
    presetTemplates: path.join(stubs.emptyActionList, 'templates'),
    targetDirectory: process.cwd(),
    temporary: false,
  });
});

it('finds specified options in the given preset', async () => {
  container.rebind(Binding.Importer).to(
    injectable()(
      class implements ImporterContract {
        async import(): Promise<false | GeneratorContract> {
          return {
            name: 'custom-title',
            templates: 'custom/template/folder',
            actions: () => [],
          };
        }
      }
    )
  );
  const context = await container.get<ParserContract>(Binding.Parser).parse(stubs.emptyActionList);

  expect(context).not.toBe(false);
  expect(context).toMatchObject<Partial<ContextContract>>({
    presetName: 'custom-title',
    presetTemplates: path.join(stubs.emptyActionList, 'custom', 'template', 'folder'),
  });
});

it.todo('returns parsed arguments');
it.todo('returns git context');
