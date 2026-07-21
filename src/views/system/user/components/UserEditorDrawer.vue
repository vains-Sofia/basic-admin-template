<script setup lang="ts">
import { nextTick, reactive, ref, watch } from 'vue'

import type { SaveUserData } from '@/api/types/UserTypes'
import BasicForm, { type BasicFormExpose, type BasicFormField } from '@/components/BasicForm'
import type { BasicDrawerController } from '@/components/BasicDrawer'

export interface UserEditorPayload {
  id?: number
  data: SaveUserData
}

defineOptions({ name: 'UserEditorDrawer' })

const props = defineProps<{
  payload?: UserEditorPayload
  drawer: BasicDrawerController<UserEditorPayload>
}>()

const formRef = ref<BasicFormExpose>()
const form = reactive<SaveUserData>(emptyForm())

function emptyForm(): SaveUserData {
  return {
    username: '',
    displayName: '',
    email: '',
    role: '编辑',
    status: 'enabled',
  }
}

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  displayName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email' as const, message: '邮箱格式不正确', trigger: 'blur' },
  ],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
}
const schema: BasicFormField[] = [
  { field: 'username', label: '用户名', type: 'input', props: { autocomplete: 'username' } },
  { field: 'displayName', label: '姓名', type: 'input' },
  { field: 'email', label: '邮箱', type: 'input', props: { autocomplete: 'email' } },
  {
    field: 'role',
    label: '角色',
    type: 'select',
    options: [
      { label: '管理员', value: '管理员' },
      { label: '编辑', value: '编辑' },
      { label: '审计员', value: '审计员' },
    ],
    props: { style: 'width: 100%' },
  },
  {
    field: 'status',
    label: '状态',
    type: 'switch',
    props: { activeValue: 'enabled', inactiveValue: 'disabled' },
  },
]

watch(
  () => props.payload,
  async (payload) => {
    Object.assign(form, payload?.data ?? emptyForm())
    await nextTick()
    formRef.value?.clearValidate()
  },
  { immediate: true },
)

async function validate(): Promise<boolean> {
  return (await formRef.value?.validate()) ?? false
}

function getPayload(): UserEditorPayload {
  return {
    id: props.payload?.id,
    data: { ...form },
  }
}

defineExpose({ validate, getPayload })
</script>

<template>
  <BasicForm ref="formRef" :model="form" :schema="schema" :rules="rules" label-width="76px" />
</template>
