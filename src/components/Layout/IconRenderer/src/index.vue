<script setup lang="ts">
import { House, Odometer, Setting, User, Collection, CopyDocument, Grid } from '@element-plus/icons-vue'
import { computed, type Component } from 'vue'

defineOptions({ name: 'IconRenderer' })
const props = defineProps<{ name?: string }>()

const icons: Record<string, Component> = { House, Odometer, Setting, User, Collection, CopyDocument, Grid }
const iconComponent = computed(() => (props.name ? icons[props.name] : undefined))
</script>

<template>
  <component :is="iconComponent" v-if="iconComponent" />
</template>
