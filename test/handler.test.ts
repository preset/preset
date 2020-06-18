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

it('skips action that have a positive and a negative condition', async () => {
  const result = await Handler.handle(
    {
      type: 'none',
      if: [false, true],
    },
    mock<ContextContract>()
  );

  expect(result).toBe(false);
});

it('executes action that have positive conditions', async () => {
  const result = await Handler.handle(
    {
      type: 'none',
      if: [true, true],
    },
    mock<ContextContract>()
  );

  expect(result).toBe(true);
});
