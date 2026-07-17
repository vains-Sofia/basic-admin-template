<script setup lang="ts">
defineOptions({ name: 'ForbiddenView' })
</script>

<template>
  <main class="error-page">
    <el-result icon="warning" title="403" sub-title="你没有访问此页面的权限">
      <template #extra
        ><el-button type="primary" @click="$router.push('/')">返回首页</el-button></template
      >
    </el-result>
  </main>
</template>

<style scoped>
.error-page {
  display: grid;
  min-height: 100vh;
  place-items: center;
}
</style>
