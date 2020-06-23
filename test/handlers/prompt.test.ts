import { Prompt } from '@/Prompt';
import { handle } from './handlers.test';
import { PromptActionContract } from '@/Contracts';
import { Name } from '@/Container';

it('runs prompt actions and store their answers in the context', async () => {
  Prompt.fake();

  Prompt.on('prompt', async prompt => {
    const lookup = {
      username: 'Jon Doe',
      fruit: 2,
    };

    await prompt.answer(lookup[<'username' | 'fruit'>prompt.name]);
  });

  const context = {
    prompts: {},
  };

  await handle<PromptActionContract>(
    Name.PromptHandler,
    {
      prompts: [
        {
          name: 'username',
          message: 'What is your name?',
          type: 'input',
        },
        {
          name: 'fruit',
          message: 'What is your favorite fruit?',
          type: 'select',
          choices: [
            { name: 'apple', message: 'Apple', value: 1 },
            { name: 'pear', message: 'Pear', value: 2 },
            { name: 'banana', message: 'Banana', value: 3 },
          ],
        },
      ],
    },
    context
  );

  expect(context.prompts).toStrictEqual({
    username: 'Jon Doe',
    fruit: 2,
  });
});
