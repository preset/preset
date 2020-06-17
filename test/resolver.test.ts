import { Resolver, Log, ResolverResultContract } from '../src';
import path from 'path';
import tmp from 'tmp';
import fs from 'fs-extra';

const STUB_DIRECTORY = path.join(__dirname, '__stubs__');

async function testTemporaryResolver(input: string, results: ResolverResultContract[]) {
  const result = await Resolver.resolve(input);
  const directory = result?.path ?? '';

  expect(directory.includes(tmp.tmpdir)).toBe(true);
  expect(result).toMatchObject({
    success: true,
    temporary: true,
  });

  results.push(result);
  return {
    ...result,
    path: directory,
  };
}

describe('Local Resolver', () => {
  it('returns a successful response when finding a local directory', async () => {
    const preset = path.join(STUB_DIRECTORY, 'copy');
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
    const preset = path.join(STUB_DIRECTORY, 'preset-that-does-not-exist');
    const result = await Resolver.resolve(preset);

    expect(Log.logs).toContainEqual(`error Could not find preset ${preset}.`);
    expect(exit).toHaveBeenCalled();
    expect(result).toBeUndefined();
  });
});

describe('Git Resolver', () => {
  const results: ResolverResultContract[] = [];

  /**
   * Cleans up the temporary directories.
   */
  afterAll(() => {
    try {
      results.forEach(result => {
        if (result.success && result.temporary) {
          fs.removeSync(<any>result.path);
        }
      });
    } catch (error) {
      console.error(`Could not delete temporary directory.`);
      console.error(error);
    }
  });

  /**
   * Note: these tests apply side-effect on the operating system (they actually download stuff).
   * It could be great to mock everything, but this would be a huge refactoring task.
   * TODO
   */
  it('finds and clones GitHub repositories with the username/repository syntax', async () => {
    const result = await testTemporaryResolver('use-preset/use-preset', results);
    expect(fs.existsSync(path.join(result.path, '.git'))).toBe(true);
  });

  it('finds and clones Github repositories with the full URL using the http protocol', async () => {
    const result = await testTemporaryResolver('https://github.com/use-preset/use-preset', results);
    expect(fs.existsSync(path.join(result.path, '.git'))).toBe(true);
  });

  it('finds and clones Github repositories with the full URL using the git protocol', async () => {
    const result = await testTemporaryResolver('git@github.com:use-preset/use-preset.git', results);
    expect(fs.existsSync(path.join(result.path, '.git'))).toBe(true);
  });

  it('finds and clones public Gists', async () => {
    const result = await testTemporaryResolver(
      'https://gist.github.com/innocenzi/cd8a085144c803f85be572395fafc8ae',
      results
    );
    expect(fs.existsSync(path.join(result.path, 'package.json'))).toBe(true);
  });
});
