<script setup lang="ts">
import { useData } from 'vitepress'
import { useRepo } from '@/logic/repository'

const { theme } = useData()
const repo = useRepo()
</script>

<template>
	<header class="d-header">
		<div class="flex flex-none h-full container !max-w-screen-2xl mx-auto px-2 md:px-6">
			<div class="flex items-center lg:hidden">
				<ToggleSidebar />
			</div>
			<div class="flex items-center flex-1 lg:flex-none">
				<AppLogo />
			</div>
			<div class="flex items-center order-last ml-2 lg:(order-none flex-1 ml-4) xl:ml-10">
				<span v-if="!theme.algolia?.appId" />
				<AlgoliaSearchBox v-else :options="theme.algolia" />
			</div>
			<div class="hidden lg:flex items-center justify-end flex-1">
				<DropdownMenu />
			</div>
			<div class="flex items-center lg:space-x-3 lg:pl-3 xl:pl-6">
				<IconButton class="hidden lg:inline-flex hover:text-blue-300 transition" href="https://twitter.com/enzoinnocenzi">
					<uil:twitter-alt />
				</IconButton>
				<IconButton class="hidden lg:inline-flex hover:text-gray-400 transition" :href="repo?.link">
					<uil:github-alt />
				</IconButton>
				<ToggleDark />
			</div>
		</div>
	</header>
</template>

<style scoped lang="postcss">
.d-header {
  @apply
    fixed top-0 inset-x-0 z-50
    bg-$docs-bg
    flex items-center
    border-b border-$docs-bc;
  height: var(--header-height);
}
</style>
