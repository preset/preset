import { handle } from './handlers.test';
import { PromptActionContract } from '@/Contracts';
import { Name } from '@/Container';

it.skip('runs prompt actions and store their answers in the context', async () => {
  // Prompt.fake();

  // Prompt.on('prompt', async prompt => {
  //   const lookup = {
  //     username: 'Jon Doe',
  //     fruit: 2,
  //   };

  //   await prompt.answer(lookup[<'username' | 'fruit'>prompt.name]);
  // });

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
          type: 'Input',
        },
        {
          name: 'fruit',
          message: 'What is your favorite fruit?',
          type: 'Select',
          choices: [
            { name: 'apple', message: 'Apple' },
            { name: 'pear', message: 'Pear' },
            { name: 'banana', message: 'Banana' },
          ],
        },
      ],
    },
    context
  );

  expect(context.prompts).toStrictEqual({
    username: 'Jon Doe',
    fruit: 'pear',
  });
});
