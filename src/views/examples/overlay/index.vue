<script setup lang="ts">
import { ChatLineSquare, Expand } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

import { useBasicDialog } from '@/components/BasicDialog'
import { useBasicDrawer } from '@/components/BasicDrawer'

defineOptions({ name: 'OverlayExamples' })

const dialog = useBasicDialog({
  title: '确认提交',
  width: '480px',
  bodyPadding: 20,
  showFooter: true,
  content: '当前配置已通过校验，可以提交。',
  async onConfirm() {
    await new Promise((resolve) => window.setTimeout(resolve, 600))
    ElMessage.success('提交成功')
  },
})

const drawer = useBasicDrawer({
  title: '任务详情',
  size: '420px',
  bodyPadding: 20,
  showFooter: true,
  showClose: true,
  content: '这里可以承载表单、详情或其他业务组件。',
  async onConfirm() {
    await new Promise((resolve) => window.setTimeout(resolve, 600))
    ElMessage.success('保存成功')
  },
})
</script>

<template>
  <div class="example-page">
    <header class="example-page__header">
      <h1 class="page-title">弹层示例</h1>
    </header>

    <div class="overlay-grid">
      <section class="page-section overlay-example">
        <div>
          <h2>BasicDialog</h2>
          <p>适合确认操作、短表单和需要聚焦处理的内容。</p>
        </div>
        <el-button type="primary" :icon="ChatLineSquare" @click="dialog.open()">
          打开对话框
        </el-button>
      </section>

      <section class="page-section overlay-example">
        <div>
          <h2>BasicDrawer</h2>
          <p>适合详情查看、长表单和保留页面上下文的操作。</p>
        </div>
        <el-button type="primary" :icon="Expand" @click="drawer.open()">打开抽屉</el-button>
      </section>
    </div>
  </div>
</template>

<style scoped>
.example-page__header {
  margin-bottom: 18px;
}

.overlay-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.overlay-example {
  display: flex;
  min-height: 148px;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.overlay-example h2 {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
}

.overlay-example p {
  margin: 0;
  color: var(--el-text-color-secondary);
  font-size: 14px;
  line-height: 1.6;
}

.overlay-example .el-button {
  flex: 0 0 auto;
}

@media (max-width: 767px) {
  .overlay-grid {
    grid-template-columns: 1fr;
  }

  .overlay-example {
    min-height: 0;
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
