export interface Renderer {
	name: string
	registerEvents: () => void
}

export function makeRenderer(renderer: Renderer) {
	return renderer
}
