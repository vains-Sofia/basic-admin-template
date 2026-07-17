<script setup lang="ts">
import { Close } from '@element-plus/icons-vue'
import { useRoute, useRouter } from 'vue-router'

import { DEFAULT_ROUTE } from '@/config/app'
import { useTagsViewStore } from '@/stores/tags-view'

defineOptions({ name: 'TagsView' })
const route = useRoute()
const router = useRouter()
const tagsStore = useTagsViewStore()

function closeTag(name: string): void {
  const index = tagsStore.tags.findIndex((tag) => tag.name === name)
  const isActive = String(route.name) === name
  tagsStore.remove(name)

  if (isActive) {
    const target = tagsStore.tags[index] ?? tagsStore.tags[index - 1]
    void router.push(target?.path ?? DEFAULT_ROUTE)
  }
}
</script>

<template>
  <div class="tags-view">
    <el-scrollbar>
      <div class="tags-view__list">
        <button
          v-for="tag in tagsStore.tags"
          :key="tag.name"
          :class="['tags-view__item', { 'is-active': route.name === tag.name }]"
          type="button"
          @click="router.push(tag.path)"
        >
          <span>{{ tag.title }}</span>
          <el-icon v-if="!tag.affix" class="tags-view__close" @click.stop="closeTag(tag.name)">
            <Close />
          </el-icon>
        </button>
      </div>
    </el-scrollbar>
  </div>
</template>

<style scoped>
.tags-view {
  height: var(--app-tags-height);
  border-bottom: 1px solid var(--el-border-color-light);
  background: var(--el-bg-color);
}

.tags-view__list {
  display: flex;
  height: var(--app-tags-height);
  align-items: center;
  gap: 6px;
  padding: 0 12px;
  white-space: nowrap;
}

.tags-view__item {
  display: inline-flex;
  height: 28px;
  align-items: center;
  gap: 6px;
  padding: 0 10px;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  color: var(--el-text-color-regular);
  background: var(--el-bg-color);
  cursor: pointer;
}

.tags-view__item.is-active {
  border-color: var(--el-color-primary-light-5);
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.tags-view__close {
  border-radius: 50%;
}

.tags-view__close:hover {
  color: var(--el-color-white);
  background: var(--el-text-color-secondary);
}
</style>
