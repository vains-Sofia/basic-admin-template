<script setup lang="ts">
import type { RouteRecordRaw } from 'vue-router'
import { useRouter } from 'vue-router'

import IconRenderer from '@/components/Layout/IconRenderer'

defineOptions({ name: 'SidebarMenu' })
defineProps<{ routes: RouteRecordRaw[] }>()

const router = useRouter()
const visibleChildren = (route: RouteRecordRaw) =>
  route.children?.filter((child) => !child.meta?.hidden) ?? []
const routePath = (route: RouteRecordRaw) =>
  route.name ? router.resolve({ name: route.name }).path : route.path
</script>

<template>
  <template v-for="item in routes" :key="String(item.name ?? item.path)">
    <el-sub-menu v-if="!item.meta?.hidden && visibleChildren(item).length" :index="routePath(item)">
      <template #title>
        <el-icon v-if="item.meta?.icon"><IconRenderer :name="item.meta.icon" /></el-icon>
        <span>{{ item.meta?.title }}</span>
      </template>
      <SidebarMenu :routes="visibleChildren(item)" />
    </el-sub-menu>

    <el-menu-item v-else-if="!item.meta?.hidden" :index="routePath(item)">
      <el-icon v-if="item.meta?.icon"><IconRenderer :name="item.meta.icon" /></el-icon>
      <template #title>{{ item.meta?.title }}</template>
    </el-menu-item>
  </template>
</template>
