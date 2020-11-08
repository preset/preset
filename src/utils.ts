import path from 'path';
import fs from 'fs-extra';
import { logger } from '@poppinss/cliui';

/**
 * Gets the absolute path for the given directory.
 * If empty or relative, the current working directory is prepended.
 *
 * @param directory A path. Can be null.
 */
export function getAbsolutePath(directory: string = process.cwd()): string {
  return path.isAbsolute(directory) ? directory : path.join(process.cwd(), directory);
}

/**
 * Gets the content of the package.json file.
 */
export function getPackage(): any {
  return fs.readJsonSync(path.join(__dirname, '../package.json'));
}

/**
 * Gets a string with the CLI name, its version and the current platform.
 */
export function getVersion(): string {
  const { name, version } = getPackage();
  return `${name}/${version} ${process.platform}-${process.arch} node-${process.version}`;
}

export const color = logger.colors;
