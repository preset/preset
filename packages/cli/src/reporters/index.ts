import debugReporter from './debug'
import listReporter from './list'

export const reporters = {
	list: listReporter,
	debug: debugReporter,
}
