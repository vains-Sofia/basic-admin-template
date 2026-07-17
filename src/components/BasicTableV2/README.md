# BasicTableV2

`BasicTableV2` 基于 Element Plus 虚拟化表格 `ElTableV2`，适用于数千到数万行的固定列结构数据。它与 `BasicTable` 共用同一套列、分页、选择、排序、工具栏和事件 API。

实现遵循 Element Plus 2.14.3 的 [Virtualized Table 文档](https://element-plus.org/en-US/component/table-v2.html) 和当前 `Column<T>` / `TableV2Props` 类型。

## 基础用法

```vue
<script setup lang="ts">
import BasicTableV2, {
  type BasicTableColumn,
  type BasicTablePagination,
} from '@/components/BasicTableV2'

interface User {
  id: number
  name: string
  status: string
}

const rows = ref<User[]>([])
const selectedKeys = ref<Array<string | number>>([])
const pagination = ref<BasicTablePagination>({
  currentPage: 1,
  pageSize: 100,
  total: 0,
})
const columns: BasicTableColumn<User>[] = [
  { key: 'selection', type: 'selection', width: 48 },
  { dataKey: 'name', title: '姓名', minWidth: 160, flexGrow: 1 },
  { dataKey: 'status', title: '状态', slot: 'status', width: 100 },
]
</script>

<template>
  <BasicTableV2
    v-model:pagination="pagination"
    v-model:selected-keys="selectedKeys"
    :data="rows"
    :columns="columns"
    :table-props="{ rowHeight: 44, headerHeight: 44 }"
    row-key="id"
    title="用户列表"
  >
    <template #status="{ row }">
      <el-tag>{{ row.status }}</el-tag>
    </template>
  </BasicTableV2>
</template>
```

## V2 行为

- 未设置 `width` 的普通列默认宽度为 `150`，并默认使用 `flexGrow: 1` 填满可用空间。
- selection 列默认 `48px`，index 列默认 `64px`。
- 选择状态存放在 `selectedKeys`，不会向业务行写入 `checked`。
- `height` 必须最终为数值；自适应模式自动计算，关闭自适应后回退到 `minHeight`。
- `showOverflowTooltip` 使用真实溢出检测，仅内容被截断时显示。
- `type: 'expand'` 是普通表格能力；V2 树形展开应使用 `tableProps.expandColumnKey`、`expandedRowKeys` 等原生配置。

## 原生能力

通过 `tableProps` 传递 V2 专属属性，例如：

```ts
const tableProps = {
  rowHeight: 44,
  estimatedRowHeight: 48,
  cache: 4,
  scrollbarAlwaysOn: true,
  onEndReached(remainDistance: number) {
    // 加载更多
  },
}
```

组件 ref 暴露 `scrollTo`、`scrollToLeft`、`scrollToTop`、`scrollToRow`、`getSelectionRows`、`setSelectedKeys`、`clearSelection`、`resetColumns` 和 `measure`。

## 与 BasicTable 的统一和差异

| 能力                               | BasicTable                        | BasicTableV2           |
| ---------------------------------- | --------------------------------- | ---------------------- |
| columns / 插槽 / formatter         | 相同                              | 相同                   |
| pagination / selectedKeys / sortBy | 相同                              | 相同                   |
| 工具栏、列显隐、自适应高度         | 相同                              | 相同                   |
| selection 数据                     | Element Table 内部 + selectedKeys | selectedKeys，不修改行 |
| 树表、合并单元格、汇总             | 支持                              | 不支持或需 V2 原生方案 |
| 大数据虚拟滚动                     | 不支持                            | 支持                   |
| 底层扩展                           | `TableProps`                      | `TableV2Props`         |
