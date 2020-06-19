import { Log } from '@/Logger';

it('displays colors', () => {
  Log.configure({
    fake: true,
    color: true,
  });

  Log.success('Success message');
  expect(Log.history).toContainEqual('underline(green(success)) Success message');
});

it('does not display colors in fake mode', () => {
  Log.fake();
  Log.success('Success message');
  expect(Log.history).toContainEqual('success Success message');
});

it('displays debug messages when told to', () => {
  Log.configure({
    fake: true,
    debug: true,
    color: false,
  });
  Log.debug('Debug message');
  expect(Log.history).toContainEqual('debug Debug message');
});

it('does not display debug messages when told to', () => {
  Log.configure({
    fake: true,
    debug: false,
  });
  Log.debug('Debug message');
  expect(Log.history).toStrictEqual([]);
});
