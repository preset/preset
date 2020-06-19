import path from 'path';

export const STUBS_DIRECTORY = path.join(__dirname, '__stubs__');
export const TEMPLATES_DIRECTORY = path.join(__dirname, '__templates__');
export const TARGET_DIRECTORY = path.join(__dirname, '__target__');

export const stubs = {
  noAction: path.join(STUBS_DIRECTORY, 'no-action'),
  standaloneFile: path.join(STUBS_DIRECTORY, 'file.json'),
};
