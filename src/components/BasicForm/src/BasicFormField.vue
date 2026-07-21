<script setup lang="ts">
import type { FormItemRule } from 'element-plus'
import { computed } from 'vue'

import type { BasicFormField, BasicFormModel } from './types'

defineOptions({ name: 'BasicFormField' })

const props = defineProps<{
  field: BasicFormField
  model: BasicFormModel
  modelValue: unknown
  disabled?: boolean
  rules?: FormItemRule | FormItemRule[]
}>()

const emit = defineEmits<{ 'update:modelValue': [value: unknown] }>()

const hidden = computed(() =>
  typeof props.field.hidden === 'function'
    ? props.field.hidden(props.model)
    : Boolean(props.field.hidden),
)
const disabled = computed(() =>
  props.disabled ||
  (typeof props.field.disabled === 'function'
    ? props.field.disabled(props.model)
    : Boolean(props.field.disabled)),
)
const controlProps = computed(() => ({
  ...(props.field.props ?? {}),
  disabled: disabled.value,
}))
const resolvedType = computed(() => props.field.type ?? (props.field.component ? 'slot' : 'input'))
const isRange = computed(() => resolvedType.value === 'date-range')
const value = computed(() => props.modelValue)

function updateValue(nextValue: unknown): void {
  emit('update:modelValue', nextValue)
}
</script>

<template>
  <el-form-item
    v-if="!hidden"
    :label="field.label"
    :prop="field.field"
    :rules="rules ?? field.rules"
  >
    <slot :field="field" :model="model" :value="value" :update-value="updateValue">
      <el-input
        v-if="resolvedType === 'input' || resolvedType === 'textarea' || resolvedType === 'password'"
        :model-value="value"
        v-bind="controlProps"
        :type="resolvedType === 'textarea' ? 'textarea' : resolvedType === 'password' ? 'password' : undefined"
        @update:model-value="updateValue"
      />

      <el-input-number
        v-else-if="resolvedType === 'number'"
        :model-value="typeof value === 'number' ? value : undefined"
        v-bind="controlProps"
        @update:model-value="updateValue"
      />

      <el-select
        v-else-if="resolvedType === 'select'"
        :model-value="value"
        v-bind="controlProps"
        @update:model-value="updateValue"
      >
        <el-option
          v-for="option in field.options ?? []"
          :key="String(option.value)"
          :label="option.label"
          :value="option.value"
          :disabled="option.disabled"
        />
      </el-select>

      <el-radio-group
        v-else-if="resolvedType === 'radio'"
        :model-value="value"
        v-bind="controlProps"
        @update:model-value="updateValue"
      >
        <el-radio
          v-for="option in field.options ?? []"
          :key="String(option.value)"
          :label="option.value"
          :disabled="option.disabled"
        >
          {{ option.label }}
        </el-radio>
      </el-radio-group>

      <el-checkbox-group
        v-else-if="resolvedType === 'checkbox'"
        :model-value="value"
        v-bind="controlProps"
        @update:model-value="updateValue"
      >
        <el-checkbox
          v-for="option in field.options ?? []"
          :key="String(option.value)"
          :label="option.value"
          :disabled="option.disabled"
        >
          {{ option.label }}
        </el-checkbox>
      </el-checkbox-group>

      <el-switch
        v-else-if="resolvedType === 'switch'"
        :model-value="value"
        v-bind="controlProps"
        @update:model-value="updateValue"
      />

      <el-date-picker
        v-else-if="resolvedType === 'date' || resolvedType === 'datetime' || isRange"
        :model-value="value"
        v-bind="controlProps"
        :type="isRange ? 'daterange' : resolvedType === 'datetime' ? 'datetime' : 'date'"
        @update:model-value="updateValue"
      />

      <el-time-picker
        v-else-if="resolvedType === 'time'"
        :model-value="value"
        v-bind="controlProps"
        @update:model-value="updateValue"
      />

      <el-cascader
        v-else-if="resolvedType === 'cascader'"
        :model-value="value"
        v-bind="controlProps"
        :options="field.options"
        @update:model-value="updateValue"
      />

      <component
        :is="field.component"
        v-else-if="field.component"
        :model-value="value"
        v-bind="controlProps"
        @update:model-value="updateValue"
      />
    </slot>
  </el-form-item>
</template>
