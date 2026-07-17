# BasicTable

`BasicTable` 基于 Element Plus `ElTable` 封装，与 `BasicTableV2` 共用列、分页、选择、排序、工具栏和自适应高度协议。

实现已按 Element Plus 2.14.3 的 [Table 文档](https://element-plus.org/en-US/component/table.html) 和当前类型定义更新，不使用已废弃的 `tableProps` 运行时对象。

## 基础用法

```vue
<script setup lang="ts">
import BasicTable, {
  type BasicTableColumn,
  type BasicTablePagination,
} from '@/components/BasicTable'

interface User {
  id: number
  name: string
  status: string
}

const rows = ref<User[]>([])
const selectedKeys = ref<Array<string | number>>([])
const pagination = ref<BasicTablePagination>({
  currentPage: 1,
  pageSize: 20,
  total: 0,
})
const columns: BasicTableColumn<User>[] = [
  { key: 'selection', type: 'selection', width: 48 },
  { dataKey: 'name', title: '姓名', minWidth: 160, sortable: 'custom' },
  { dataKey: 'status', title: '状态', slot: 'status', width: 100 },
]
</script>

<template>
  <BasicTable
    v-model:pagination="pagination"
    v-model:selected-keys="selectedKeys"
    :data="rows"
    :columns="columns"
    row-key="id"
    title="用户列表"
    @refresh="loadUsers"
  >
    <template #status="{ row }">
      <el-tag>{{ row.status }}</el-tag>
    </template>
  </BasicTable>
</template>
```

## 统一列配置

| 字段                      | 说明                                              |
| ------------------------- | ------------------------------------------------- |
| `key`                     | 列稳定标识，特殊列建议显式设置                    |
| `dataKey`                 | 行字段，支持 `profile.name` 点路径                |
| `title`                   | 表头文字                                          |
| `type`                    | `selection`、`index`、`expand`                    |
| `width/minWidth/maxWidth` | 数值列宽；`maxWidth` 主要用于 V2                  |
| `fixed`                   | `true`、`left`、`right`                           |
| `sortable`                | `true` 或 `custom`                                |
| `slot/headerSlot`         | 单元格、表头插槽名                                |
| `formatter`               | 接收统一单元格上下文的渲染函数                    |
| `showOverflowTooltip`     | 普通表格使用原生 tooltip，V2 使用溢出检测 tooltip |
| `hidden/hideable`         | 初始隐藏、是否允许在列设置中切换                  |
| `nativeProps`             | 传给底层列的额外属性                              |

单元格插槽和 formatter 统一接收：

```ts
interface BasicTableCellContext<T> {
  row: T
  rowIndex: number
  column: BasicTableColumn<T>
  columnIndex: number
  value: unknown
}
```

## 原生能力

通过 `tableProps` 传递 `ElTable` 专属属性，例如 `stripe`、`border`、`treeProps`、`spanMethod` 和 `showSummary`。组件 ref 暴露 `clearSelection`、`toggleRowSelection`、`getSelectionRows`、`setCurrentRow`、`toggleRowExpansion`、`clearSort`、`clearFilter`、`doLayout` 和滚动方法。

`rowKey` 为两种表格的公共字段键。由于 V2 不支持函数式 `rowKey`，且行身份解析依赖直接字段，公共 API 不提供函数形式；建议始终传入行数据上的直接、稳定、唯一字段（例如 `id`），不要使用点路径。
