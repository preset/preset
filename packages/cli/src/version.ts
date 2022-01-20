import { emitter, LocalPreset } from '@preset/core'
import semver from 'semver'
import checkUpdates, { UpdateInfo } from 'update-notifier'
import pkg from '../../core/package.json'

interface VersionCheck {
	current: string
	updates?: UpdateInfo
	versionMismatches: Array<LocalPreset & { isOutdated: boolean }>
}

export const checks: VersionCheck = {
	current: pkg.version,
	versionMismatches: [],
}

export function registerVersionMismatches() {
	// On preset resolve, ensures it's up to date
	emitter.on('preset:resolve', (preset) => {
		if (!preset.presetVersion) {
			return
		}

		if (!semver.satisfies(checks.current, preset.presetVersion)) {
			const requiredVersion = semver.coerce(preset.presetVersion)?.version

			checks.versionMismatches.push({
				...preset,
				isOutdated: requiredVersion ? semver.lt(requiredVersion, checks.current) : false,
			})
		}
	})
}

export async function checkLatestVersion() {
	// Fetch latest version for next time
	const notifier = checkUpdates({
		pkg: {
			name: pkg.name,
			version: pkg.version,
		},
		updateCheckInterval: 1000 * 60 * 60 * 1, // 1 hour
	})

	checks.updates = notifier.update
}
