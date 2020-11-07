import path from 'path';

/**
 * Gets the absolute path for the given directory.
 * If empty or relative, the current working directory is prepended.
 *
 * @param directory A path. Can be null.
 */
export function getAbsolutePath(directory: string = process.cwd()): string {
  return path.isAbsolute(directory) ? directory : path.join(process.cwd(), directory);
}
