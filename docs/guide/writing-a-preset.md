# Writing a preset

## Creating the project

In an empty directory, run the following command:

```bash
preset init
```

Alternatively, you can specify a directory as the second argument to create the preset elsewhere.
After asking for a preset name, the command will generate the following: 

```
templates/
├─ .gitkeep
preset.ts
package.json
README.md
.gitignore
```

Unless you used the `--no-git` flag, a repository will be created with an initial commit, so you can immediatly start working on your preset.

## Adding actions

In the `handler` function of the object exported by `preset.ts`, you can use [actions](/concepts/actions). Note that both `handler` and action functions are asynchronous, which means that the latter must be `await`ed.

To learn more about actions and how they are used, refer to their [documentation page](/concepts/actions).

```ts
import { definePreset, extractTemplates } from '@preset/core'

export default definePreset({
	name: 'my-preset',
	handler: async() => {
		await extractTemplates()
		// ...
	},
})
```

## Testing the preset locally

In order to try your preset, you can simply use its path:

```ts
preset apply /path/to/your/preset/project
```

## Next steps

The next step is to build your preset. You can learn more about actions in their [documentation](/concepts/actions).

:::tip Archiving edited files
When creating a preset from a test project, if you committed its initial state and started editing it, you can use `git diff` to list the modified files.

Combined with `git archive`, you can zip up all of the files you edited and unzip them in the templates directory of your preset.

```bash
git archive -o update.zip HEAD $(git diff --diff-filter=M --name-only)
```
:::

Then, you will need to [publish your preset](/guides/hosting), or you can keep it local for your personal use. You can even use an [alias](/guide/using-aliases) to make it easier.
