import { Resolver, Log } from '../src';
import path from 'path';
import tmp from 'tmp';
import fs from 'fs';

describe('Local Resolver', () => {
  it('returns a successful response when finding a local directory', async () => {
    const preset = path.join(__dirname, 'stubs', 'copy');
    const result = await Resolver.resolve(preset);

    expect(result).toStrictEqual({
      success: true,
      path: preset,
      temporary: false,
    });
  });

  it('throws an error when it cannot find a local directory', async () => {
    Log.fake();
    const exit = jest.spyOn(process, 'exit').mockImplementation();
    const preset = path.join(__dirname, 'stubs', 'preset-that-does-not-exist');
    const result = await Resolver.resolve(preset);

    expect(Log.logs).toContainEqual(`error Could not find preset ${preset}.`);
    expect(exit).toHaveBeenCalled();
    expect(result).toBeUndefined();
  });
});

describe('Github Resolver', () => {
  async function testGithubResolver(input: string) {
    const result = await Resolver.resolve(input);
    const directory = result?.path ?? '';

    expect(directory.includes(tmp.tmpdir)).toBe(true);
    expect(result).toMatchObject({
      success: true,
      temporary: true,
    });

    return {
      ...result,
      path: directory,
    };
  }

  /**
   * Note: these tests apply side-effect on the operating system (they actually download stuff).
   * It could be great to mock everything, but this would be a huge refactoring task.
   * TODO
   */
  it('finds and clones GitHub repositories with the username/repository syntax', async () => {
    const result = await testGithubResolver('use-preset/use-preset');
    expect(fs.existsSync(path.join(result.path, '.git'))).toBe(true);
  });

  it('fins and clones Github repositories with the full URL using the http protocol', async () => {
    const result = await testGithubResolver('https://github.com/use-preset/use-preset');
    expect(fs.existsSync(path.join(result.path, '.git'))).toBe(true);
  });

  it('fins and clones Github repositories with the full URL using the git protocol', async () => {
    const result = await testGithubResolver('git@github.com:use-preset/use-preset.git');
    expect(fs.existsSync(path.join(result.path, '.git'))).toBe(true);
  });
});
