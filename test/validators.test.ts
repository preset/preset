import {
  Log,
  Action,
  CopyActionContract,
  Validator,
  ContextContract,
  DeleteActionContract,
  UpdateJsonFileActionContract,
  PromptActionContract,
} from '../src';
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

describe('Update JSON file Validator', () => {
  it('throws when no target is specified', async () => {
    Log.fake();

    const deleteAction: Partial<UpdateJsonFileActionContract> = {
      type: 'update-json-file',
    };

    const exit = jest.spyOn(process, 'exit').mockImplementation();
    const validated = await Validator.validate(deleteAction, context);

    expect(Log.logs).toContainEqual('error No target specified for the update-json-file action.');
    expect(exit).toHaveBeenCalled();
    expect(validated).toBeUndefined();
  });

  it('returns default values', async () => {
    const deleteAction: Partial<UpdateJsonFileActionContract> = {
      type: 'update-json-file',
      target: 'package.json',
    };

    const validated = await Validator.validate(deleteAction, context);

    expect(validated).toStrictEqual({
      type: 'update-json-file',
      strategy: 'create',
      target: 'package.json',
    });
  });

  it('returns passed values', async () => {
    const deleteAction: Partial<UpdateJsonFileActionContract> = {
      type: 'update-json-file',
      target: 'package.json',
      strategy: 'skip',
      merge: {
        dependencies: {
          vue: '^2',
          typescript: '^3.9.5',
        },
      },
      remove: ['dependencies.lodash'],
    };

    const validated = await Validator.validate(deleteAction, context);

    expect(validated).toStrictEqual({
      type: 'update-json-file',
      target: 'package.json',
      strategy: 'skip',
      merge: {
        dependencies: {
          vue: '^2',
          typescript: '^3.9.5',
        },
      },
      remove: ['dependencies.lodash'],
    });
  });
});

describe('Prompt validator', () => {
  it('throws if a prompt with no name is passed', async () => {
    Log.fake();

    const promptAction: Partial<PromptActionContract> = {
      type: 'prompt',
      // @ts-expect-error
      prompts: [
        {
          message: 'Hello',
        },
      ],
    };

    const exit = jest.spyOn(process, 'exit').mockImplementation();
    const validated = await Validator.validate(promptAction, context);

    expect(Log.logs).toContainEqual('error A prompt has no name.');
    expect(exit).toHaveBeenCalled();
    expect(validated).toBeUndefined();
  });

  it('throws if a prompt with no type is passed', async () => {
    Log.fake();

    const promptAction: Partial<PromptActionContract> = {
      type: 'prompt',
      // @ts-expect-error
      prompts: [
        {
          name: 'helo',
          message: 'Hello',
        },
      ],
    };

    const exit = jest.spyOn(process, 'exit').mockImplementation();
    const validated = await Validator.validate(promptAction, context);

    expect(Log.logs).toContainEqual('error A prompt has no type.');
    expect(exit).toHaveBeenCalled();
    expect(validated).toBeUndefined();
  });
});
