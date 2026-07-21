# BasicSearchForm

`BasicSearchForm` 基于 `BasicForm`，增加查询、重置、折叠和查询 loading。它适合放在列表页的筛选区域。

```vue
<BasicSearchForm
  :model="query"
  :schema="querySchema"
  :loading="loading"
  @search="loadData"
  @reset="resetQuery"
/>
```

默认超过 3 个字段时折叠多余字段，可通过 `collapseThreshold`、`showExpand` 和 `expanded` 调整。`searchOnReset` 默认开启，若页面需要在重置时自行处理请求，可以关闭它。
