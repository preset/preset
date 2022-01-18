<script setup lang="ts">
import { useSideBar } from '@/logic/sidebar'

const items = useSideBar()
</script>

<template>
	<nav>
		<ul v-if="items.length > 0" class="py-4 px-4">
			<template v-for="item of items" :key="item.text">
				<SidebarLink :item="item" :max-depth="2" />
			</template>
		</ul>
	</nav>
</template>
