import { Name } from '@/Container';
import { RunActionContract } from '@/Contracts';
import { TARGET_DIRECTORY } from '../constants';
import { handle } from './handlers.test';
import { Logger } from '@/Logger';
import fs from 'fs-extra';

beforeEach(() => fs.emptyDirSync(TARGET_DIRECTORY));
afterAll(() => fs.removeSync(TARGET_DIRECTORY));

it('runs a command', async () => {
  try {
    await handle<RunActionContract>(
      Name.RunHandler,
      {
        command: 'node',
        arguments: ['-v'],
      },
      {
        targetDirectory: TARGET_DIRECTORY,
      }
    );
  } catch (error) {
    Logger.error(error);
  }

  expect(Logger.history.shift()?.message).toBe('Running command: node -v');
});
