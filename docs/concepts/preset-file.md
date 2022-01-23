# Preset file

In a Preset project, you must have at least what is called a "preset file". This is simply a specific script that describes the steps the preset applies on a project.

```ts
import { definePreset } from '@preset/core'

export default definePreset({
  name: 'my-preset',
  options: {
    // ...
  },
  handler: async () => {
    // ...
  }
})
```

## Changing the location

Preset files named `preset.ts` at the root or in the `src` directory of a project will be detected automatically. If you wish to place the file elsewhere, you can use the `preset` key in `package.json`:

```json
{
	"name": "my-preset",
	"preset": "config/preset.ts",
  // ...
}
```

## Constraints

Even though the preset file is like a regular script, it is used in a way that makes external imports unavailable. For instance, you can't install `execa` and use it directly. 

This is by design: to improve performances, Preset do not install dependencies. The preset file is parsed with `esbuild` and the default export is retrieve. 

Local file imports and Node built-in module imports are still available.
