import { container, Binding } from '@/Container';
import { ParserContract, ContextContract, ImporterContract, GeneratorContract } from '@/Contracts';
import { Logger } from '@/Logger';
import { stubs } from '../constants';
import { injectable } from 'inversify';
import { flags } from '@oclif/parser';
import path from 'path';

function mockImporter(generator: Partial<GeneratorContract> | false) {
  container.rebind(Binding.Importer).to(
    injectable()(
      class implements ImporterContract {
        async import(): Promise<false | GeneratorContract> {
          return generator as GeneratorContract;
        }
      }
    )
  );
}

it('parses a simple preset with an empty action list', async () => {
  const parser = container.get<ParserContract>(Binding.Parser);
  const context = await parser.parse(stubs.emptyActionList, {
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
  mockImporter({
    name: 'custom-title',
    templates: 'custom/template/folder',
    actions: () => [],
  });

  const context = await container.get<ParserContract>(Binding.Parser).parse(stubs.emptyActionList);

  expect(context).not.toBe(false);
  expect(context).toMatchObject<Partial<ContextContract>>({
    presetName: 'custom-title',
    presetTemplates: path.join(stubs.emptyActionList, 'custom', 'template', 'folder'),
  });
});

it('parses arguments and flags and returns them in the context', async () => {
  mockImporter({
    name: 'custom-title',
    parse: () => ({
      args: [{ name: 'input' }],
      flags: {
        auth: flags.boolean({ char: 'c' }),
      },
    }),
    actions: () => [],
  });

  const context = (await container.get<ParserContract>(Binding.Parser).parse(stubs.emptyActionList, {
    applierOptions: {
      argv: ['--auth', 'test'],
    },
  })) as ContextContract;

  expect(context).not.toBe(false);
  expect(context.flags?.auth).toBe(true);
  expect(context.args?.input).toBe('test');
});

it('adds git in the context', async () => {
  const parser = container.get<ParserContract>(Binding.Parser);
  const context = (await parser.parse(stubs.emptyActionList, {
    temporary: false,
  })) as ContextContract;

  expect(context).not.toBe(false);
  expect(context.git.config).not.toBe(undefined);
  // @ts-ignore
  expect(context.git.context._executor).not.toBe(undefined);
});

it('parses a preset that does not have a package', async () => {
  const parser = container.get<ParserContract>(Binding.Parser);
  const context = (await parser.parse(stubs.NO_PACKAGE, {
    temporary: false,
  })) as ContextContract;

  expect(context).not.toBe(false);
  expect(context.presetFile).toBe(path.join(stubs.NO_PACKAGE, 'preset.js'));
});
