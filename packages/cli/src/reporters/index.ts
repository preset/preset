import listReporter from './list'
import debugReporter from './debug'
import nullReporter from './null'

export const reporters = {
	list: listReporter,
	debug: debugReporter,
	null: nullReporter,
}
