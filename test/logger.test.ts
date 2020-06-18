import { Log } from '../src';

it('displays colors', () => {
  Log.configure({
    fake: true,
    noColor: false,
    debug: true,
  });

  Log.success('Success message');
  expect(Log.logs).toContainEqual('underline(green(success)) Success message');
});

it('does not display colors in fake mode', () => {
  Log.fake();
  Log.success('Success message');
  expect(Log.logs).toContainEqual('success Success message');
});

it('displays debug messages when told to', () => {
  Log.configure({
    fake: true,
    debug: true,
    noColor: true,
  });
  Log.debug('Debug message');
  expect(Log.logs).toContainEqual('debug Debug message');
});

it('does not display debug messages when told to', () => {
  Log.configure({
    fake: true,
    debug: false,
    noColor: true,
  });
  Log.debug('Debug message');
  expect(Log.logs).toStrictEqual([]);
});
