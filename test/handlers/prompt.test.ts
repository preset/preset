import { Prompt, ContextContract, PromptHandler, PromptActionContract } from '../../src';
import { mock } from 'jest-mock-extended';

it('adds a prompt result to the context', async () => {
  Prompt.fake();

  Prompt.on('prompt', async prompt => {
    await prompt.answer('Jon Doe');
  });

  const context = {
    prompts: {},
  };

  await new PromptHandler().handle(
    mock<PromptActionContract>({
      type: 'prompt',
      prompts: {
        name: 'username',
        message: 'What is your name?',
        type: 'input',
      },
    }),
    context as ContextContract
  );

  expect(context.prompts).toStrictEqual({
    username: 'Jon Doe',
  });
});
