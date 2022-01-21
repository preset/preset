<script setup lang="ts">
import page from './page.vue'
</script>

<template>
	<div class="relative antialiased">
		<keep-alive>
			<component :is="page" />
		</keep-alive>
	</div>
</template>
