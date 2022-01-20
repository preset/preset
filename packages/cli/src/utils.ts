import c from 'chalk'

export function time(start: number, end: number) {
	const time = end - start

	if (time > 1000) {
		return `${(time / 1000).toFixed(2)}s`
	}

	return `${Math.round(time)}ms`
}

interface Part {
	excludeWhenEmpty?: boolean
	count: number
	text: string
	color: (text: string) => string
}

export function formatResult(...parts: Part[]) {
	const text = parts
		.filter((part) => part.count > 0 || !part.excludeWhenEmpty)
		.map((part) => part.color(`${part.count} ${part.text}`))
		.join(' | ')
	const count = parts.reduce((total, { count }) => total + count, 0)

	return `${text} ${c.gray(`(${count})`)}`
}

export async function invoke(fn: Function, handleError: (error: Error) => void) {
	try {
		return await fn()
	} catch (error) {
		handleError(error as Error)
	}
}
