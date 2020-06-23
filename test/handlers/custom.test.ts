import { Name } from '@/Container';
import { CustomActionContract } from '@/Contracts';
import { TARGET_DIRECTORY } from '../constants';
import { handle } from './handlers.test';
import { Log } from '@/Logger';

it('executes a custom task', async () => {
  Log.fake();

  await handle<CustomActionContract>(
    Name.CustomHandler,
    {
      execute: () => {
        Log.info('test');
      },
    },
    {
      targetDirectory: TARGET_DIRECTORY,
    }
  );

  expect(Log.history).toStrictEqual(['info test']);
});

it('has context in custom task', async () => {
  Log.fake();

  await handle<CustomActionContract>(
    Name.CustomHandler,
    {
      execute: context => {
        Log.info(context.targetDirectory);
        Log.info(context.argv.join(' '));
      },
    },
    {
      argv: ['hello'],
      targetDirectory: TARGET_DIRECTORY,
    }
  );

  expect(Log.history).toStrictEqual([`info ${TARGET_DIRECTORY}`, 'info hello']);
});
