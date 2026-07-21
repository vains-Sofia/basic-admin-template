# Feedback

通用反馈体系由以下部分组成：

- `PageState`：统一加载、空数据和错误状态，错误状态支持重试。
- `GlobalRequestLoading`：由请求层的并发请求计数驱动。
- `NetworkStatus`：监听浏览器在线状态并提示断网。
- `AppErrorBoundary`：捕获组件渲染错误并提供刷新入口。
- `GlobalErrorNotice`：展示未捕获的运行时和异步错误。

页面请求建议通过 `useRequest` 管理，并在失败时渲染 `PageState`：

```vue
<script setup lang="ts">
import { PageState } from '@/components/Feedback'
import { useRequest } from '@/composables/useRequest'

const { data, error, status, execute } = useRequest(loadData)
</script>

<template>
  <PageState v-if="status === 'error'" status="error" :error="error" @retry="execute" />
  <DataView v-else :data="data" />
</template>
```

请求配置支持 `skipGlobalLoading` 和 `skipErrorMessage`。列表查询一般使用页面内状态，提交、删除等写操作保留全局 loading。
