<script setup lang="ts">
import zhCn from 'element-plus/es/locale/lang/zh-cn'

import BasicDrawer from '@/components/BasicDrawer'
import BasicDialog from '@/components/BasicDialog'
</script>

<template>
  <el-config-provider :locale="zhCn">
    <RouterView />
    <BasicDrawer />
    <BasicDialog />
  </el-config-provider>
</template>
