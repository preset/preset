import { Name } from '@/Container';
import { CustomActionContract } from '@/Contracts';
import { TARGET_DIRECTORY } from '../constants';
import { handle } from './handlers.test';

it('executes a custom task', async () => {
  let actionHandled = false;

  await handle<CustomActionContract>(
    Name.CustomHandler,
    {
      execute: () => {
        actionHandled = true;
      },
    },
    {
      targetDirectory: TARGET_DIRECTORY,
    }
  );

  expect(actionHandled).toBe(true);
});

it('has context in custom task', async () => {
  const actionContext: any = {
    argv: null,
    targetDirectory: null,
  };

  await handle<CustomActionContract>(
    Name.CustomHandler,
    {
      execute: context => {
        actionContext.targetDirectory = context.targetDirectory;
        actionContext.argv = context.argv.join(' ');
      },
    },
    {
      argv: ['hello', 'world'],
      targetDirectory: TARGET_DIRECTORY,
    }
  );

  expect(actionContext.argv).toBe('hello world');
  expect(actionContext.targetDirectory).toBe(TARGET_DIRECTORY);
});
