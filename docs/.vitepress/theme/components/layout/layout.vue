<script setup lang="ts">
import { useData } from 'vitepress'
import home from './home.vue'
import page from './page.vue'

const { frontmatter } = useData()
</script>

<template>
	<div class="relative antialiased">
		<keep-alive>
			<component :is="frontmatter.home ? home : page" />
		</keep-alive>
	</div>
</template>
