import path from 'path';
import fs from 'fs-extra';
import { logger } from '@poppinss/cliui';
import { Preset } from './Configuration/Preset';
import { ContextAware } from './Contracts/PresetContract';

const cache = {
  packageContent: null as any | null,
  preset: null as Preset | null,
};

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
  if (!cache.packageContent) {
    cache.packageContent = fs.readJsonSync(path.join(__dirname, '../package.json'));
  }

  return cache.packageContent;
}

/**
 * Gets a string with the CLI name, its version and the current platform.
 */
export function getVersion(): string {
  const { name, version } = getPackage();
  return `${name}/${version} ${process.platform}-${process.arch} node-${process.version}`;
}

export function registerPreset(preset: Preset): void {
  cache.preset = preset;
}

/**
 * Contextualizes the given context aware value.
 */
export function contextualizeValue<T extends any>(value: ContextAware<T> | any): T {
  if (!!(value && value.constructor && value.call && value.apply)) {
    return value(cache.preset);
  }

  return value;
}

/**
 * Contextualizes every contextualizable property on the given action.
 */
export function contextualizeAction<T extends { [key: string]: any }>(action: T): T {
  const result = Object.entries(action)
    .map(([name, value]) => ({ [name]: contextualizeValue(value) }))
    .reduce((acc, val) => ({ ...acc, ...val }), {});

  return result as T;
}

export const color = logger.colors;
