<script setup lang="ts">
import { Close, CloseBold, DArrowLeft, DArrowRight, Minus } from '@element-plus/icons-vue'
import type { DropdownInstance } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'

import { DEFAULT_ROUTE } from '@/config/app'
import { useTagsViewStore } from '@/stores/tags-view'

defineOptions({ name: 'TagsView' })
const route = useRoute()
const router = useRouter()
const tagsStore = useTagsViewStore()
const dropdownInstances = new Map<string, DropdownInstance>()

type ContextCommand = 'close' | 'close-left' | 'close-right' | 'close-others' | 'close-all'

function setDropdownInstance(name: string, instance: unknown): void {
  if (instance) dropdownInstances.set(name, instance as DropdownInstance)
  else dropdownInstances.delete(name)
}

function closeOtherDropdowns(name: string): void {
  dropdownInstances.forEach((instance, instanceName) => {
    if (instanceName !== name) instance.handleClose()
  })
}

function removeTags(names: string[], preferredName?: string): void {
  const currentName = String(route.name ?? '')
  const currentIndex = tagsStore.tags.findIndex((tag) => tag.name === currentName)
  const currentWillClose = names.includes(currentName)
  names.forEach((name) => tagsStore.remove(name))

  if (!currentWillClose) return

  const target =
    tagsStore.tags.find((tag) => tag.name === preferredName) ??
    tagsStore.tags[Math.min(currentIndex, tagsStore.tags.length - 1)]
  void router.push(target?.path ?? DEFAULT_ROUTE)
}

function closeTag(name: string): void {
  const index = tagsStore.tags.findIndex((tag) => tag.name === name)
  const target = tagsStore.tags[index + 1] ?? tagsStore.tags[index - 1]
  removeTags([name], target?.name)
}

function getRemovableNames(command: ContextCommand, tagName: string): string[] {
  const index = tagsStore.tags.findIndex((tag) => tag.name === tagName)
  if (index < 0) return []

  const target = tagsStore.tags[index]
  if (!target) return []

  if (command === 'close') return target.affix ? [] : [tagName]

  const candidates =
    command === 'close-left'
      ? tagsStore.tags.slice(0, index)
      : command === 'close-right'
        ? tagsStore.tags.slice(index + 1)
        : command === 'close-others'
          ? tagsStore.tags.filter((tag) => tag.name !== tagName)
          : tagsStore.tags

  return candidates.filter((tag) => !tag.affix).map((tag) => tag.name)
}

function handleContextCommand(command: ContextCommand, tagName: string): void {
  const names = getRemovableNames(command, tagName)
  if (!names.length) return
  removeTags(names, tagName)
}
</script>

<template>
  <div class="tags-view">
    <el-scrollbar>
      <div class="tags-view__list">
        <el-dropdown
          v-for="tag in tagsStore.tags"
          :ref="(instance: unknown) => setDropdownInstance(tag.name, instance)"
          :key="tag.name"
          class="tags-view__dropdown"
          trigger="contextmenu"
          placement="bottom-start"
          :hide-on-click="true"
          @command="handleContextCommand($event as ContextCommand, tag.name)"
        >
          <button
            :class="['tags-view__item', { 'is-active': route.name === tag.name }]"
            type="button"
            @click="router.push(tag.path)"
            @contextmenu="closeOtherDropdowns(tag.name)"
          >
            <span class="tags-view__title">{{ tag.title }}</span>
            <el-icon
              v-if="!tag.affix"
              class="tags-view__close"
              :aria-label="`关闭${tag.title}`"
              @click.stop="closeTag(tag.name)"
            >
              <Close />
            </el-icon>
          </button>
          <template #dropdown>
            <el-dropdown-menu class="tags-view__menu">
              <el-dropdown-item command="close" :disabled="tag.affix" :icon="Close">
                关闭当前
              </el-dropdown-item>
              <el-dropdown-item
                command="close-left"
                :disabled="!getRemovableNames('close-left', tag.name).length"
                :icon="DArrowLeft"
              >
                关闭左侧
              </el-dropdown-item>
              <el-dropdown-item
                command="close-right"
                :disabled="!getRemovableNames('close-right', tag.name).length"
                :icon="DArrowRight"
              >
                关闭右侧
              </el-dropdown-item>
              <el-dropdown-item
                command="close-others"
                :disabled="!getRemovableNames('close-others', tag.name).length"
                :icon="Minus"
              >
                关闭其他
              </el-dropdown-item>
              <el-dropdown-item
                command="close-all"
                :disabled="!getRemovableNames('close-all', tag.name).length"
                :icon="CloseBold"
              >
                关闭全部
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-scrollbar>
  </div>
</template>

<style scoped>
.tags-view {
  position: relative;
  z-index: 5;
  height: var(--app-tags-height);
  border-bottom: 1px solid var(--el-border-color-light);
  background: var(--el-bg-color);
}

.tags-view__list {
  display: flex;
  height: var(--app-tags-height);
  align-items: center;
  gap: 2px;
  padding: 0 8px;
  white-space: nowrap;
}

.tags-view__dropdown {
  display: inline-flex;
  height: 32px;
  flex: 0 0 auto;
  min-width: 0;
  vertical-align: middle;
}

.tags-view__item {
  display: inline-flex;
  position: relative;
  height: 32px;
  max-width: 208px;
  align-items: center;
  gap: 6px;
  padding: 0 11px;
  border: 0;
  border-radius: 4px;
  color: var(--el-text-color-secondary);
  background: transparent;
  cursor: pointer;
  transition:
    color 0.2s,
    background-color 0.2s;
}

.tags-view__item:hover {
  color: var(--el-text-color-primary);
  background: var(--el-fill-color-light);
}

.tags-view__item.is-active {
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  font-weight: 500;
}

.tags-view__item.is-active::after {
  position: absolute;
  right: 8px;
  bottom: -4px;
  left: 8px;
  height: 2px;
  border-radius: 2px 2px 0 0;
  background: var(--el-color-primary);
  content: '';
}

.tags-view__title {
  overflow: hidden;
  text-overflow: ellipsis;
}

.tags-view__close {
  width: 16px;
  height: 16px;
  flex: 0 0 16px;
  border-radius: 50%;
  opacity: 0;
  transition:
    color 0.2s,
    background-color 0.2s,
    opacity 0.2s;
}

.tags-view__item:hover .tags-view__close,
.tags-view__item.is-active .tags-view__close {
  opacity: 1;
}

.tags-view__close:hover {
  color: var(--el-color-white);
  background: var(--el-color-primary);
}

:global(.tags-view__menu) {
  min-width: 148px;
  padding: 4px;
}

:global(.tags-view__menu .el-dropdown-menu__item) {
  gap: 8px;
  min-height: 32px;
  border-radius: 3px;
}

@media (max-width: 767px) {
  .tags-view__list {
    padding: 0 6px;
  }

  .tags-view__item {
    max-width: 168px;
    padding: 0 9px;
  }

  .tags-view__item .tags-view__close {
    opacity: 1;
  }
}
</style>
