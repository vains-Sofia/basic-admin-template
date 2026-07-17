<script setup lang="ts">
import { Delete, Edit, Plus, Refresh, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { computed, onMounted, reactive, ref } from 'vue'

import * as userApi from '@/api/modules/user'
import type { SaveUserData, UserItem, UserQuery } from '@/api/types/UserTypes'
import BasicTable, {
  type BasicTableColumn,
  type BasicTablePagination,
} from '@/components/BasicTable'

defineOptions({ name: 'SystemUsers' })

const loading = ref(false)
const saving = ref(false)
const users = ref<UserItem[]>([])
const total = ref(0)
const dialogVisible = ref(false)
const editingId = ref<number>()
const editFormRef = ref<FormInstance>()
const query = reactive<UserQuery>({ keyword: '', status: '', page: 1, pageSize: 10 })
const pagination = computed<BasicTablePagination>({
  get: () => ({
    currentPage: query.page,
    pageSize: query.pageSize,
    total: total.value,
    pageSizes: [10, 20, 50],
  }),
  set: (value) => {
    query.page = value.currentPage
    query.pageSize = value.pageSize
  },
})
const columns: BasicTableColumn<UserItem>[] = [
  { dataKey: 'username', title: '用户名', minWidth: 120 },
  { dataKey: 'displayName', title: '姓名', minWidth: 110 },
  { dataKey: 'email', title: '邮箱', minWidth: 190, showOverflowTooltip: true },
  { dataKey: 'role', title: '角色', width: 100 },
  { key: 'status', title: '状态', width: 100, slot: 'status' },
  { dataKey: 'createdAt', title: '创建时间', minWidth: 160 },
  { key: 'actions', title: '操作', width: 180, fixed: 'right', slot: 'actions' },
]
const emptyForm = (): SaveUserData => ({
  username: '',
  displayName: '',
  email: '',
  role: '编辑',
  status: 'enabled',
})
const editForm = reactive<SaveUserData>(emptyForm())
const editRules: FormRules<SaveUserData> = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  displayName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' },
  ],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
}

async function loadUsers(): Promise<void> {
  loading.value = true
  try {
    const result = await userApi.getUsers(query)
    users.value = result.list
    total.value = result.total
  } catch {
    ElMessage.error('用户数据加载失败')
  } finally {
    loading.value = false
  }
}

function search(): void {
  query.page = 1
  void loadUsers()
}

function resetQuery(): void {
  Object.assign(query, { keyword: '', status: '', page: 1 })
  void loadUsers()
}

function openCreate(): void {
  editingId.value = undefined
  Object.assign(editForm, emptyForm())
  dialogVisible.value = true
}

function openEdit(user: UserItem): void {
  editingId.value = user.id
  Object.assign(editForm, {
    username: user.username,
    displayName: user.displayName,
    email: user.email,
    role: user.role,
    status: user.status,
  })
  dialogVisible.value = true
}

async function save(): Promise<void> {
  if (!(await editFormRef.value?.validate().catch(() => false))) return
  saving.value = true
  try {
    if (editingId.value) await userApi.updateUser(editingId.value, editForm)
    else await userApi.createUser(editForm)
    ElMessage.success(editingId.value ? '用户已更新' : '用户已创建')
    dialogVisible.value = false
    await loadUsers()
  } finally {
    saving.value = false
  }
}

async function changeStatus(user: UserItem): Promise<void> {
  try {
    await userApi.updateUserStatus(user.id, user.status)
    ElMessage.success('状态已更新')
  } catch {
    user.status = user.status === 'enabled' ? 'disabled' : 'enabled'
  }
}

async function remove(user: UserItem): Promise<void> {
  try {
    await ElMessageBox.confirm(`确定删除用户“${user.displayName}”吗？`, '删除确认', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    })
  } catch {
    return
  }
  await userApi.deleteUser(user.id)
  ElMessage.success('用户已删除')
  await loadUsers()
}

onMounted(loadUsers)
</script>

<template>
  <div class="user-page">
    <section class="page-section user-page__filter">
      <el-form :model="query" inline @submit.prevent="search">
        <el-form-item label="关键词">
          <el-input v-model="query.keyword" clearable placeholder="用户名 / 姓名 / 邮箱" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" clearable placeholder="全部状态" style="width: 140px">
            <el-option label="启用" value="enabled" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" native-type="submit">查询</el-button>
          <el-button :icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </section>

    <BasicTable
      v-model:pagination="pagination"
      class="user-page__table"
      title="用户管理"
      :data="users"
      :columns="columns"
      :loading="loading"
      row-key="id"
      @refresh="loadUsers"
      @page-change="loadUsers"
      @page-size-change="loadUsers"
    >
      <template #title><h1 class="page-title">用户管理</h1></template>

      <template #toolbar-actions>
        <el-button
          v-permission="'system:user:create'"
          type="primary"
          :icon="Plus"
          @click="openCreate"
        >
          新增用户
        </el-button>
      </template>

      <template #status="{ row }">
        <el-switch
          v-model="row.status"
          v-permission="'system:user:status'"
          active-value="enabled"
          inactive-value="disabled"
          @change="changeStatus(row)"
        />
      </template>

      <template #actions="{ row }">
        <el-button
          v-permission="'system:user:edit'"
          link
          type="primary"
          :icon="Edit"
          @click="openEdit(row)"
        >
          编辑
        </el-button>
        <el-button
          v-permission="'system:user:delete'"
          link
          type="danger"
          :icon="Delete"
          @click="remove(row)"
        >
          删除
        </el-button>
      </template>
    </BasicTable>

    <el-dialog
      v-model="dialogVisible"
      :title="editingId ? '编辑用户' : '新增用户'"
      width="min(520px, 92vw)"
      destroy-on-close
    >
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="76px">
        <el-form-item label="用户名" prop="username"
          ><el-input v-model="editForm.username"
        /></el-form-item>
        <el-form-item label="姓名" prop="displayName"
          ><el-input v-model="editForm.displayName"
        /></el-form-item>
        <el-form-item label="邮箱" prop="email"><el-input v-model="editForm.email" /></el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="editForm.role" style="width: 100%">
            <el-option label="管理员" value="管理员" />
            <el-option label="编辑" value="编辑" />
            <el-option label="审计员" value="审计员" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态"
          ><el-switch v-model="editForm.status" active-value="enabled" inactive-value="disabled"
        /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.user-page {
  display: grid;
  min-width: 0;
  gap: 14px;
}

.user-page__filter {
  padding-bottom: 2px;
}

.user-page__filter :deep(.el-form-item) {
  margin-bottom: 18px;
}

.user-page__table {
  overflow: hidden;
}

@media (max-width: 767px) {
  .user-page__filter :deep(.el-form--inline) {
    display: block;
  }

  .user-page__filter :deep(.el-form-item) {
    display: flex;
    margin-right: 0;
  }

  .user-page__filter :deep(.el-form-item__content) {
    min-width: 0;
  }

  .user-page__filter :deep(.el-input),
  .user-page__filter :deep(.el-select) {
    width: 100% !important;
  }
}
</style>
