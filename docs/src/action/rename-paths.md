---
outline: deep
---

# Rename paths

> The `renamePaths` action is useful to rename files or directories inside the target directory.

## Usage

Call the `renamePaths` options in the `handler` function:

```ts
export default definePreset({
  // ...
  handler: async () => {
    await renamePaths({
      paths: 'vite.config.js',
      transformer: ({name}) => `${name}.ts`,
    })
  },
})
```

## Options

### `paths`

Defines the files or directories to rename from the target directory. Must be a string or array of strings. Can use a double-star glob.

### `transformer`

Defines the `string` or mutating function which returns the targets `ParsedPath` and can be used to transform its name or extension.

## Examples

**Rename a single file in the target directory**

```ts
await renamePaths({
  paths: '_tsconfig.json',
  transformer: 'tsconfig.json',
})
```

**Change a single files extension via mutating function**

```ts
await renamePaths({
  paths: 'blog-post.md',
  transformer: ({name}) => `${name}.mdx`,
})
```

**Rename multiple folders in the target directory via mutating function**

```ts
await renamePaths({
  paths: ['folder-1', 'folder-2'],
  transformer: ({base}) => `old-${base}`,
})
```

**Rename globs via mutating function**

```ts
const now = new Date().toISOString().substring(0, 10)

await renamePaths({
  paths: '**/*.txt',
  transformer: ({base}) => `${now}-${base}`,
})
```

## Interface

```ts
interface ParsedPath {
  name: string
  base: string
  ext?: string
}

export interface RenamePathsOptions {
  paths: string | string[]
  transformer: string | ((parameters: ParsedPath) => string)
}
```
