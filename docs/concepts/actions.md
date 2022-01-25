# Actions

Actions are functions available in preset files. They are a layer of abstraction for diverse kind of manipulations, such as copies, editions, deletions, package installations, and more.

They are the key concept of Preset: easy to use, powerful enough to make almost any kind of preset.

## Usage

Actions are globally avaiable in a preset file. Typings are provided by default if you used `preset init`, so you can benefit from IDE autocompletion. Every action is a single asynchronous function call with a single object parameter. 

## Available actions

The following actions are implemented.

| Name                                                 | Description                                        |
| ---------------------------------------------------- | -------------------------------------------------- |
| [Extract templates](/actions/extract-templates)      | Extracts file from the preset's template directory |
| [Install packages](/actions/install-packages)        | Installs Node or PHP packages                      |
| [Execute command](/actions/execute-command)          | Executes shell commands in the target directory    |
| [Edit files](/actions/edit-files)                    | Performs file manipulations on the selected files  |
| [Delete paths](/actions/delete-paths)                | Deletes files or directories                       |
| [Apply nested presets](/actions/apply-nested-preset) | Applies another preset                             |
| [Group](/actions/group)                              | Groups multiple actions together                   |
| [Prompt (experimental)](/actions/prompt)             | Asks for user input                                |
