import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import git from 'simple-git'
import { emitter } from './events'
import type { LocalDirectoryPreset, RepositoryPreset, ApplyOptions, LocalFilePreset, LocalPreset } from './types'
import { debug, invoke } from './utils'

/**
 * Resolves the preset file and returns its path.
 */
export async function resolvePreset(options: ApplyOptions): Promise<LocalPreset> {
	// Parses the resolvable string into an object representing a directory or a repository.
	const resolved = await parseResolvable(options)
	const emitAndReturn = (resolved: LocalPreset) => {
		debug.apply('Resolved: ', resolved)
		emitter.emit('preset:resolve', resolved)

		return resolved
	}

	// If we already have a file path, returns it.
	if (resolved.type === 'file') {
		return emitAndReturn({
			rootDirectory: path.dirname(resolved.path),
			presetFile: resolved.path,
		})
	}

	// If it's a repository, clone it and resolve the preset file.
	if (resolved.type === 'repository') {
		const rootDirectory = await cloneRepository(resolved, options)

		return emitAndReturn(await resolvePresetFile(rootDirectory))
	}

	// Otherwise, it's a directory, just resolve the preset file.
	return emitAndReturn(await resolvePresetFile(resolved.path))
}

/**
 * Parses the given resolvable.
 */
export async function parseResolvable(options: ApplyOptions, cwd: string = process.cwd()): Promise<LocalDirectoryPreset | RepositoryPreset | LocalFilePreset> {
	debug.resolve('Working directory:', cwd)
	debug.resolve('Parsing resolvable:', options.resolvable)
	const resolved
		= await resolveNamespacedAlias(options)
		|| await resolveLocalFile(options, cwd)
		|| await resolveLocalDirectory(options, cwd)
		|| await resolveGitHubRepository(options)

	if (!resolved) {
		throw new Error(`Could not resolve ${options.resolvable} as a local file, local directory or a repository.`)
	}

	return resolved
}

/**
 * Resolves the short syntax for GitHub.
 *
 * @example organization/repository
 * @example organization/repository(at)tag
 * @example git(at)github.com:organization/repository
 */
export async function resolveGitHubRepository(options: ApplyOptions): Promise<RepositoryPreset | false> {
	debug.resolve('Trying to resolve as a GitHub repository.')

	const regexes = [
		/^([a-zA-Z][\w-]+)\/([a-zA-Z][\w-]+)(?:@([\w-\.]+))?$/,
		/^git@github\.com:([a-zA-Z][\w-]+)\/([a-zA-Z][\w-]+)(?:\.git)?(?:@([\w-\.]+))?$/,
		/^https?:\/\/(?:www\.)?github\.com\/([a-zA-Z][\w-]+)\/([a-zA-Z][\w-]+)(?:\.git)?(?:@([\w-\.]+))?/,
	]

	const repository = regexes
		.map((regex) => {
			const [matches, organization, repository, tag] = options.resolvable.match(regex) ?? []

			if (!matches) {
				return false
			}

			const result: RepositoryPreset = {
				type: 'repository',
				organization,
				repository,
				tag,
				ssh: !options.resolvable.includes('http'),
				path: options.parsedOptions.path ?? '',
			}

			return result
		})
		.filter(Boolean)
		?.shift()

	if (repository) {
		debug.resolve('Successfully resolved as a repository.')

		return repository
	}

	return false
}

/**
 * Resolves a local directory.
 */
export async function resolveLocalDirectory(options: ApplyOptions, cwd: string): Promise<LocalDirectoryPreset | false> {
	const absolute = path.resolve(cwd, options.resolvable, options.parsedOptions.path ?? '')

	debug.resolve('Trying to resolve as a local directory:', absolute)

	try {
		if ((fs.statSync(absolute)).isDirectory()) {
			debug.resolve('Successfully resolved as a local directory.')

			return {
				type: 'directory',
				path: absolute,
			}
		}
	} catch {}

	return false
}

/**
 * Resolves a local file.
 */
export async function resolveLocalFile(options: ApplyOptions, cwd: string): Promise<LocalFilePreset | false> {
	const absolute = path.resolve(cwd, options.resolvable, options.parsedOptions.path ?? '')

	debug.resolve('Trying to resolve as a local file:', absolute)

	try {
		if ((fs.statSync(absolute)).isFile()) {
			debug.resolve('Successfully resolved as a local file.')

			return {
				type: 'file',
				path: absolute,
			}
		}
	} catch {}

	return false
}

/**
 * Resolves namespaced aliases.
 *
 * @example laravel:inertia => laravel-presets/inertia
 */
export async function resolveNamespacedAlias(options: ApplyOptions): Promise<RepositoryPreset | false> {
	debug.resolve('Trying to resolve an alias.')

	if (!options.resolvable.match(/^([a-zA-Z][\w-]+):([a-zA-Z][\w-]+)$/)) {
		return false
	}

	const [namespace, repository] = options.resolvable.split(':')

	return {
		type: 'repository',
		ssh: true,
		organization: `${namespace}-presets`,
		repository,
		path: options.parsedOptions.path ?? '',
	}
}

/**
 * Resolves the preset file in the given directory.
 *
 * @param directory Absolute path to the directory in which to find the preset file.
 */
export async function resolvePresetFile(directory: string, cwd: string = process.cwd()): Promise<LocalPreset> {
	debug.resolve(`Resolving preset file in "${directory}" with working directory "${cwd}".`)

	const pkg = invoke(() => {
		try {
			return JSON.parse(fs.readFileSync(path.resolve(cwd, directory, 'package.json')) as any)
		} catch (error) {}

		return false
	})

	const ensureFile = async(file?: string) => {
		if (!file) {
			return null
		}

		try {
			const filepath = path.resolve(cwd, directory, file)
			if ((fs.statSync(filepath)).isFile()) {
				return filepath
			}
		} catch { }

		return null
	}

	const filepath = await ensureFile(pkg?.preset) ?? await ensureFile('preset.ts') ?? await ensureFile('src/preset.ts')

	if (!filepath) {
		debug.resolve(`Could not find the preset file in "${directory}".`)
		throw new Error(`Could not find a preset file in "${directory}".`)
	}

	debug.resolve(`Found "${filepath}".`)

	const DEPENDENCY_NAME = '@preset/core'

	return {
		rootDirectory: directory,
		presetFile: filepath,
		presetVersion: pkg?.devDependencies?.[DEPENDENCY_NAME] ?? pkg?.dependencies?.[DEPENDENCY_NAME],
	}
}

/**
 * Clones the repository to the disk.
 */
export async function cloneRepository(preset: RepositoryPreset, options: ApplyOptions) {
	const targetDirectory = path.resolve(fs.realpathSync(os.tmpdir()), 'presets', preset.repository)
	const useCache = options?.parsedOptions?.cache === undefined ? true : options?.parsedOptions?.cache
	const cloneWithSsh = options?.parsedOptions?.ssh === undefined ? preset.ssh : options.parsedOptions.ssh
	const tag = (options?.parsedOptions?.tag === undefined ? preset.tag : options.parsedOptions.tag)
	const repositoryUrl = cloneWithSsh
		? `git@github.com:${preset.organization}/${preset.repository}.git`
		: `https://github.com/${preset.organization}/${preset.repository}`

	// Checks if already cloned
	if (fs.statSync(targetDirectory, { throwIfNoEntry: false })?.isDirectory()) {
		debug.resolve(`${repositoryUrl} already exists, checking if up-to-date.`)

		const remoteLatest = (await git().listRemote([repositoryUrl, tag ?? 'HEAD'])).replace('HEAD', '').trim()
		debug.resolve(`Remote latest commit: ${remoteLatest} (${tag ?? 'HEAD'}).`)

		const localLatest = await git(targetDirectory).revparse(tag ?? 'HEAD')
		debug.resolve(`Local latest commit: ${localLatest} (${tag ?? 'HEAD'}).`)

		// If it doesn't match, remove the target directory - unless we don't want to use the cache
		if (useCache && remoteLatest === localLatest) {
			debug.resolve('Local repository is up-to-date, skipping cloning.')

			return targetDirectory
		}

		debug.resolve(
			!useCache
				? '--no-cache has been used, removing directory and cloning again.'
				: 'Local repository is outdated, removing directory and cloning again.',
		)

		await fs.promises.rm(targetDirectory, { recursive: true, force: true })
	}

	// Clones the repository
	debug.resolve(`Cloning ${repositoryUrl} with${cloneWithSsh ? '' : 'out'} SSH into ${targetDirectory}.`)

	// TODO: mock simple-git
	if (process.env.VITEST) {
		throw new Error('Cloning repositories is not allowed in tests.')
	}

	await git()
		.clone(repositoryUrl, targetDirectory, {
			'--depth': 1,
			...(tag && { '--branch': tag }),
		})

	return path.resolve(targetDirectory, preset.path)
}
