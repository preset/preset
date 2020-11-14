import { handleInSandbox, makePreset, readFromSandbox, sandboxHasFile, stubs, writeToSandbox } from '@test/test-helpers';
import { Edit, Name, wrap } from '@/exports';

/**
 * Runs the edit handler with the given initial file, against the expected file.
 */
async function testEditHandler(initialFile: string | string[], expectedFile: string | string[], configureAtion: (action: Edit) => void) {
  const { preset, options } = makePreset();
  const action = preset.edit('file.txt');
  configureAtion(action);

  await handleInSandbox(
    Name.Handler.Edit,
    action,
    options,
    () => {
      expect(readFromSandbox('file.txt')?.split('\n')).toStrictEqual(wrap(expectedFile));
    },
    () => {
      writeToSandbox('file.txt', initialFile);
    },
  );
}

it('adds a line before and after a match', async () => {
  await testEditHandler('First line', ['First line', 'second line'], (action) => {
    action.find('First line').addAfter('second line');
  });

  await testEditHandler('First line', ['Haha prank this is the actual first line', 'First line'], (action) => {
    action.find('First line').addBefore('Haha prank this is the actual first line');
  });
});

it('does not edit the file when there is no match', async () => {
  await testEditHandler('Initial file.txt content', 'Initial file.txt content', (action) => {
    action.find('string-that-does-not-exist').addAfter('This should not be in the file');
  });
});

it('detects indentation when adding a line', async () => {
  await testEditHandler(
    [
      //
      'A normal line',
      '  An indented line',
      '  Another indented line',
      'A second normal line',
    ],
    [
      //
      'A normal line',
      '  An indented line',
      '  A second line with the same indentation',
      '  Another indented line',
      'A second normal line',
    ],
    (action) => {
      action.find('An indented line');
      action.addAfter('A second line with the same indentation');
    },
  );
});

it('doubles indentation', async () => {
  await testEditHandler(
    [
      //
      'A normal line',
      '  An indented line',
      '  Another indented line',
      'A second normal line',
    ],
    [
      //
      'A normal line',
      '  An indented line',
      '    A second line with twice the indentation',
      '  Another indented line',
      'A second normal line',
    ],
    (action) => {
      action.find('An indented line');
      action.addAfter('A second line with twice the indentation').withIndent('double');
    },
  );
});

it('skips the given amount of lines', async () => {
  await testEditHandler(
    [
      //
      'A first line',
      'A second line',
      'A third line',
    ],
    [
      //
      'A first line',
      'A second line',
      'A third line',
      'A line after the third line',
    ],
    (action) => {
      action.find('A first line').addAfter('A line after the third line').skipLines(2);
    },
  );

  await testEditHandler(
    [
      //
      'A first line',
      'A second line',
      'A third line',
    ],
    [
      //
      'A line before the first line',
      'A first line',
      'A second line',
      'A third line',
    ],
    (action) => {
      action.find('A third line').addBefore('A line before the first line').skipLines(2);
    },
  );
});
