import { Parser, Log, ContextContract } from '../src';
import path from 'path';

describe('Context', () => {
  it('parses extra flags and arguments', async () => {
    const directory = path.join(__dirname, 'stubs', 'args');
    const context = await Parser.parse(directory, false, ...['--auth', 'hello world']);

    expect(context?.args?.input).toBe('hello world');
    expect(context?.flags?.auth).toBe(true);
  });

  it('throws an error when a required argument is not given', async () => {
    Log.fake();
    const exit = jest.spyOn(process, 'exit').mockImplementation();
    const directory = path.join(__dirname, 'stubs', 'args');
    const context = await Parser.parse(directory, false, ...['--auth']);

    expect(Log.logs).toStrictEqual([
      'fatal Could not parse extra arguments.',
      'warn This is probably an issue from this preset, not from use-preset.',
    ]);
    expect(context).toBe(undefined);
    expect(exit).toHaveBeenCalled();
  });

  it('throws when the given directory does not exist', async () => {
    Log.fake();
    const exit = jest.spyOn(process, 'exit').mockImplementation();
    const directory = path.join(__dirname, 'stubs', 'inexisting-preset-directory');
    const context = await Parser.parse(directory, false);

    expect(exit).toHaveBeenCalled();
    expect(context).toBeUndefined();
    expect(Log.logs).toContainEqual(`error ${directory} is not a preset directory.`);
  });

  it('throws when there is no package.json', async () => {
    Log.fake();
    const exit = jest.spyOn(process, 'exit').mockImplementation();
    const directory = path.join(__dirname, 'stubs', 'packageless-preset');
    const context = await Parser.parse(directory, false);

    expect(exit).toHaveBeenCalled();
    expect(context).toBeUndefined();
    expect(Log.logs).toContainEqual(`error ${directory} does not have a package.json.`);
  });

  it('throws when the specified preset file does not exist', async () => {
    Log.fake();
    const exit = jest.spyOn(process, 'exit').mockImplementation();
    const directory = path.join(__dirname, 'stubs', 'wrong-preset-file');
    const presetFile = require(path.join(directory, 'package.json')).preset;
    const context = await Parser.parse(directory, false);

    expect(exit).toHaveBeenCalled();
    expect(context).toBeUndefined();
    expect(Log.logs).toContainEqual(`error Preset file ${path.join(directory, presetFile)} does not exist.`);
  });

  it('throws when the specified preset is not valid', async () => {
    Log.fake();
    const exit = jest.spyOn(process, 'exit').mockImplementation();
    const directory = path.join(__dirname, 'stubs', 'invalid-preset-file');
    const context = await Parser.parse(directory, false);

    expect(exit).toHaveBeenCalled();
    expect(context).toBeUndefined();
    expect(Log.logs).toContainEqual(`error ${path.join(directory, 'preset.js')} is not a valid preset file.`);
  });

  it('loads a context for a preset', async () => {
    const directory = path.join(__dirname, 'stubs', 'copy');
    const context = await Parser.parse(directory, false);

    expect(Object.keys(context.git)).toMatchObject(['context', 'config']);
    expect(context?.git?.context).not.toBeUndefined();
    expect(context.generator).not.toBeUndefined();
    expect(context).toMatchObject<Partial<ContextContract>>({
      argv: [],
      presetDirectory: directory,
      presetFile: path.join(directory, 'preset.js'),
      presetName: 'Unnamed',
      presetTemplates: path.join(directory, 'templates'),
      targetDirectory: process.cwd(),
      temporary: false,
    });
  });
});
