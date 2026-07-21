<script setup lang="ts">
import type { FormInstance, FormItemRule } from 'element-plus'
import { nextTick, ref, toRef } from 'vue'

import BasicFormField from './BasicFormField.vue'
import type {
  BasicFormExpose,
  BasicFormField as BasicFormFieldSchema,
  BasicFormModel,
  BasicFormProps,
} from './types'

defineOptions({ name: 'BasicForm' })

const props = withDefaults(defineProps<BasicFormProps>(), {
  schema: () => [],
  rules: () => ({}),
  formProps: () => ({}),
  labelWidth: '100px',
  labelPosition: 'right',
  inline: false,
  disabled: false,
  showMessage: true,
  statusIcon: false,
  validateOnRuleChange: true,
  scrollToError: true,
})

const emit = defineEmits<{
  submit: [model: BasicFormModel]
  validate: [prop: string | undefined, isValid: boolean, message: string]
}>()

const formRef = ref<FormInstance>()
const model = toRef(props, 'model')

function getValue(field: string): unknown {
  return field.split('.').reduce<unknown>((current, key) => {
    if (typeof current !== 'object' || current === null) return undefined
    return (current as Record<string, unknown>)[key]
  }, model.value)
}

function setValue(field: string, value: unknown): void {
  const parts = field.split('.')
  const last = parts.pop()
  if (!last) return

  let target: Record<string, unknown> = model.value as Record<string, unknown>
  parts.forEach((part) => {
    const next = target[part]
    if (typeof next !== 'object' || next === null) target[part] = {}
    target = target[part] as Record<string, unknown>
  })
  target[last] = value
}

function getRules(field: string): FormItemRule | FormItemRule[] | undefined {
  return props.rules?.[field]
}

function handleValidate(prop: string | undefined, isValid: boolean, message: string): void {
  emit('validate', prop, isValid, message)
}

async function validate(): Promise<boolean> {
  if (!formRef.value) return false
  return new Promise((resolve) => {
    void formRef.value?.validate((valid) => {
      resolve(Boolean(valid))
    })
  })
}

async function submit(): Promise<boolean> {
  const valid = await validate()
  if (valid) emit('submit', model.value)
  return valid
}

async function validateField(propsToValidate?: string | string[]): Promise<boolean> {
  if (!formRef.value) return false
  return new Promise((resolve) => {
    void formRef.value?.validateField(propsToValidate, (valid) => resolve(Boolean(valid)))
  })
}

function resetFields(propsToReset?: string | string[]): void {
  formRef.value?.resetFields(propsToReset)
}

function clearValidate(propsToClear?: string | string[]): void {
  formRef.value?.clearValidate(propsToClear)
}

async function scrollToField(prop: string): Promise<void> {
  await nextTick()
  formRef.value?.scrollToField(prop)
}

defineExpose<BasicFormExpose>({
  formRef,
  validate,
  submit,
  validateField,
  resetFields,
  clearValidate,
  scrollToField,
})
</script>

<template>
  <el-form
    ref="formRef"
    class="basic-form"
    :model="model"
    :rules="rules"
    :label-width="labelWidth"
    :label-position="labelPosition"
    :inline="inline"
    :disabled="disabled"
    :show-message="showMessage"
    :status-icon="statusIcon"
    :validate-on-rule-change="validateOnRuleChange"
    :scroll-to-error="scrollToError"
    v-bind="formProps"
    @submit.prevent="submit"
    @validate="handleValidate"
  >
    <BasicFormField
      v-for="field in schema"
      :key="field.field"
      :field="field as BasicFormFieldSchema"
      :model="model as BasicFormModel"
      :model-value="getValue(field.field)"
      :disabled="disabled"
      :rules="getRules(field.field)"
      @update:model-value="setValue(field.field, $event)"
    >
      <template v-if="$slots[field.slot ?? field.field]" #default="scope">
        <slot :name="field.slot ?? field.field" v-bind="scope">
          <span v-if="field.type === 'slot'">{{ getValue(field.field) }}</span>
        </slot>
      </template>
    </BasicFormField>

    <div v-if="$slots.footer" class="basic-form__footer">
      <slot name="footer" :model="model" :form="formRef" />
    </div>
  </el-form>
</template>

<style scoped>
.basic-form__footer {
  display: flex;
  gap: 8px;
  align-items: center;
}

.basic-form:not(.el-form--inline) .basic-form__footer {
  justify-content: flex-end;
}
</style>
