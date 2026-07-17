<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import { useBasicDrawer } from '@/components/BasicDrawer'
import LoginIndex from '@/views/login/index.vue'
import { useBasicDialog } from '@/components/BasicDialog'

defineOptions({ name: 'DashboardView' })

const userStore = useUserStore()
const statistics = [
  { label: '今日访问', value: '2,846', change: '较昨日 +12.5%', tone: 'primary' },
  { label: '待处理事项', value: '18', change: '其中 5 项临近超时', tone: 'warning' },
  { label: '本周新增用户', value: '126', change: '较上周 +8.2%', tone: 'success' },
  { label: '系统告警', value: '3', change: '1 项需要立即处理', tone: 'danger' },
]

const activities = [
  { content: '管理员更新了用户角色配置', time: '10 分钟前' },
  { content: '系统完成每日数据备份', time: '1 小时前' },
  { content: '新增 12 个待审核用户', time: '3 小时前' },
  { content: '安全策略已完成自动检查', time: '昨天 18:30' },
]

const testDrawer = () => {
  useBasicDrawer({
    title: '登录',
    content: LoginIndex,
    confirmText: '确认',
    async onConfirm(user) {
      if (!user) return
      await Promise.resolve(user)
    },
  }).open('dashboard')
}

const testDialog = () => {
  useBasicDialog({
    title: '登录',
    content: LoginIndex,
    confirmText: '确认',
    async onConfirm(user) {
      if (!user) return
      await Promise.resolve(user)
    },
  }).open('dashboard')
}
</script>

<template>
  <div class="dashboard-page">
    <div class="dashboard-page__heading">
      <div>
        <h1 class="page-title">仪表盘</h1>
        <p>你好，{{ userStore.profile?.displayName }}，这里是当前系统运行概览。</p>
      </div>
      <el-tag type="success" effect="plain">系统运行正常</el-tag>
    </div>

    <section class="stat-grid" aria-label="关键指标">
      <el-card v-for="item in statistics" :key="item.label" shadow="never">
        <div class="stat-item__label">{{ item.label }}</div>
        <div class="stat-item__value">{{ item.value }}</div>
        <div :class="['stat-item__change', `is-${item.tone}`]">{{ item.change }}</div>
      </el-card>
    </section>

    <section class="dashboard-grid">
      <div class="page-section">
        <div class="section-heading">
          <h2 @click="testDialog">待办事项</h2>
          <el-button link type="primary" @click="testDrawer">查看全部</el-button>
        </div>
        <div class="dashboard-table">
          <el-table
            :data="[
              { title: '审核新用户申请', owner: '系统管理员', deadline: '今天 16:00', level: '高' },
              { title: '更新权限配置', owner: '系统管理员', deadline: '明天 12:00', level: '中' },
              { title: '核对月度报表', owner: '内容编辑', deadline: '07-19', level: '普通' },
            ]"
          >
            <el-table-column prop="title" label="事项" min-width="160" />
            <el-table-column prop="owner" label="负责人" width="110" />
            <el-table-column prop="deadline" label="截止时间" width="120" />
            <el-table-column prop="level" label="优先级" width="90" />
          </el-table>
        </div>
      </div>

      <div class="page-section">
        <div class="section-heading"><h2>最近动态</h2></div>
        <el-timeline>
          <el-timeline-item v-for="item in activities" :key="item.time" :timestamp="item.time">
            {{ item.content }}
          </el-timeline-item>
        </el-timeline>
      </div>
    </section>
  </div>
</template>

<style scoped>
.dashboard-page__heading,
.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dashboard-page__heading {
  margin-bottom: 18px;
}

.dashboard-page__heading p {
  margin: 6px 0 0;
  color: var(--el-text-color-secondary);
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 14px;
}

.stat-item__label,
.stat-item__change {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.stat-item__value {
  margin: 8px 0;
  font-size: 26px;
  font-weight: 600;
}

.stat-item__change.is-success {
  color: var(--el-color-success);
}
.stat-item__change.is-warning {
  color: var(--el-color-warning);
}
.stat-item__change.is-danger {
  color: var(--el-color-danger);
}
.stat-item__change.is-primary {
  color: var(--el-color-primary);
}

.dashboard-grid {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(280px, 1fr);
  gap: 14px;
}

.dashboard-grid > *,
.dashboard-table {
  min-width: 0;
}

.dashboard-table {
  max-width: 100%;
  overflow-x: auto;
}

.dashboard-table :deep(.el-table) {
  min-width: 520px;
}

.section-heading {
  margin-bottom: 14px;
}

.section-heading h2 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
}

@media (max-width: 1100px) {
  .stat-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
  .stat-grid {
    grid-template-columns: 1fr;
  }
  .dashboard-page__heading {
    align-items: flex-start;
  }
}
</style>
