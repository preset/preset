---
outline: deep
---

# Prompt

> The `prompt` action can prompt the user for input when applying a preset. There are 2 prompt types available. 
> The default is a text prompt. A select prompt can be requested by supplying a `choices` property.

## Text prompt

Call the `prompt` function in the `handler`:

```ts
export default definePreset({
  // ...
  handler: async () => {
    await prompt({ name: 'name', text: 'What is your name?' })
  }
})
```

## Options

### `name`

Defines the property name of the `prompts` context object in which the answer to the prompt will be stored.

### `text`

Defines the text that will be displayed in the console when asking for input.

### `default`

Defines the default value for the prompt if the answer is skipped or if the terminal is not interactive.

## Examples

**Ask for a project name and use the target directory's name as the default value**

```ts
await prompt({
  title: 'prompt project name',
  name: 'name',
  text: 'What is the name of the project?',
  default: path.parse(context.applyOptions.targetDirectory).name,
})
```

## Interface

```ts
interface PromptOptions {
  name: string;
  text: string;
  default?: string;
}
```
## Select prompt

Call the `prompt` function in the `handler` with the `choices` option:

```ts
export default definePreset({
  // ...
  handler: async () => {
    await prompt({
      name: 'choice',
      text: 'What is your choice?',
      choices: ['first', 'second']
    })
  }
})
```

## Options

### `name`

Defines the property name of the `prompts` context object in which the answer to the prompt will be stored.

### `title`

Defines the text that will be displayed in the console when asking for input.

### `text`

Defines the text that will be displayed as a hint in the console.

### `initial`

Defines the index of the initial choice. This will be used if the answer is skipped or if the terminal is not interactive.

## Examples

**Choose a testing library from the selected choices**

```ts
await prompt({
  title: 'Choose a testing library',
  name: 'testing',
  text: 'Choose between mocha, vitest or jest',
  choices: [
    { title: 'Mocha', value: 'mocha' },
    { title: 'vitest'},
    'jest',
  ],
  initial: 0,
})
```

## Interface

```ts
type PromptChoice = { title: string, value?: string } | string

interface SelectPromptOptions {
  name: string
  text: string
  initial?: number
  choices: [PromptChoice]
}
```
