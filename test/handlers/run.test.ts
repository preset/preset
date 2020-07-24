import { Name } from '@/Container';
import { RunActionContract } from '@/Contracts';
import { TARGET_DIRECTORY } from '../constants';
import { handle } from './handlers.test';
import { Logger } from '@/Logger';
import fs from 'fs-extra';

beforeEach(() => fs.emptyDirSync(TARGET_DIRECTORY));
afterAll(() => fs.removeSync(TARGET_DIRECTORY));

it('runs a command', async () => {
  await handle<RunActionContract>(
    Name.RunHandler,
    {
      command: 'node -v',
    },
    {
      targetDirectory: TARGET_DIRECTORY,
    }
  );

  expect(Logger.history.pop()?.message).toBe('Command terminated with code 0');
});
