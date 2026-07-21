# BasicForm

`BasicForm` 是基于 Element Plus `el-form` 的 Schema 表单封装，支持统一字段渲染、校验、重置、回填和自定义插槽。

```vue
<script setup lang="ts">
import { reactive } from 'vue'
import BasicForm, { type BasicFormField } from '@/components/BasicForm'

const model = reactive({ name: '', status: 'enabled' })
const schema: BasicFormField[] = [
  { field: 'name', label: '名称', type: 'input' },
  {
    field: 'status',
    label: '状态',
    type: 'select',
    options: [
      { label: '启用', value: 'enabled' },
      { label: '禁用', value: 'disabled' },
    ],
  },
]
</script>

<template>
  <BasicForm :model="model" :schema="schema" @submit="save" />
</template>
```

支持的内置字段类型包括：`input`、`textarea`、`password`、`number`、`select`、`radio`、`checkbox`、`switch`、`date`、`datetime`、`date-range`、`time` 和 `cascader`。

字段的 `props` 会传递给底层 Element Plus 组件；复杂场景可使用与 `field` 名称相同的插槽，插槽参数包含 `field`、`model`、`value` 和 `updateValue`。

实例方法：`validate`、`submit`、`validateField`、`resetFields`、`clearValidate` 和 `scrollToField`。
