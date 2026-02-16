// https://github.com/vitest-dev/vitest/blob/f2caced25fb0c5ac33368a8a64329467b796089e/packages/vitest/src/reporters/renderers/figures.ts
import c from 'chalk'

export const format = {
	indent: (indent: number) => `${'  '.repeat(indent)}  `,
	dim: (text?: any) => c.gray(text),
	highlight: (text?: any) => c.bold(`${text}`),
	titleWorking: (text?: any) => c.bgYellowBright.white.bold(`${text}`),
	titleFail: (text?: any) => c.bgRed.white.bold(`${text}`),
	titleSuccess: (text?: any) => c.bgGreen.white.bold(`${text}`),
	titleNextSteps: (text?: any) => c.bgMagenta.white.bold(`${text}`),
	titleWarning: (text?: any) => c.bgYellow.white.bold(`${text}`),
	promptHint: (text?: any) => c.bold.gray(`${text}`),
	selectedChoice: (text?: any) => c.cyan.underline(`${text}`),
	textPromptResponse: (text?: any) => c.gray.bold(`${text}`),
}
