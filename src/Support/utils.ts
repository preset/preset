import path from 'path';
import fs from 'fs-extra';
import { logger } from '@poppinss/cliui';
import execa, { CommonOptions } from 'execa';
import { Binding, Bus, container, ContextAware, Contextualized, Preset, PresetAware } from '@/exports';

const cache = {
  packageContent: null as any | null,
  preset: {} as Record<string, Preset>,
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
    cache.packageContent = fs.readJsonSync(path.join(__dirname, '../../package.json'));
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

export function cachePreset(id: string, preset: Preset): Preset {
  cache.preset[id] = preset;
  return preset;
}

export function getPreset(id: string): Preset {
  return cache.preset[id];
}

/**
 * Checks if the value can be contextualized.
 */
function canBeContextualized<T>(value: ContextAware<T>): value is PresetAware<T> {
  return Boolean((<PresetAware<T>>value)?.constructor && (<PresetAware<T>>value)?.call && (<PresetAware<T>>value)?.apply);
}

/**
 * Contextualizes the given context aware value.
 */
export function contextualizeValue<T>(preset: Preset, value: ContextAware<T>): T {
  if (canBeContextualized(value)) {
    return value(getPreset(preset.presetDirectory));
  }

  return value as T;
}

/**
 * Contextualizes every contextualizable property on the given action.
 */
export function contextualizeObject<T extends { [key: string]: any }>(preset: Preset, action: T): Contextualized<T> {
  const result = Object.entries(action)
    .map(([name, value]) => ({ [name]: contextualizeValue(preset, value) }))
    .reduce((acc, val) => ({ ...acc, ...val }), {});

  return result as T;
}

/**
 * Wraps the thing in an array if it's not already.
 */
export function wrap<T>(thing: T | T[]): T[] {
  if (!thing) {
    return [];
  }

  if (!Array.isArray(thing)) {
    thing = [thing];
  }

  return thing;
}

/**
 * Executes the given command.
 */
export async function execute(cwd: string, command: string, args: string[] = [], options: CommonOptions<'utf8'> = {}): Promise<string[]> {
  const log: string[] = [];
  const result = execa(command, args, {
    cwd,
    all: true,
    ...options,
  });

  result.all?.on('data', (data: Int32Array) => {
    const bus = container.get<Bus>(Binding.Bus);
    const lines = Buffer.from(data)
      .toString('utf-8')
      .split('\n')
      .filter((line) => line.trim().length > 0);

    lines.forEach((line) => {
      line = line.replace('\r', '');
      log.push(line);
      bus.debug(color.gray(line));
    });
  });

  await result;
  return log;
}

export const color = logger.colors;
