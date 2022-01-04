export interface Reporter {
	name: string
	registerEvents: () => void
}

export function makeReporter(renderer: Reporter) {
	return renderer
}
