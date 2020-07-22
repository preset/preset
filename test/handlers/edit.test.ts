import { handle } from './handlers.test';
import { EditActionContract } from '@/Contracts';
import { Name } from '@/Container';
import { TARGET_DIRECTORY } from '../constants';
import fs from 'fs-extra';
import path from 'path';
import { Text } from '@supportjs/text';

async function assertEditAction(template: Text, action: Partial<EditActionContract>, expects: Text) {
  const filepath = path.join(TARGET_DIRECTORY, 'test.txt');

  fs.writeFileSync(filepath, Text.make(template).str());

  await handle<EditActionContract>(
    Name.EditHandler,
    {
      files: 'test.txt',
      ...action,
    },
    {
      targetDirectory: TARGET_DIRECTORY,
    }
  );

  expect(fs.readFileSync(filepath).toString()).toStrictEqual(Text.make(expects).str());
}

beforeEach(() => {
  fs.emptyDirSync(TARGET_DIRECTORY);
});

afterAll(() => {
  fs.removeSync(TARGET_DIRECTORY);
});

describe('Additions', () => {
  it('adds lines before and after the first line that matches', async () => {
    await assertEditAction(
      Text.make('line1').line('line2').line('line3').line('line4'),
      {
        addLines: [
          {
            search: 'line3',
            before: ['before line 3, first', 'before line 3, second'],
            after: 'after line 3',
          },
        ],
      },
      Text.make('line1')
        .line('line2')
        .line('before line 3, first')
        .line('before line 3, second')
        .line('line3')
        .line('after line 3')
        .line('line4')
    );
  });

  it('adds lines after the match', async () => {
    await assertEditAction(
      Text.make('line1').line('line2').line('line3').line('line4'),
      {
        addLines: [
          {
            search: 'line4',
            after: ['line5', 'line6'],
          },
        ],
      },
      Text.make('line1').line('line2').line('line3').line('line4').line('line5').line('line6')
    );
  });

  it('adds lines before the match', async () => {
    await assertEditAction(
      Text.make('line1').line('line2').line('line3').line('line4'),
      {
        addLines: [
          {
            search: 'line1',
            before: ['line0'],
          },
        ],
      },
      Text.make('line0').line('line1').line('line2').line('line3').line('line4')
    );
  });
});

describe('Removals', () => {
  it('removes line before and after the first line that matches', async () => {
    await assertEditAction(
      Text.make('line1').line('line2').line('line3').line('line4'),
      {
        removeLines: [
          {
            search: 'line3',
            removeMatch: false,
            before: 1,
            after: 1,
          },
        ],
      },
      Text.make('line1').line('line3')
    );
  });

  it('does not remove anything if asked to delete lines before the first line', async () => {
    await assertEditAction(
      Text.make('line1').line('line2').line('line3').line('line4'),
      {
        removeLines: [
          {
            search: 'line1',
            removeMatch: false,
            before: 1,
          },
        ],
      },
      Text.make('line1').line('line2').line('line3').line('line4')
    );
  });

  it('does not remove anything if asked to remove lines after the last line', async () => {
    await assertEditAction(
      Text.make('line1').line('line2').line('line3').line('line4'),
      {
        removeLines: [
          {
            search: 'line4',
            removeMatch: false,
            after: 1,
          },
        ],
      },
      Text.make('line1').line('line2').line('line3').line('line4')
    );
  });

  it('removes the remaining lines if asked to remove too much lines after the match', async () => {
    await assertEditAction(
      Text.make('line1').line('line2').line('line3').line('line4'),
      {
        removeLines: [
          {
            search: 'line3',
            removeMatch: false,
            after: 3,
          },
        ],
      },
      Text.make('line1').line('line2').line('line3')
    );
  });

  it('removes self, before and after', async () => {
    await assertEditAction(
      Text.make('line1').line('line2').line('line3').line('line4').line('line5'),
      {
        removeLines: [
          {
            search: 'line3',
            removeMatch: true,
            before: 1,
            after: 1,
          },
        ],
      },
      Text.make('line1').line('line5')
    );
  });
});

describe('Replacements', () => {
  it('replaces a matched regex with a replacer function', async () => {
    await assertEditAction(
      Text.make('line1') //
        .line('line2')
        .line('line3')
        .line('line4')
        .newLine(),
      {
        replace: [
          {
            search: /^line([0-9])$/gm,
            with: (match, p1) => match.replace(p1, '-n'),
          },
        ],
      },
      Text.make('line-n') //
        .newLine()
        .repeat(4)
    );
  });

  it('replaces a normal string with another', async () => {
    await assertEditAction(
      Text.make('line1') //
        .line('line2')
        .line('line3')
        .line('line3 bis')
        .line('line4'),
      {
        replace: [
          {
            search: 'line3',
            with: 'third line',
          },
        ],
      },
      Text.make('line1') //
        .line('line2')
        .line('third line')
        .line('line3 bis')
        .line('line4')
    );
  });
});

describe('Combinations', () => {
  it('removes and adds lines in the same action', async () => {
    await assertEditAction(
      Text.make('line1') //
        .line('line2')
        .line('line3')
        .line('line4'),
      {
        removeLines: [
          {
            search: 'line3',
            removeMatch: false,
            before: 1,
            after: 1,
          },
        ],
        addLines: [
          {
            search: 'line3',
            after: 'added after line 3',
          },
        ],
      },
      Text.make('line1') //
        .line('line3')
        .line('added after line 3')
    );
  });

  it('removes and adds lines in the same action taking into account first and last lines', async () => {
    await assertEditAction(
      Text.make('line1') //
        .line('line2')
        .line('line3')
        .line('line4'),
      {
        removeLines: [
          {
            search: 'line1',
            removeMatch: false,
            before: 1,
            after: 1,
          },
        ],
        addLines: [
          {
            search: 'line4',
            after: 'line5',
          },
        ],
      },
      Text.make('line1') //
        .line('line3')
        .line('line4')
        .line('line5')
    );
  });
});
