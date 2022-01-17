<script setup lang="ts">
import type { DefaultTheme } from 'vitepress'
import { toRefs } from 'vue'
import { useNavLink } from '@/logic/nav-link'

const props = defineProps<{
  item: DefaultTheme.NavItemWithLink
  dropdown?: boolean
}>()
const propsRefs = toRefs(props)
const { props: linkProps } = useNavLink(propsRefs.item, props.dropdown) as any
</script>

<template>
  <a
    class="p-2 inline-flex items-center transition duration-50"
    :class="{ 'whitespace-nowrap font-base hover:(text-primary bg-$docs-hover-bg) rounded w-full text-sm': dropdown }"
    v-bind="linkProps"
  >
    {{ item.text }}
  </a>
</template>
