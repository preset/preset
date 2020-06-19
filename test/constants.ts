import path from 'path';

export const STUBS_DIRECTORY = path.join(__dirname, '__stubs__');
export const TEMPLATES_DIRECTORY = path.join(__dirname, '__templates__');
export const TARGET_DIRECTORY = path.join(__dirname, '__target__');

export const stubs = {
  noAction: path.join(STUBS_DIRECTORY, 'no-action'),
  emptyActionList: path.join(STUBS_DIRECTORY, 'empty-action-list'),
  standaloneFile: path.join(STUBS_DIRECTORY, 'file.json'),
};

export const gists = {
  FUNCTIONAL_PUBLIC_GIST: 'https://gist.github.com/innocenzi/cd8a085144c803f85be572395fafc8ae',
  NOT_FUNCTIONAL_GIST_URL: 'https://gist.github.com/innocenzi/654erg56erg4e6azd46e4ez6f4ze8f', // at least, should be
};

export const repositories = {
  FUNCTIONAL_PRESET_REPOSITORY: 'https://github.com/use-preset/hello-world',
  NOT_FUNCTIONAL_PRESET_REPOSITORY: 'https://github.com/use-preset/i-do-not-exist',
};
