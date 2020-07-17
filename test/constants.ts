import path from 'path';

export const STUBS_DIRECTORY = path.join(__dirname, '__stubs__');
export const TEMPLATES_DIRECTORY = path.join(__dirname, '__templates__');
export const TARGET_DIRECTORY = path.join(__dirname, '__target__');
export const TEMP_DIRECTORY = path.join(__dirname, '__temp__');

export const stubs = {
  noAction: path.join(STUBS_DIRECTORY, 'no-action'),
  emptyActionList: path.join(STUBS_DIRECTORY, 'empty-action-list'),
  standaloneFile: path.join(STUBS_DIRECTORY, 'file.json'),
  NO_PACKAGE: path.join(STUBS_DIRECTORY, 'no-package'),
  NO_ACTION_USES_API: path.join(STUBS_DIRECTORY, 'no-action-uses-api'),
  HAS_REQUIRE: path.join(STUBS_DIRECTORY, 'has-require'),
  USES_EXTERNAL_REQUIRE: path.join(STUBS_DIRECTORY, 'uses-external-require'),
  COPY_SINGLE_FILE: path.join(STUBS_DIRECTORY, 'copy-single-file'),
};

export const templates = {
  COPY_WITH_SUBFOLDER: path.join(TEMPLATES_DIRECTORY, 'copy-with-subfolder'),
  COPY_WITH_SUBFOLDERS: path.join(TEMPLATES_DIRECTORY, 'copy-with-subfolders'),
  COPY_WITH_DOTFILES: path.join(TEMPLATES_DIRECTORY, 'copy-with-dotfiles'),
};

export const gists = {
  FUNCTIONAL_PUBLIC_GIST: 'https://gist.github.com/innocenzi/cd8a085144c803f85be572395fafc8ae',
  NOT_FUNCTIONAL_GIST_URL: 'https://gist.github.com/innocenzi/654erg56erg4e6azd46e4ez6f4ze8f', // at least, should be
};

export const repositories = {
  FUNCTIONAL_PRESET_GITHUB_REPOSITORY: 'https://github.com/use-preset/hello-world',
  NOT_FUNCTIONAL_PRESET_GITHUB_REPOSITORY: 'https://github.com/use-preset/i-do-not-exist',
};
