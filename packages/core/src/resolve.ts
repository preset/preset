import fs from 'fs'
import path from 'path'
import tmp from 'temp-dir'
import git from 'simple-git'
import type { LocalDirectoryPreset, RepositoryPreset, ApplyOptions, LocalFilePreset } from './types'
import { debug, invoke } from './utils'

/**
 * Resolves the preset and returns its path.
 */
export async function resolvePreset(options: ApplyOptions) {
	// Parses the resolvable string into an object representing a directory or a repository.
	const resolved = await parseResolvable(options.resolvable)

	// If we already have a file path, returns it.
	if (resolved.type === 'file') {
		return resolved.path
	}

	// If it's a repository, clone it and resolve the preset file.
	if (resolved.type === 'repository') {
		return resolvePresetFile(await cloneRepository(resolved, options))
	}

	// Otherwise, just resolve the preset file.
	return resolvePresetFile(resolved.path)
}

/**
 * Parses the given resolvable.
 */
export async function parseResolvable(resolvable: string): Promise<LocalDirectoryPreset | RepositoryPreset | LocalFilePreset> {
	debug.resolve('Working directory:', process.cwd())
	debug.resolve('Parsing resolvable:', resolvable)
	const resolved = await resolveLocalFile(resolvable) || await resolveLocalDirectory(resolvable) || await resolveGitHubRepository(resolvable)

	if (!resolved) {
		throw new Error(`Could not resolve ${resolvable} as a local file, local directory or a repository.`)
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
export async function resolveGitHubRepository(resolvable: string): Promise<RepositoryPreset | false> {
	debug.resolve('Trying to resolve as a GitHub repository.')

	const regexes = [
		/^([a-zA-Z][\w-]+)\/([a-zA-Z][\w-]+)(?:@([\w-\.]+))?$/,
		/^git@github\.com:([a-zA-Z][\w-]+)\/([a-zA-Z][\w-]+)(?:\.git)?(?:@([\w-\.]+))?$/,
		/^https?:\/\/(?:www\.)?github\.com\/([a-zA-Z][\w-]+)\/([a-zA-Z][\w-]+)(?:\.git)?(?:@([\w-\.]+))?/,
	]

	const repository = regexes
		.map((regex) => {
			const [matches, organization, repository, tag] = resolvable.match(regex) ?? []

			if (!matches) {
				return false
			}

			const result: RepositoryPreset = {
				type: 'repository',
				organization,
				repository,
				tag,
				ssh: !resolvable.includes('http'),
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
export async function resolveLocalDirectory(resolvable: string): Promise<LocalDirectoryPreset | false> {
	debug.resolve('Trying to resolve as a local directory.')

	try {
		if ((fs.statSync(resolvable)).isDirectory()) {
			debug.resolve('Successfully resolved as a local directory.')

			return {
				type: 'directory',
				path: path.resolve(resolvable),
			}
		}
	} catch {}

	return false
}

/**
 * Resolves a local file.
 */
export async function resolveLocalFile(resolvable: string): Promise<LocalFilePreset | false> {
	debug.resolve('Trying to resolve as a local file.')

	try {
		if ((fs.statSync(resolvable)).isFile()) {
			debug.resolve('Successfully resolved as a local file.')

			return {
				type: 'file',
				path: path.resolve(resolvable),
			}
		}
	} catch {}

	return false
}

/**
 * Resolves the preset file in the given directory.
 *
 * @param directory Absolute path to the directory in which to find the preset file.
 */
export async function resolvePresetFile(directory: string) {
	debug.resolve(`Resolving preset file in "${directory}".`)

	const pkg = invoke(() => {
		try {
			return JSON.parse(fs.readFileSync(path.resolve(directory, 'package.json')) as any)
		} catch (error) {}

		return false
	})

	const ensureFile = async(file?: string) => {
		if (!file) {
			return null
		}

		try {
			const filepath = path.resolve(directory, file)
			if ((fs.statSync(filepath)).isFile()) {
				return filepath
			}
		} catch { }

		return null
	}

	const filepath = await ensureFile(pkg?.preset) ?? await ensureFile('preset.ts') ?? await ensureFile('src/preset.ts')

	if (!filepath) {
		throw new Error(`Could not find a preset file in "${directory}".`)
	}

	return filepath
}

/**
 * Clones the repository to the disk.
 */
export async function cloneRepository(preset: RepositoryPreset, options: ApplyOptions) {
	const targetDirectory = path.resolve(tmp, 'presets', preset.repository)
	const useCache = options?.commandLine?.cache === undefined ? true : options?.commandLine?.cache
	const cloneWithSsh = options?.commandLine?.ssh === undefined ? preset.ssh : options.commandLine.ssh
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

	await git()
		.clone(repositoryUrl, targetDirectory, {
			'--depth': 1,
			...(preset.tag && { '--branch': preset.tag }),
		})

	return targetDirectory
}
