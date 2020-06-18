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

it('executes message hooks', async () => {
  Log.configure({ fake: true, debug: true, noColor: true });
  const result = await Handler.handle(
    {
      type: 'none',
      before: ['Before message 1', 'Before message 2'],
      after: ['After message 1', 'After message 2'],
    },
    mock<ContextContract>()
  );
  expect(result).toBe(true);
  expect(Log.logs).toStrictEqual([
    'info Before message 1',
    'info Before message 2',
    'debug A null action ran.',
    'info After message 1',
    'info After message 2',
  ]);
});
