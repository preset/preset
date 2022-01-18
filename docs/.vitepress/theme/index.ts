import 'virtual:windi.css'

import './style/vars.css'
import './style/all.css'
import './style/scrollbar.css'
import './style/markdown.css'
import './style/codemirror-prism-vars.css'

import type { Theme } from 'vitepress'
import Layout from './Layout.vue'
import NotFound from './NotFound.vue'

export default <Theme> {
	Layout,
	NotFound,
}
