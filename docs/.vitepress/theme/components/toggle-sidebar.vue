<script setup lang="ts">
// @ts-ignore
import { openSideBar } from '@/logic/sidebar'
</script>

<template>
  <IconButton @click="openSideBar = true">
    <heroicons-outline-menu-alt-2 />
  </IconButton>
</template>
