<script setup lang="ts">
import { Refresh, Check } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { reactive, ref } from 'vue'

import BasicForm, {
  type BasicFormExpose,
  type BasicFormField,
} from '@/components/BasicForm'

defineOptions({ name: 'FormExamples' })

interface ProfileForm {
  name: string
  department: string
  level: string
  tags: string[]
  active: string
  joinedAt: string
  description: string
}

const formRef = ref<BasicFormExpose>()
const model = reactive<ProfileForm>({
  name: '',
  department: '',
  level: 'middle',
  tags: [],
  active: 'enabled',
  joinedAt: '',
  description: '',
})

const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  department: [{ required: true, message: '请选择部门', trigger: 'change' }],
  joinedAt: [{ required: true, message: '请选择入职日期', trigger: 'change' }],
}

const schema: BasicFormField[] = [
  { field: 'name', label: '姓名', type: 'input', props: { placeholder: '请输入姓名' } },
  {
    field: 'department',
    label: '部门',
    type: 'select',
    options: [
      { label: '产品中心', value: 'product' },
      { label: '研发中心', value: 'engineering' },
      { label: '运营中心', value: 'operation' },
    ],
    props: { placeholder: '请选择部门', style: 'width: 100%' },
  },
  {
    field: 'level',
    label: '职级',
    type: 'radio',
    options: [
      { label: '初级', value: 'junior' },
      { label: '中级', value: 'middle' },
      { label: '高级', value: 'senior' },
    ],
  },
  {
    field: 'tags',
    label: '标签',
    type: 'checkbox',
    options: [
      { label: '远程办公', value: 'remote' },
      { label: '导师', value: 'mentor' },
      { label: '核心成员', value: 'core' },
    ],
  },
  {
    field: 'active',
    label: '状态',
    type: 'switch',
    props: { activeValue: 'enabled', inactiveValue: 'disabled' },
  },
  { field: 'joinedAt', label: '入职日期', type: 'date', props: { style: 'width: 100%' } },
  { field: 'description', label: '备注', type: 'slot' },
]

async function submit(): Promise<void> {
  if (!(await formRef.value?.validate())) return
  ElMessage.success('表单校验通过')
}

function reset(): void {
  formRef.value?.resetFields()
}
</script>

<template>
  <div class="form-example-page">
    <header class="form-example-page__header">
      <div>
        <h1 class="page-title">BasicForm</h1>
        <p>Schema 字段、校验规则和自定义插槽</p>
      </div>
    </header>

    <section class="page-section">
      <BasicForm ref="formRef" :model="model" :schema="schema" :rules="rules" label-width="96px">
        <template #description="{ value, updateValue }">
          <el-input
            :model-value="value"
            type="textarea"
            :rows="4"
            maxlength="120"
            show-word-limit
            placeholder="请输入备注"
            @update:model-value="updateValue"
          />
        </template>

        <template #footer>
          <el-button :icon="Refresh" @click="reset">重置</el-button>
          <el-button type="primary" :icon="Check" @click="submit">提交</el-button>
        </template>
      </BasicForm>
    </section>

    <section class="page-section form-example-page__preview">
      <h2>当前模型</h2>
      <pre>{{ JSON.stringify(model, null, 2) }}</pre>
    </section>
  </div>
</template>

<style scoped>
.form-example-page {
  display: grid;
  gap: 14px;
}

.form-example-page__header p {
  margin: 6px 0 0;
  color: var(--el-text-color-secondary);
}

.form-example-page__preview h2 {
  margin: 0 0 12px;
  font-size: 15px;
}

.form-example-page__preview pre {
  margin: 0;
  overflow: auto;
  padding: 14px;
  border-radius: 4px;
  color: var(--el-text-color-regular);
  background: var(--el-fill-color-light);
  font-family: var(--el-font-family-monospace);
  font-size: 13px;
}
</style>
