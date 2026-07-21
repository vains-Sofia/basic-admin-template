<script setup lang="ts">
import { Search, Refresh, ArrowDown, ArrowUp } from '@element-plus/icons-vue'
import { computed, ref, useSlots, watch } from 'vue'

import BasicForm from '@/components/BasicForm'
import type { BasicFormExpose, BasicFormModel } from '@/components/BasicForm'

import type { BasicSearchFormProps } from './types'

defineOptions({ name: 'BasicSearchForm' })

const props = withDefaults(defineProps<BasicSearchFormProps>(), {
  schema: () => [],
  rules: () => ({}),
  formProps: () => ({}),
  labelWidth: '82px',
  labelPosition: 'right',
  collapseThreshold: 3,
  expanded: false,
  showExpand: true,
  showSearch: true,
  showReset: true,
  searchText: '查询',
  resetText: '重置',
  expandText: '展开',
  collapseText: '收起',
  loading: false,
  searchOnReset: true,
})

const emit = defineEmits<{
  search: [model: BasicFormModel]
  reset: [model: BasicFormModel]
  expand: [expanded: boolean]
  validate: [prop: string | undefined, isValid: boolean, message: string]
}>()

const slots = useSlots()
const formRef = ref<BasicFormExpose>()
const expandedState = ref(props.expanded)
const hasMoreFields = computed(() => props.schema.length > props.collapseThreshold)
const isExpanded = computed(() => expandedState.value || !hasMoreFields.value)
const visibleSchema = computed(() =>
  isExpanded.value ? props.schema : props.schema.slice(0, props.collapseThreshold),
)
const forwardedSlots = computed(() => slots)

watch(
  () => props.expanded,
  (expanded) => {
    expandedState.value = expanded
  },
)

function toggleExpanded(): void {
  expandedState.value = !expandedState.value
  emit('expand', expandedState.value)
}

function handleFormSubmit(model: BasicFormModel): void {
  emit('search', model)
}

function handleValidate(prop: string | undefined, isValid: boolean, message: string): void {
  emit('validate', prop, isValid, message)
}

async function reset(): Promise<void> {
  formRef.value?.resetFields()
  emit('reset', props.model)
  if (props.searchOnReset) emit('search', props.model)
}

async function search(): Promise<boolean> {
  const valid = (await formRef.value?.validate()) ?? false
  if (valid) {
    emit('search', props.model)
  }
  return valid
}

defineExpose({ formRef, search, reset, toggleExpanded })
</script>

<template>
  <div class="basic-search-form">
    <BasicForm
      ref="formRef"
      :model="model"
      :schema="visibleSchema"
      :rules="rules"
      :form-props="formProps"
      :label-width="labelWidth"
      :label-position="labelPosition"
      inline
      :disabled="disabled"
      :show-message="showMessage"
      :status-icon="statusIcon"
      :validate-on-rule-change="validateOnRuleChange"
      :scroll-to-error="scrollToError"
      @submit="handleFormSubmit"
      @validate="handleValidate"
      v-slots="forwardedSlots"
    />

    <div class="basic-search-form__actions">
      <el-button v-if="showSearch" type="primary" :icon="Search" :loading="loading" native-type="submit" @click="search">
        {{ searchText }}
      </el-button>
      <el-button v-if="showReset" :icon="Refresh" :disabled="loading" @click="reset">
        {{ resetText }}
      </el-button>
      <el-button
        v-if="showExpand && hasMoreFields"
        text
        :icon="isExpanded ? ArrowUp : ArrowDown"
        @click="toggleExpanded"
      >
        {{ isExpanded ? collapseText : expandText }}
      </el-button>
      <slot name="actions" :expanded="isExpanded" />
    </div>
  </div>
</template>

<style scoped>
.basic-search-form {
  display: flex;
  min-width: 0;
  align-items: flex-start;
  gap: 8px;
}

.basic-search-form :deep(.basic-form) {
  min-width: 0;
  flex: 1;
}

.basic-search-form__actions {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 8px;
  padding-top: 1px;
}

@media (max-width: 767px) {
  .basic-search-form {
    display: block;
  }

  .basic-search-form__actions {
    flex-wrap: wrap;
    margin-top: 4px;
  }
}
</style>
