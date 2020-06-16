import { Log, Action, CopyActionContract, Validator, ContextContract, DeleteActionContract } from '../src';
import { mock } from 'jest-mock-extended';

const context = mock<ContextContract>();

describe('Validator', () => {
  it('throws if given an action of unknown type', async () => {
    Log.fake();

    // @ts-expect-error
    const action: Partial<Action> = { type: 'not-a-known-action-type' };
    const exit = jest.spyOn(process, 'exit').mockImplementation();

    const validated = await Validator.validate(action, context);

    expect(Log.logs).toContainEqual('error Invalid action of not-a-known-action-type type.');
    expect(exit).toHaveBeenCalled();
    expect(validated).toBeUndefined();
  });
});

describe('Copy Validator', () => {
  it('returns defaults values', async () => {
    const copyAction: Partial<CopyActionContract> = {
      type: 'copy',
    };

    const validated = await Validator.validate(copyAction, context);

    expect(validated).toStrictEqual({
      files: '*',
      strategy: 'ask',
      target: '',
      type: 'copy',
    });
  });

  it('returns passed values', async () => {
    const copyAction: Partial<CopyActionContract> = {
      files: 'subfolder/**/*',
      strategy: 'skip',
      target: 'subfolder',
      type: 'copy',
    };

    const validated = await Validator.validate(copyAction, context);

    expect(validated).toStrictEqual({
      files: 'subfolder/**/*',
      strategy: 'skip',
      target: 'subfolder',
      type: 'copy',
    });
  });
});

describe('Delete Validator', () => {
  it('returns default values', async () => {
    const deleteAction: Partial<DeleteActionContract> = {
      type: 'delete',
    };

    const validated = await Validator.validate(deleteAction, context);

    expect(validated).toStrictEqual({
      files: [],
      type: 'delete',
    });
  });

  it('returns passed values', async () => {
    const deleteAction: Partial<DeleteActionContract> = {
      files: ['some-file.txt', 'subfolder/file.txt'],
      type: 'delete',
    };

    const validated = await Validator.validate(deleteAction, context);

    expect(validated).toStrictEqual({
      files: ['some-file.txt', 'subfolder/file.txt'],
      type: 'delete',
    });
  });
});
