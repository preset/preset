declare module '*.vue' {
	import type { DefineComponent } from 'vue'
	const component: DefineComponent<{}, {}, any>
	export default component
}

declare module '@docsearch/js' {
	import type { DocSearchProps as DocSearchComponentProps } from '@docsearch/react'
	interface DocSearchProps extends DocSearchComponentProps {
		container: string | HTMLElement
		environment?: typeof window
	}
	export default function docsearch(props: DocSearchProps): void
}
