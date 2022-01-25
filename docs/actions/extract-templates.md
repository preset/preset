# Extract templates

The `extractTemplates` action serves the common purpose of extracting files from the preset's template directory to the target directory.

## Usage

Call the `extractTemplates` options in the `handler` function:

```ts
export default definePreset({
  // ...
  handler: async () => {
    await extractTemplates({
      from: 'vue'
    })
  }
})
```

## Interface

```ts
interface ExtractTemplatesOptions {
	/**
	 * Defines the templates directory. Default is `templates`.
	 */
	templates?: string

	/**
	 * Sets the source file or directory.
	 */
	from?: string
	/**
	 * Sets the target file or directory.
	 */
	to?: string

	/**
	 * Ignore templates file structure. Only works when extracting from a file to a directory.
	 */
	flatten?: boolean

	/**
	 * Extract actual dotfiles in addition to `.dotfile` files.
	 */
	extractDotFiles?: boolean

	/**
	 * Defines whether to override existing files or skip extraction.
	 */
	whenConflict?: 'override' | 'skip'
}
```
