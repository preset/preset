import { container, Binding } from '@/Container';
import { ApplierContract, ResolverContract, ResolverResultContract } from '@/Contracts';
import { TARGET_DIRECTORY, TEMP_DIRECTORY, stubs } from '../constants';
import { injectable } from 'inversify';
import { Log } from '@/Logger';
import fs from 'fs-extra';
import path from 'path';

beforeEach(() => {
  fs.emptyDirSync(TARGET_DIRECTORY);
  process.chdir(TARGET_DIRECTORY);
});

afterAll(() => {
  process.chdir('../..');
  fs.removeSync(TEMP_DIRECTORY);
  fs.removeSync(TARGET_DIRECTORY);
});

it('applies a distant preset', async () => {
  Log.fake();
  const applier = container.get<ApplierContract>(Binding.Applier);
  await applier.run({
    resolvable: 'hello-world',
  });

  expect(fs.existsSync(path.join(TARGET_DIRECTORY, 'hello-world.txt'))).toBe(true);
});

it('removes temporary directories', async () => {
  Log.fake();
  const presetDirectory = path.join(TEMP_DIRECTORY, 'no-action');

  fs.ensureDirSync(TEMP_DIRECTORY);
  fs.copySync(stubs.emptyActionList, presetDirectory);

  container.rebind<ResolverContract>(Binding.Resolver).to(
    injectable()(
      class implements ResolverContract {
        name: string = '';
        async resolve(input: string): Promise<ResolverResultContract> {
          return {
            success: true,
            temporary: true,
            path: presetDirectory,
          };
        }
      }
    )
  );

  const applier = container.get<ApplierContract>(Binding.Applier);
  await applier.run({
    resolvable: presetDirectory,
  });

  expect(fs.pathExistsSync(presetDirectory)).toBe(false);
  expect(Log.history).toStrictEqual(['success Applied preset preset.']);
});