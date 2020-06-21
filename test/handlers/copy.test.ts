import { container, Binding, Name } from '@/Container';
import { CopyActionContract } from '@/Contracts';
import { getHandlerInstance } from './handlers.test';
import { Log } from '@/Logger';

async function validate<T>(type: string, data: Partial<T>): Promise<T | false> {
  const handler = getHandlerInstance(type);

  return ((await handler.validate({
    type,
    ...data,
  })) as unknown) as T; // yikes
}

it('returns a complete action object when validating a partial one', async () => {
  const result = await validate<CopyActionContract>('copy', {
    type: 'copy',
  });

  expect(result).toStrictEqual<CopyActionContract>({
    type: 'copy',
    files: '*',
    target: '',
    strategy: 'ask',
  });
});

it('does not override a property when validating a partial object', async () => {
  const result = await validate<CopyActionContract>('copy', {
    files: ['file1.txt', 'file2.txt'],
  });

  expect(result).toStrictEqual<CopyActionContract>({
    type: 'copy',
    files: ['file1.txt', 'file2.txt'],
    target: '',
    strategy: 'ask',
  });
});

it('replaces an unkown strategy by a the default one', async () => {
  Log.fake();
  const result = await validate<CopyActionContract>('copy', {
    // @ts-expect-error
    strategy: 'idk',
  });

  expect(result).toMatchObject<Partial<CopyActionContract>>({
    strategy: 'ask',
  });
  expect(Log.history).toContainEqual('warn Unknown strategy idk for a copy action.');
});
