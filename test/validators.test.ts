import { Log, CopyAction, Validator, ContextContract } from '../src';
import { mock } from 'jest-mock-extended';

describe('Copy Validator', () => {
  const context = mock<ContextContract>();

  it('returns defaults values', async () => {
    const copyAction: Partial<CopyAction> = {
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

  it('throws if unknown type', async () => {
    Log.fake();

    // @ts-expect-error
    const copyAction: Partial<CopyAction> = { type: 'not-a-copy-action' };
    const exit = jest.spyOn(process, 'exit').mockImplementation();

    const validated = await Validator.validate(copyAction, context);

    expect(Log.logs).toContainEqual('error Invalid action of not-a-copy-action type.');
    expect(exit).toHaveBeenCalled();
    expect(validated).toBeUndefined();
  });
});
