<script setup lang="ts">
import TableOfContents from '@/components/table-of-contents.vue'
</script>

<template>
	<aside class="hidden lg:block">
		<div class="sticky top-$header-height h-$full-header overflow-y-auto">
			<TableOfContents />
		</div>
	</aside>
</template>
