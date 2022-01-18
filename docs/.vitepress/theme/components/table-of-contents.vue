<script setup lang="ts">
import { useRoute } from 'vitepress'
import { computed } from 'vue'

const route = useRoute()
const headers = computed(() => route.data.headers.map((header) => ({
	text: header.title,
	slug: header.slug,
	level: header.level,
	link: `#${header.slug}`,
})))
</script>

<template>
	<ul v-if="headers?.length > 0" class="py-4 pl-4">
		<li>
			<SidebarLinkItem
				:item="{ text: 'On this page' }"
				class="px-2"
				:header="true"
			/>
			<ul class="mb-2 flex flex-col">
				<li v-for="child in headers" :key="child.text" class="flex">
					<SidebarLinkItem :item="child" :table="true" :level="child.level" />
				</li>
			</ul>
		</li>
	</ul>
</template>
