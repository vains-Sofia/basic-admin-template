<script setup lang="ts">
import { Delete, Edit, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, onMounted, reactive } from 'vue'

import * as userApi from '@/api/modules/user'
import type { UserItem, UserQuery } from '@/api/types/UserTypes'
import { useBasicDrawer } from '@/components/BasicDrawer'
import BasicSearchForm, { type BasicSearchField } from '@/components/BasicSearchForm'
import BasicTable, {
  type BasicTableColumn,
  type BasicTablePagination,
} from '@/components/BasicTable'
import { PageState } from '@/components/Feedback'
import { useRequest } from '@/composables/useRequest'

import UserEditorDrawer, { type UserEditorPayload } from './components/UserEditorDrawer.vue'

defineOptions({ name: 'SystemUsers' })

const query = reactive<UserQuery>({ keyword: '', status: '', page: 1, pageSize: 10 })
const {
  data: userPage,
  error: loadError,
  status: loadStatus,
  loading,
  execute: executeLoadUsers,
} = useRequest(() => userApi.getUsers(query))
const users = computed(() => userPage.value?.list ?? [])
const total = computed(() => userPage.value?.total ?? 0)

const querySchema: BasicSearchField[] = [
  {
    field: 'keyword',
    label: '关键词',
    type: 'input',
    props: { clearable: true, placeholder: '用户名 / 姓名 / 邮箱', style: 'width: 220px' },
  },
  {
    field: 'status',
    label: '状态',
    type: 'select',
    options: [
      { label: '启用', value: 'enabled' },
      { label: '禁用', value: 'disabled' },
    ],
    props: { clearable: true, placeholder: '全部状态', style: 'width: 140px' },
  },
]

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

const drawer = useBasicDrawer<UserEditorPayload>({
  drawerKey: 'system-user-editor',
  title: '新增用户',
  size: '520px',
  bodyPadding: 20,
  destroyOnClose: true,
  showFooter: true,
  cancelText: '取消',
  confirmText: '保存',
  content: UserEditorDrawer,
  onConfirm: async (payload) => {
    if (!payload) return
    if (payload.id) await userApi.updateUser(payload.id, payload.data)
    else await userApi.createUser(payload.data)
    ElMessage.success(payload.id ? '用户已更新' : '用户已创建')
  },
  onCancel: (_payload, controller) => {
    controller.clearPayload()
  },
  onClosed: () => loadUsers(),
})

async function loadUsers(): Promise<void> {
  await executeLoadUsers().catch(() => undefined)
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
  drawer.setOptions({ title: '新增用户' })
  drawer.open({
    data: { username: '', displayName: '', email: '', role: '编辑', status: 'enabled' },
  })
}

function openEdit(user: UserItem): void {
  drawer.setOptions({ title: '编辑用户' })
  drawer.open({
    id: user.id,
    data: {
      username: user.username,
      displayName: user.displayName,
      email: user.email,
      role: user.role,
      status: user.status,
    },
  })
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
      <BasicSearchForm
        :model="query"
        :schema="querySchema"
        :search-on-reset="false"
        @search="search"
        @reset="resetQuery"
      />
    </section>

    <PageState
      v-if="loadStatus === 'error'"
      status="error"
      :error="loadError"
      error-text="用户数据加载失败"
      @retry="loadUsers"
    />

    <BasicTable
      v-else
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

.user-page__table {
  overflow: hidden;
}
</style>
