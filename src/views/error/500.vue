<script setup lang="ts">
defineOptions({ name: 'ServerErrorView' })
</script>

<template>
  <main class="error-page">
    <el-result icon="error" title="500" sub-title="服务暂时无法处理当前请求">
      <template #extra>
        <el-button @click="$router.back()">返回上一页</el-button>
        <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
      </template>
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
