<script setup lang="ts">
import zhCn from 'element-plus/es/locale/lang/zh-cn'

import BasicDrawer from '@/components/BasicDrawer'
import BasicDialog from '@/components/BasicDialog'
import {
  AppErrorBoundary,
  GlobalErrorNotice,
  GlobalRequestLoading,
  NetworkStatus,
} from '@/components/Feedback'
</script>

<template>
  <el-config-provider :locale="zhCn">
    <AppErrorBoundary>
      <RouterView />
    </AppErrorBoundary>
    <GlobalRequestLoading />
    <GlobalErrorNotice />
    <NetworkStatus />
    <BasicDrawer />
    <BasicDialog />
  </el-config-provider>
</template>
