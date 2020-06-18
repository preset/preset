import { Handler, ContextContract, Log } from '../src';
import { mock } from 'jest-mock-extended';

it('skips action that have a negative condition', async () => {
  const result = await Handler.handle(
    {
      type: 'none',
      if: false,
    },
    mock<ContextContract>()
  );

  expect(result).toBe(false);
});
